---
slug: ruteo-interno-externo
title: Ruteo interno y externo (RIP, OSPF, BGP)
category: ruteo
order: 10
diagrams: []
---

## Por qué importa

Cada router debe decidir, para cada paquete que recibe, **a qué interfaz lo manda**. Esto requiere una **tabla de ruteo** consistente con la topología real. Pero las topologías cambian: enlaces caen, nuevas redes aparecen, hay congestión. **Mantener esas tablas actualizadas automáticamente** es trabajo de los protocolos de ruteo.

Distinguir los protocolos es clave: dentro de una empresa (RIP, OSPF) los routers se confían entre sí y comparten información completa; entre empresas (BGP) hay políticas, contratos, y desconfianza mutua. Por eso BGP es radicalmente distinto a los demás.

## Intuición

Imaginate una empresa de mensajería. Los carteros dentro de una sucursal comparten libremente "el cliente Juan vive ahí" — son colegas. Eso es **ruteo interior**. Pero entre empresas competidoras solo se intercambia lo justo: "yo puedo llevar paquetes hacia esa zona, pero no te digo cómo lo hago". Eso es **ruteo exterior**.

Dentro: optimización pura (camino más corto). Entre: política y contratos pesan más que la métrica.

## Forwarding vs Routing

Dos conceptos que conviene separar:

- **Forwarding** (reenvío): la acción **local** de tomar un paquete entrante y mandarlo por la interfaz correspondiente según la tabla. Es la operación del data plane, debe ser rapidísima (millones de paquetes/seg).
- **Routing** (ruteo): el proceso **distribuido** de construir y mantener las tablas. Es el control plane, puede ser más lento (segundos a minutos para converger).

Los routers separan ambos planos: el data plane corre en hardware (ASICs); el control plane en software (un proceso en el sistema operativo del router).

## Estático vs dinámico

- **Ruteo estático:** las rutas se configuran a mano. Simple, predecible, pero no se adapta a cambios.
- **Ruteo dinámico:** los routers se hablan entre sí y aprenden rutas automáticamente. Más complejo, más robusto, más caro en recursos.

Combinación típica: la **default route** (0.0.0.0/0) suele ser estática hacia el ISP; lo interno se aprende dinámicamente.

## Ruteo intra-AS (IGP)

Un **AS (Autonomous System)** es una red administrada por una única organización (un ISP, una empresa grande, una universidad). Dentro del AS se usa **IGP (Interior Gateway Protocol)**: RIP, OSPF, IS-IS, EIGRP.

### RIP (Distance-Vector con Bellman-Ford)

Protocolo simple, viejo (1988), didáctico. Cada router conoce sus vecinos y les manda periódicamente (cada 30s) un vector con sus **distancias** (en saltos) a todas las redes que conoce.

**Algoritmo de Bellman-Ford distribuido:**

```
Cada router R mantiene una tabla: para cada destino D,
   distancia d(D) y next hop H(D).

1. Inicialmente, R conoce solo las redes directamente conectadas (d=0 o 1).
2. Periódicamente, R recibe vectores de cada vecino V:
   "Yo puedo llegar a D en distancia d_V(D)."
3. Para cada D, R calcula: nueva distancia = d(R, V) + d_V(D).
4. Si es menor que la actual, R actualiza: d(D) = nueva, H(D) = V.
5. R manda su vector actualizado a sus vecinos.
```

Métrica: **número de saltos**. Máximo 15 (16 = infinito). Por eso no escala a redes grandes.

**Pros:** simple, fácil de implementar.

**Contras:** convergencia lenta, sufre **count-to-infinity**, métrica pobre.

### Problema de conteo a infinito

```
A --- B --- C
```

Supongamos que A está conectado a una red N. B sabe llegar a N por A (distancia 1). C sabe llegar por B (distancia 2).

Si el enlace A↔B cae:

1. B pierde su ruta a N. Pero C sigue diciéndole "yo puedo llegar a N en 2".
2. B "aprende" la ruta de C: ahora cree que puede llegar a N en 3, vía C.
3. C escucha esto, actualiza su ruta a N en 4, vía B.
4. Y así, las distancias suben "hacia infinito" sin que nadie note.

Esto se resuelve hasta llegar a la métrica de infinito (16 saltos). **Mientras tanto, hay loops**.

### Mitigaciones

