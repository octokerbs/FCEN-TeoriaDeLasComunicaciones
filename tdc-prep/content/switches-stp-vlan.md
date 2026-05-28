---
slug: switches-stp-vlan
title: Hubs, bridges, switches, STP y VLAN
category: enlace
order: 7
diagrams: []
---

## Por qué importa

Las primeras redes Ethernet eran un solo cable largo donde todos los hosts colisionaban con todos. A medida que crecen las redes, esto se vuelve insostenible: muchas colisiones, broadcast por todos lados, sin segmentación posible. Aparecen entonces los **bridges** (luego **switches**) que dividen la red en dominios más chicos y aprenden por dónde mandar cada frame.

Pero cuando los switches se interconectan con redundancia (ciclos), aparece otro problema: **broadcast storms** que tumban la red entera. La solución fue STP, un algoritmo distribuido elegante que mantiene la topología activa como árbol. Y para escalar y aislar tráfico, llegaron las VLANs.

## Intuición

- **Hub:** una zapatilla eléctrica. Repite a todos los puertos lo que llega por uno. Un solo dominio de colisión.
- **Bridge / Switch:** una oficina con secretaria que recuerda dónde se sienta cada persona. Si llega correo para "Juan", lo manda solo al escritorio de Juan, no a todos.
- **Router:** un correo internacional que mira los códigos postales (IPs) y decide la ruta entre ciudades.

Cada uno sube una capa más en el modelo OSI: hub = capa 1, switch = capa 2, router = capa 3.

## Hubs vs Bridges vs Switches

| Dispositivo | Capa OSI | Decide por | Dominios de colisión | Dominios de broadcast |
|-------------|----------|------------|----------------------|------------------------|
| Hub | 1 (físico) | nada (repite todo) | **1** (uno solo, compartido) | **1** |
| Bridge / Switch | 2 (enlace) | dirección MAC | **N** (uno por puerto) | **1** |
| Router | 3 (red) | dirección IP | **N** | **N** (uno por puerto) |

**Switch vs bridge:** conceptualmente idénticos. Switch suele ser más rápido, multipuerto y con hardware dedicado; bridge es el término académico.

## Learning bridges (cómo aprende un switch)

El switch arranca con tabla MAC vacía. Cuando llega un frame:

```
1. Mira el campo "MAC origen" del frame y la interfaz por donde entró.
2. Aprende: "MAC X está alcanzable por el puerto P".
   Guarda la entrada (con timer).
3. Mira el campo "MAC destino".
   a. Si la conoce en la tabla, envía solo por ese puerto (forwarding).
   b. Si no la conoce, hace flooding: envía por todos los puertos
      excepto por el que entró.
   c. Si la destino == origen del puerto, descarta (filtering).
4. Si es broadcast (FF:FF:FF:FF:FF:FF), hace flooding siempre.
```

La tabla **expira** entradas que no se ven en X segundos (300 típico) para adaptarse a movimientos.

**Propiedades:**

- Plug-and-play: ningún switch necesita configuración para aprender.
- Eficiente: en estado estacionario, solo manda frames a quien corresponde.
- No previene loops: ahí entra STP.

## Dominio de colisión vs dominio de broadcast

- **Dominio de colisión:** conjunto de interfaces donde una colisión puede afectar a otra transmisión. Un hub crea un solo dominio; un switch crea uno por puerto. Full-duplex elimina la noción.
- **Dominio de broadcast:** conjunto de interfaces que reciben un mismo frame broadcast. Un switch (sin VLAN) tiene **un solo dominio de broadcast**. Un router lo divide: el broadcast no cruza routers.

**Implicación:** crecer una LAN con switches reduce colisiones pero el **broadcast sigue inundando todo**. Por eso se segmentan con VLAN o se ponen routers en el medio.

## Ciclos y el problema

Si conectás dos switches con dos cables (para redundancia), un solo frame de broadcast empieza a circular en círculos infinitos: cada switch lo manda al otro, que lo manda al primero, etc. **Sin TTL en capa 2**, la red colapsa en segundos.

Necesitamos **redundancia física** (cables extra por si uno falla) pero **un solo camino activo** lógico. Eso resuelve STP.

## Spanning Tree Protocol (STP / 802.1D)

Algoritmo distribuido que construye un **árbol de cubrimiento** sobre el grafo de switches. Frames se reenvían solo por aristas del árbol; las redundantes quedan bloqueadas (listas para activarse si falla otra).

**Algoritmo (a grandes rasgos):**

```
1. Elegir un Root Bridge: el switch con menor Bridge ID
   (prioridad + MAC). Todos lo conocen tras intercambio de BPDUs.
2. Cada switch no-raíz determina su Root Port: la interfaz con
   menor costo total hacia la raíz.
3. En cada segmento, se elige un Designated Port: la única
   interfaz por la que ese segmento llega a la raíz.
4. Las interfaces que no son ni Root Port ni Designated Port
   se ponen en estado Blocking. No reenvían frames.
5. Periódicamente se intercambian BPDUs para detectar cambios.
   Si falla un enlace, las interfaces bloqueadas se reactivan.
```

## BPDU (Bridge Protocol Data Unit)

Mensaje especial que los switches intercambian para ejecutar STP. Contiene:

- **Root Bridge ID:** el ID del que se cree raíz.
- **Sender Bridge ID:** quién emite.
- **Path Cost:** costo acumulado hasta la raíz.
- **Port ID, timers.**

Se mandan periódicamente (cada 2s por defecto). Si dejan de llegar, el switch asume falla y recalcula.

## Estados de las interfaces STP

- **Blocking:** descarta frames, recibe BPDUs. Su rol es prevenir loops.
- **Listening:** escucha BPDUs pero no aprende MACs ni reenvía. Transitorio.
- **Learning:** aprende MACs pero no reenvía aún. Transitorio.
- **Forwarding:** estado normal de operación. Reenvía y aprende.
- **Disabled:** apagada administrativamente.

**Convergencia clásica:** ~50 segundos al inicio. RSTP (802.1w) lo reduce a segundos.

## VLAN (Virtual LAN, 802.1Q)

Permite **segmentar lógicamente** una red física en múltiples redes virtuales. Cada VLAN es un dominio de broadcast independiente.

**Cómo funciona:** cada frame lleva un **tag** de 4 bytes con un VLAN ID (12 bits, 4094 VLANs). Los switches solo reenvían entre puertos que comparten esa VLAN. Para que un host hable con otra VLAN, hace falta un **router** (o switch L3).

**Tipos de puertos:**

- **Access port:** lleva tráfico de una sola VLAN. El host no ve el tag.
- **Trunk port:** lleva tráfico tagueado de múltiples VLANs. Usado entre switches o switch-router.

**Beneficios:**

- Aísla tráfico (seguridad, broadcast contenido).
- Agrupa hosts lógicamente (no por ubicación física).
- Reduce dominios de broadcast.
- Permite políticas distintas por VLAN.

**Ejemplo típico:** VLAN 10 para empleados, VLAN 20 para invitados, VLAN 99 para administración. Todos comparten los mismos cables y switches, pero no se ven entre sí salvo por un router central.

## Casos clave / Ejemplos

**Ejemplo 1: switch con 3 hosts, tabla vacía.** A manda a B. Switch ve "MAC A en puerto 1", aprende. B no está en tabla, hace flooding (puertos 2 y 3). B responde a A. Switch aprende "MAC B en puerto 2". Próximos frames A↔B van directos.

**Ejemplo 2: dos switches con doble enlace.** S1 y S2 conectados por dos cables redundantes. Sin STP: broadcast infinito. Con STP: uno de los enlaces queda en Blocking. Si el activo falla, el bloqueado pasa a Forwarding en ~50s (clásico) o ~1s (RSTP).

**Ejemplo 3: VLAN trunk.** Switch A tiene VLAN 10 (puerto 1) y VLAN 20 (puerto 2). Switch B también. Entre A y B hay **un solo cable trunk** que lleva tagueados los frames de ambas VLANs. El switch B desempaqueta el tag y reenvía solo a sus puertos correspondientes.

## Errores frecuentes

- Pensar que un switch divide dominios de broadcast. **No**: solo de colisión. Para broadcast hace falta router o VLAN.
- Confundir **MAC origen vs destino** en aprendizaje. El switch aprende **leyendo MAC origen**, no la destino.
- Creer que STP balancea carga. **No**: solo activa o bloquea enlaces. Para balanceo hay protocolos como **MSTP** (varias instancias) o EtherChannel/LAG.
- Pensar que VLAN cambia los cables. **No**: las VLANs son **lógicas**, viajan sobre el mismo cobre/fibra con tags.
- Olvidar que entre VLANs hace falta routing (capa 3). No basta con configurar VLANs si querés que se vean.

## Pregunta-trampa típica

> "Si un switch tiene la tabla MAC llena y llega un frame con destino desconocido, ¿qué hace?"

**Flooding** (manda por todos los puertos excepto el de entrada). Igual que si la tabla estuviera vacía para esa entrada. Esto puede ser explotado por **MAC flooding attacks**: un atacante satura la tabla con MACs falsas para forzar al switch a comportarse como hub y poder sniffear.

> "¿Puede un broadcast cruzar de una VLAN a otra?"