- **Split Horizon:** un router no anuncia una ruta a un vecino si la aprendió **de** ese vecino. Si C aprendió N por B, no le diga a B "yo sé llegar a N".
- **Poison Reverse:** versión más fuerte: explícitamente anuncia "distancia infinita" para esas rutas en lugar de omitirlas.
- **Hold-down timers:** cuando una ruta muere, ignorar actualizaciones por X segundos para evitar reactivarla con info vieja.
- **Triggered updates:** mandar actualización inmediata al detectar cambio, no esperar el ciclo de 30s.

Aún con todo esto, Distance-Vector tiene límites; por eso se inventó Link-State.

### OSPF (Link-State, Dijkstra)

OSPF (Open Shortest Path First) usa otro enfoque: cada router conoce la **topología completa** del AS y calcula la mejor ruta con Dijkstra.

**Funcionamiento:**

```
1. Cada router descubre a sus vecinos (HELLO packets).
2. Cada router crea un LSP (Link-State Packet) describiendo
   sus enlaces directos y sus métricas.
3. Inunda (flooding) ese LSP a toda la red.
4. Tras converger, cada router tiene la misma "base de datos
   de estado de enlaces" (LSDB), un grafo de toda la red.
5. Cada router corre Dijkstra desde sí mismo y obtiene
   la mejor ruta a cada destino.
```

**Métrica:** costo configurable (típicamente proporcional al inverso del ancho de banda). Más rica que "saltos".

**Áreas (jerarquía):** OSPF divide redes grandes en áreas. Área 0 = backbone; otras áreas (1, 2, ...) se conectan **solo** al backbone. Esto reduce LSDB en cada router y limita el flooding.

**Pros:** convergencia rápida (segundos), métrica fina, escala bien con áreas.

**Contras:** más complejo, requiere más CPU y memoria.

## Comparativa DV vs LS

| Aspecto | Distance-Vector (RIP) | Link-State (OSPF) |
|---------|-----------------------|-------------------|
| Conocimiento | Local (solo vecinos) | Global (toda la topología) |
| Mensajes | Vector de distancias | LSP de enlaces |
| Algoritmo | Bellman-Ford distribuido | Dijkstra local |
| Métrica | Saltos | Costo configurable |
| Convergencia | Lenta, sufre loops | Rápida, sin loops |
| Memoria | Baja (solo tabla) | Alta (LSDB completa) |
| CPU | Baja | Alta (Dijkstra) |
| Escala | Mala (< 16 saltos) | Buena (con áreas) |

## Ruteo inter-AS: BGP

**Border Gateway Protocol** conecta ASes. **No** busca la ruta más corta: busca la ruta **políticamente aceptable**.

**Conceptos:**

- **AS Path:** secuencia de ASes que el paquete atravesará. BGP lo anuncia explícitamente. Sirve para evitar loops y aplicar políticas.
- **Peering (peer):** dos ASes intercambian tráfico **gratis**.
- **Transit (proveedor / cliente):** un AS pequeño paga a uno grande para alcanzar el resto de internet.
- **NAP (Network Access Point) / IXP (Internet Exchange Point):** lugares físicos donde muchos ASes se conectan e intercambian rutas BGP. Ej: CABASE en Argentina, AMS-IX en Amsterdam.

**Atributos de rutas BGP:** AS Path, LOCAL_PREF, MED, NEXT_HOP, ORIGIN. Las decisiones de qué ruta preferir siguen un orden estricto basado en estos atributos, donde **AS Path corto es solo un criterio entre varios**.

**Tipos de BGP:**

- **eBGP:** entre ASes distintos.
- **iBGP:** dentro del mismo AS, para que los routers de borde se cuenten qué aprendieron por eBGP.

**Convergencia BGP** es notoriamente lenta (minutos a horas en algunos casos). Una mala configuración (route leak, ruta más específica falsa) puede afectar internet global. Casos famosos: el "hijack" de YouTube por Pakistan Telecom (2008), las caídas de Cloudflare/Facebook por errores BGP.

## Resumen de protocolos

| Protocolo | Tipo | Algoritmo | Métrica | Uso típico |
|-----------|------|-----------|---------|------------|
| RIP | IGP | DV (Bellman-Ford) | saltos | LANs pequeñas |
| OSPF | IGP | LS (Dijkstra) | costo (BW) | Empresas, ISPs |
| IS-IS | IGP | LS (Dijkstra) | costo | ISPs grandes |
| EIGRP | IGP | DUAL (Cisco) | compuesta | Redes Cisco |
| BGP | EGP | path-vector | política | Entre ASes |

## Casos clave / Ejemplos

**Ejemplo 1: Dijkstra a mano.** Grafo: A-B (1), A-C (5), B-C (2), C-D (1), B-D (10).

```
Desde A:
- Inicial: A=0, B=∞, C=∞, D=∞.
- Procesar A: B=1, C=5.
- Procesar B (menor): C = min(5, 1+2) = 3. D = 1+10 = 11.
- Procesar C: D = min(11, 3+1) = 4.
- Procesar D: nada que mejorar.
Final: A=0, B=1, C=3, D=4. Ruta a D: A→B→C→D.
```

**Ejemplo 2: count-to-infinity con dos routers.**

```
A --- B --- N
```

Si cae el enlace B-N:

- B borra su ruta a N.
- A sigue diciéndole a B "yo puedo a N en 2 (vía B)".
- B aprende ruta a N por A: distancia 3.
- A escucha y actualiza: ruta a N por B, distancia 4.
- Y así hasta 16. Con split horizon, A no le diría a B nada de N (porque lo aprendió de B), y se evita.

**Ejemplo 3: política BGP.** AS1 (Telecom Argentina) y AS2 (Telefónica) tienen peering. AS1 acepta de AS2 solo rutas a clientes de Telefónica, no rutas de tránsito a EE.UU. Aunque AS Path de tránsito sea más corto, **la política lo filtra**: no se debe pagar por tráfico que no le corresponde.

## Errores frecuentes

- Confundir forwarding (data plane) con routing (control plane). Forwarding es por paquete; routing es por evento topológico.
- Pensar que OSPF es global. **Es por AS**: cada AS corre su propio OSPF independiente.
- Suponer que BGP busca el camino más corto. **No**: busca el políticamente preferido según atributos.
- Olvidar el split horizon en problemas de RIP. Sin él, count-to-infinity es la norma.
- Confundir métrica con saltos. OSPF usa **costo**, no saltos. Un enlace lento puede tener más costo que dos rápidos.
- Pensar que iBGP es solo "BGP interno trivial". Tiene reglas distintas (no propaga rutas iBGP a otros peers iBGP por defecto, requiere full mesh o route reflectors).

## Pregunta-trampa típica

> "¿RIP funciona en internet?"

No. Métrica limitada a 15, convergencia lenta, no escala. Internet usa **OSPF/IS-IS** dentro de ASes y **BGP** entre ASes. RIP queda como didáctico y para redes pequeñas legacy.

> "¿Por qué BGP es tan lento en converger?"

Porque procesa **políticas** (no solo distancias), aplica timers de estabilidad (MRAI), y un cambio en un AS lejano puede provocar cascadas de re-cómputo en todo el internet. Estabilizar tras un fail puede llevar minutos. Por eso "BGP melting" es un problema operacional real.

> "¿Puede haber loops en BGP?"

Casi nunca, porque cada AS revisa el AS Path y descarta rutas que **ya contienen su propio número**. Es un anti-loop natural del path-vector.

## Distance-Vector: ejemplo de Tanenbaum (Righetti lo usa)

En clase Righetti recorre paso a paso este ejemplo clásico (atribuido a Tanenbaum, 4ª edición). El router **J** calcula su nueva ruta a **G** asumiendo que está "en régimen" y los costos son **delays en milisegundos**:

- J midió o estimó los delays a sus vecinos A, I, H y K en **8, 10, 12 y 6 ms** respectivamente.
- A informa delay 18 ms a G. I informa 31. H informa 12. K informa 31.
- J calcula sus retardos a G a través de cada vecino:
  - vía A: $8 + 18 = 26$ ms
  - vía I: $10 + 31 = 41$ ms
  - vía H: $12 + 6 = 18$ ms
  - vía K: $6 + 31 = 37$ ms
- El **mínimo es 18 ms vía H**. J escribe en su tabla: destino G, costo 18, next-hop H.

Este es exactamente el **paso elemental** del Bellman-Ford distribuido: cada nodo combina su costo al vecino con la distancia anunciada por el vecino, y elige el mínimo.