No. Las VLANs definen dominios de broadcast separados. Para que VLAN 10 y VLAN 20 se comuniquen hace falta un **router** (o un switch L3 haciendo inter-VLAN routing). El router rompe la barrera porque opera en capa 3.

> "Si tengo redundancia entre switches y STP me bloquea un cable, ¿es ineficiente?"

Depende. Sí, no usás el ancho de banda del enlace bloqueado en operación normal. Pero te da **resiliencia**: si el enlace activo cae, el bloqueado se activa en segundos. Para usar ambos enlaces simultáneamente hay que recurrir a **LACP / EtherChannel** que los agrega como un canal lógico.

## Énfasis del docente (Righetti)

- Llama al tema **"escalando con Red de Área Local (LAN)"** y luego **"LAN extendida con 802.2"** (el LLC une los distintos MAC). El concepto de **LAN Extendida** es central: muchos switches/bridges conectados por encima del MAC.
- Sobre **Learning Bridges** insiste en cuatro puntos textuales: (1) "no reenviar paquetes cuando no sea necesario", (2) "mantener una tabla de reenvío", (3) "aprender las entradas de la tabla de reenvío basadas en la dirección de **origen** de las tramas", (4) "la tabla es una **optimización**; no necesita ser completa (ante falta de entradas: **inundación**)" y "siempre envía tramas tipo broadcast".
- Plantea el problema de las **topologías con ciclos** con dos casos visuales que reaparecen en final: **2 links redundantes entre los mismos bridges** y **2 bridges en paralelo**. Si los reconocés, ya sabés que la respuesta es STP.
- Para las **BPDU** usa la notación compacta `BPDU = [id, root, distance]` y un ejemplo textual: `BPDU = [3, 2, 1]` significa "soy id=3, creo que el root es id=2, y mi distancia a él es 1". Esa terna $(\text{id propio}, \text{id raíz, costo})$ es la que hay que comparar para decidir Root Port y Designated Port.
- Slogan que repite con VLANs: **"el broadcast no escala"** — por eso las Extended LAN no escalan, y aparecen las VLAN como **partición lógica** (no física) de la LAN.
- Sobre VLAN trunking siempre cita **802.1q** como el estándar que tagea los frames; los puertos trunk transportan múltiples VLAN sobre un mismo cable físico.
- Diferencia visual que él dibuja: **Host A - Hub - Hub - Host B** está en un solo dominio de colisión; **Switch / Bridge** introduce nuevos dominios de colisión por puerto pero **no** rompe el dominio de broadcast.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Red de la facultad con VLANs
En FCEN tenés Wi-Fi "FCEN-alumnos" y "FCEN-docentes" en el mismo edificio, mismos APs, mismos switches. Pero alumnos no pueden ver impresoras de profesores ni shares administrativos. Eso es VLAN: cada SSID/grupo va en una VLAN distinta (10 para alumnos, 20 para docentes, 99 para administración). Mismo cable trunk entre switches con tags 802.1Q.

**Por qué importa acá**: VLAN convierte una sola infraestructura física en redes lógicas separadas. Sin tirar más cables, conseguís aislamiento, seguridad, y dominios de broadcast independientes.

### Datacenter con doble enlace de respaldo
En el datacenter de Mercado Libre, cada switch top-of-rack se conecta a dos switches core distintos con dos cables. Si un core cae o un cable se corta, el otro toma el tráfico. STP mantiene un solo camino activo lógico, el redundante queda en Blocking. Con RSTP, la convergencia tras una falla es <1 segundo: imperceptible para los usuarios.

**Por qué importa acá**: STP es la razón por la que la redundancia física no genera broadcast storms. Es exactamente el "2 links redundantes entre los mismos bridges" del docente.

### Hub de los 90 vs router de casa moderno
El "switch" plástico de 8 puertos que tenés en tu escritorio es realmente un switch (capa 2). Si conectás impresora, NAS y PC, cada uno tiene su dominio de colisión y full-duplex 1 Gbps. Tu PC bajando un torrent no afecta la velocidad de la impresora. En cambio el hub de los 90 hacía que todo el tráfico de la oficina compartiera 10 Mbps.

**Por qué importa acá**: el cambio hub → switch fue silencioso pero brutal. La diferencia entre 1 dominio de colisión (hub) y N dominios (switch) es la diferencia entre la red "lenta y misteriosa" y la red "rápida y predecible".

## Conexiones

- Se conecta con **Ethernet/CSMA-CD** porque los switches eliminaron las colisiones que CSMA/CD intentaba manejar.
- Sirve de puente con **nivel red**: los routers continúan la segmentación que las VLANs empiezan.
- Relaciona con **seguridad**: las VLANs son un mecanismo de aislamiento; STP es vulnerable a BPDU spoofing (BPDU Guard, Root Guard).