## Mitigaciones de conteo a infinito (detalle del docente)

Righetti destaca explícitamente:

- **Fijar 16 como infinito** en RIP. "Cuando el costo llega a 16 se asume que no hay ruta al nodo". Esto limita RIP a redes de tamaño pequeño (máximo 15 saltos útiles).
- **Split Horizon (Partir el horizonte):** omite enviar información de distancia que fue aprendida por el nodo al cual se le envía el vector.
- **Split Horizon con Poison Reverse (Reverso venenoso):** **sí** notifica entradas aprendidas desde ese vecino, pero **a esos destinos les pone costo infinito**.
- Subraya un punto clave: estas **dos últimas técnicas solo solucionan ciclos que involucran dos nodos**. Para ciclos más complejos, no alcanzan: por eso se inventó Link-State.

## RIP como daemon

Righetti enfatiza un detalle de implementación: **RIP corre como un proceso (daemon) en user-space sobre UDP**, puerto reservado **520**. Es decir, RIP se transporta como datos de UDP, que va sobre IP. Esto contrasta con OSPF, que va **directamente sobre IP** como protocolo 89.

Pila para RIP: `IP → UDP → RIP` (RIP es "application-level" desde el punto de vista de la pila).

## Estado del Enlace: algoritmo detallado

Pasos que Righetti enumera para Link-State (válidos para OSPF):

1. **Descubrir** a sus vecinos y conocer sus direcciones de red (HELLO packets).
2. **Medir el costo** para cada uno de sus vecinos.
3. **Construir un paquete LSP** (Link State Packet) que indique todo lo aprendido.
4. **Enviar el LSP a todos los demás routers** mediante inundación (flooding).
5. **Calcular la ruta más corta** a todos los nodos (Dijkstra).

**Contenido del LSP** (según Righetti):

- ID del router que creó el LSP
- Costo del enlace a cada vecino directamente conectado
- Número de secuencia (SEQNO)
- Time-To-Live (TTL) para este paquete

**Inundación confiable (Reliable Flooding):**

- Cada router **almacena el LSP más reciente** de cada nodo (compara SEQNOs).
- Decrementa TTL de cada LSP almacenado; descarta cuando TTL=0.
- Reenvía LSP a todos excepto a quien se lo envió.
- Genera un nuevo LSP **periódicamente**, incrementando SEQNO. Inicia SEQNO en 0 cuando se reinicia.

## Forward Search Algorithm (Dijkstra para LS)

Righetti señala que en la práctica el cálculo de la tabla de ruteo se hace conforme los LSPs van llegando, usando una variante de Dijkstra llamada **forward search algorithm**: se manejan dos listas, **tentativos** y **confirmados**, donde cada entrada es de la forma `(Destination, Cost, NextHop)`.

```
M = {s}                                       // s = self
para cada n en N - {s}:
    C(n) = l(s, n)                            // costo del arco directo (∞ si no hay)
mientras (N != M):
    M = M ∪ {w} tal que C(w) es mínimo en N - M
    para cada n en (N - M):
        C(n) = min(C(n), C(w) + l(w, n))
```

## Métricas ARPANET

Righetti compara dos métricas históricas:

- **Métrica ARPANET "original":** mide el **número de paquetes encolados** hacia cada enlace. **No toma en cuenta latencia ni ancho de banda**: una métrica pobre.
- **Métrica ARPANET "nueva" (revised ARPANET routing metric):**
  - Marca cada paquete entrante con su tiempo de llegada (AT).
  - Graba tiempo de salida (DT).
  - Cuando llega el ACK del enlace de datos, calcula: `Delay = (DT - AT) + Transmit + Latency`.
  - Si hay timeout, resetea DT al tiempo de salida para la retransmisión.
  - El costo del enlace es el **retardo promediado** sobre algún período.
  - Mejora fina: reduce el "rango dinámico" del costo y emplea la **utilización del enlace** en lugar del retardo crudo.

## OSPF: detalles específicos

Righetti destaca características de OSPF que no aparecen en RIP:

- **Open**: código disponible públicamente (a diferencia de protocolos propietarios como IGRP de Cisco).
- **Soporta autenticación**: todos los mensajes OSPF están autenticados para prevenir intrusiones malignas. RIP no.
- **Múltiples caminos del mismo costo** (ECMP, Equal-Cost Multi-Path). RIP usa solo uno.
- **Varias métricas de costo por enlace según ToS (Type of Service)**: por ejemplo, costo del enlace satelital "rebajado" para alto throughput; costo alto para aplicaciones de tiempo real.
- **Soporte integrado de multicast (MOSPF)**: usa la misma base de datos topológica.

**Tipos de mensaje OSPF** (Righetti los nombra explícitamente):

- **HELLO**: descubrir vecinos.
- **LINK STATE UPDATE**: anuncio periódico de estado.
- **DATABASE DESCRIPTION**: números de secuencia de las entradas LSDB, para sincronización inicial.
- **LINK STATE REQUEST**: pedir información específica al vecino.
- **LINK STATE ACK**: confirma recepción de updates. Los tres anteriores se confirman con ACKs para confiabilidad.

## OSPF Jerárquico: intercambio escalabilidad-optimalidad

Righetti recalca: **jerarquizar implica ocultar información**, lo cual **afecta la optimalidad de las decisiones**. Es un trade-off explícito: escalabilidad vs ruta óptima.

Estructura:

- **Dos niveles**: área Local (1, 2, 3, ...) y área Troncal (Área 0).
- **Anuncios de LSP solo dentro del área**: limita el flooding y la LSDB.
- **Cada nodo conoce la topología detallada de su área**, pero solo la **dirección/camino más corto** a las redes de otras áreas.
- **Tipos de routers**:
  - **Routers Internos**: solo dentro de un área.
  - **Routers de Frontera de Área**: conectan un área local al troncal; "resumen" las distancias internas y las anuncian a otros routers de Frontera de Área.
  - **Routers Troncales**: ejecutan ruteo OSPF dentro del área troncal.
  - **Routers Frontera (de AS)**: conectan a otros AS (interfaz con BGP).

## EGP (predecesor de BGP)

Righetti lo menciona como antecedente histórico:

- **EGP** (Exterior Gateway Protocol) fue diseñado para una internet estructurada como **árbol**.
- Se preocupa de **alcanzar nodos**, no de optimizar rutas.
- Mensajes: **adquisición de vecinos** (un router requiere a otro como par), **alcance de vecinos** (HELLO/ACK periódicos), **actualización de rutas** (intercambio de tablas estilo distance-vector).
- BGP lo reemplazó porque internet **dejó de ser un árbol**: hoy es una malla de ASes con políticas.

## Tipos de AS en BGP

Righetti los distingue claramente, y aparece como pregunta frecuente:

- **Stub AS**: una sola conexión a otro AS. Transporta **solo tráfico local** (origen o destino propio).
- **Multihomed AS**: conexiones a más de un AS. **No transporta tráfico en tránsito**: solo el suyo.
- **Transit AS**: conexiones a más de un AS y **sí transporta tráfico en tránsito** (de otros AS). Típicamente los ISPs grandes.

## BGP: rol del Portavoz

Cada AS tiene **uno o más Routers de Borde**, y al menos un **"Portavoz BGP"** que publica:

- Redes locales del propio AS.
- Otras redes alcanzables (solo si es Transit AS).
- Información de rutas (**AS Path**).

Un Portavoz puede **cancelar una ruta publicada antes**. Esto permite reaccionar a fallas: si una ruta deja de ser válida, se anuncia su retiro.

## NAP / IXP: ejemplo argentino

Righetti destaca **CABASE** (Cámara Argentina de Internet) como ejemplo local de NAP/IXP, donde los proveedores intercambian tráfico cooperativamente. Cita un ejemplo concreto de ruta:

```
BUE → ARIU → UBA (157.92/16)
```

Los NAPs persiguen "eficientizar el ruteo de Internet, mejorando la calidad de servicio y minimizar los costos de interconexión".

## Énfasis del docente (Righetti)

- **"Autonomía y heterogeneidad" como idea clave de los AS**: él recalca que "los detalles de lo que pasa adentro de un AS permanecen ocultos para otros AS", y que "los AS pueden manejar tecnologías heterogéneas".
- **Forwarding vs Routing como separación didáctica fundamental**: Forwarding es "lógica, modificable" (data plane); Routing es lo que construye y actualiza las tablas. Esta dicotomía es clave para entender por qué los routers separan hardware (ASICs) y software (procesos de control).
- **Comparación lado a lado DV vs LS**: Righetti tiene una tabla específica que contrasta qué informa (estado de sus enlaces directos vs toda su tabla de ruteo), a quién (solo vecinos vs toda la red mediante inundación), qué algoritmo (Bellman-Ford distribuido vs Dijkstra centralizado-localmente). Esta tabla es probable como pregunta.
- **El ejemplo de J calcula ruta a G**: Righetti lo usa como caso testigo para DV. Memorizar la cuenta: vía A=26, vía I=41, vía H=18, vía K=37 → gana H con 18.
- **Conteo a infinito (Count-to-Infinity)**: él destaca dos escenarios:
  - Caso feliz: estable. F detecta que su enlace a G falla, fija distancia ∞, converge en pocos ciclos.
  - Caso no feliz: inestable. El enlace A-E falla y la distancia "cuenta hasta infinito" lentamente.
- **Split Horizon solo resuelve ciclos de 2 nodos**: punto que él subraya como limitación.
- **OSPF transportado directamente sobre IP (protocolo 89)**: vs RIP que va sobre UDP/520. Detalle de pila importante.
- **Intercambio escalabilidad vs optimalidad**: él lo plantea explícitamente para OSPF jerárquico. "Jerarquizar implica ocultar información, se afecta la optimalidad de las decisiones".
- **BGP no es shortest path**: enfatiza que **BGP elige según políticas**, no según distancia mínima. Los atributos (LOCAL_PREF, AS Path, MED, etc.) son la herramienta.
- **CABASE/IXP**: usa el caso argentino como ejemplo concreto. Posible pregunta de "explique qué es un NAP".
- **Referencia al paper de Lijding-Righetti 1997**: "Un nuevo protocolo de ruteo Interno". Él se cita a sí mismo, lo cual sugiere que el tema ruteo interno es uno de sus terrenos favoritos.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Hijack famoso de YouTube (2008)
En febrero 2008, Pakistan Telecom intentó bloquear YouTube dentro de Pakistan anunciando por BGP "yo tengo la ruta a 208.65.153.0/24" (la red de YouTube) con AS path corto. Por error, ese anuncio se propagó **a internet entero**. Los ISPs prefirieron esa ruta más específica y mandaron el tráfico mundial de YouTube a Pakistan, que lo descartaba. YouTube quedó "caído" globalmente durante 2 horas.

**Por qué importa acá**: muestra que BGP no es shortest path sino *most preferred*, y que un error en un AS puede hijackear tráfico global. Es el ejemplo canónico de por qué BGP necesita filtros (RPKI, IRR).

### Traceroute de tu PC a google.com
Corres `traceroute google.com` desde Buenos Aires. Salto 1: tu router de casa (192.168.1.1). Salto 2-3: la red del ISP. Salto 4-5: posiblemente CABASE (NAP argentino). Salto 6-8: backbone internacional. Salto 9-10: red interna de Google. Cada salto entre 4 y 8 puede atravesar OSPF dentro de un AS, mientras que los saltos donde cambia el ASN son BGP.

**Por qué importa acá**: vivís en tiempo real la mezcla de IGP (dentro de cada ISP) y EGP (entre ISPs). El TTL del paquete IP es el truco que hace funcionar traceroute.

### Count-to-infinity en una red chica
En la red de un coworking, hay 3 routers viejos corriendo RIP (A-B-C). Cuando alguien desenchufa el cable A-internet, B sigue diciéndole a C "yo conozco a internet en 2 saltos", y empieza el conteo: 3, 4, 5... hasta llegar a 16 (infinito). Mientras tanto, durante ~30 segundos, los paquetes hacen loop entre B y C. Por eso ningún ISP serio usa RIP en producción.

**Por qué importa acá**: ilustra por qué OSPF reemplazó a RIP. Es exactamente el escenario A-B-C del docente, traducido a un caso cotidiano.

## Conexiones

- Se conecta con **IP** porque sin ruteo, IP no llega a ningún lado. Routing llena la tabla de forwarding de IP.
- Relaciona con **switches** porque algunos protocolos (EIGRP, OSPF) corren también en switches L3.
- Vincula con **seguridad** porque el ruteo es vector de ataque: BGP hijacking, route injection.
- Sirve de base para **congestion control**: algunos algoritmos (TCP BBR, multipath TCP) explotan información sobre la ruta.
