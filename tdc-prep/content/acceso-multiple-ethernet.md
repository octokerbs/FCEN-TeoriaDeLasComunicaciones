---
slug: acceso-multiple-ethernet
title: Acceso múltiple y Ethernet (CSMA/CD, Aloha)
category: enlace
order: 6
diagrams: [CSMACD]
---

## Por qué importa

Hasta ahora pensamos en enlaces punto a punto: un emisor, un receptor, un medio dedicado. Pero **muchos medios son compartidos**: el cable coaxial original de Ethernet, las radios Wi-Fi, los buses en hardware. Si dos estaciones transmiten al mismo tiempo, las señales se mezclan y se pierden ambas (**colisión**).

El **acceso múltiple** es el conjunto de reglas para que múltiples estaciones compartan un medio sin que se pisen demasiado. Ethernet con CSMA/CD fue una solución dominante durante décadas y, aunque hoy es mayormente full-duplex con switches, sus principios siguen vivos en Wi-Fi y en cualquier bus compartido.

## Intuición

Imaginá una reunión donde todos pueden hablar pero solo uno a la vez se entiende. ¿Cómo se coordinan?

- **Centralizado:** alguien da turnos (token ring, polling).
- **Aleatorio:** cada uno habla cuando quiere; si chocan, se callan y reintentan después.
- **Escuchar antes:** mirá si alguien está hablando; si sí, esperá.

Ethernet eligió la combinación **"escuchar antes + detectar colisión + reintentar con backoff"**. Es simple, distribuido, sin estaciones especiales.

## Aloha (origen)

Diseñado en 1970 para conectar islas de Hawaii por radio. **Aloha puro:** transmitís cuando tenés algo, sin escuchar. Si no llega ACK, retransmitís tras espera aleatoria. Eficiencia máxima:

$$\textcolor{#a5e6b1}{S_{\max}} = \frac{1}{2e} \approx 18.4\%$$

**Aloha ranurado:** todos transmiten al inicio de slots de tiempo discretos. Reduce ventana de colisión a la mitad:

$$\textcolor{#a5e6b1}{S_{\max}} = \frac{1}{e} \approx 36.8\%$$

Ambos son ineficientes a alta carga, pero **simples** y la base teórica para CSMA.

## CSMA: Carrier Sense Multiple Access

"Escuchá antes de transmitir." Si el medio está ocupado, esperá. Tres variantes:

### 1-persistente

Cuando el medio se libera, transmite **inmediatamente** con probabilidad 1. Si varios esperaban, colisionan seguro. **Es el de Ethernet (CSMA/CD).**

### No-persistente

Cuando ve ocupado, espera un tiempo aleatorio y vuelve a escuchar. Reduce colisiones pero aumenta latencia.

### p-persistente

Cuando el medio se libera, transmite con probabilidad $p$ o pospone con probabilidad $1-p$. Variando $p$ se balancea entre latencia y colisiones. Usado en Wi-Fi con ventana de contención.

## CSMA/CD (Collision Detection)

Ethernet clásica. Cada estación:

```
1. Escucha el medio. Si está libre, transmite. Si no, espera (1-persistente).
2. Mientras transmite, sigue escuchando. Si detecta colisión:
   a. Envía una secuencia de "jam" (32 bits) para que todos noten.
   b. Aborta.
   c. Espera un tiempo aleatorio (exponential backoff).
   d. Vuelve a 1.
```

**Importante:** la detección de colisión solo funciona si **mientras transmitís** podés escuchar el medio. Por eso CSMA/CD se usa en cable (half-duplex) pero **no en Wi-Fi** (las antenas no pueden recibir mientras transmiten en la misma frecuencia). Wi-Fi usa CSMA/CA (collision avoidance) en su lugar.

## Diagrama

{{diagram: CSMACD}}

El diagrama ilustra: dos estaciones detectan que el medio está libre, comienzan a transmitir, las señales se superponen en el medio (colisión), ambas detectan y emiten jam, abortan y entran en backoff aleatorio.

## Exponential Backoff Binario

Después de la $n$-ésima colisión, cada estación espera $k$ slot-times donde:

$$\textcolor{#a5e6b1}{k} = \text{aleatorio}(0, 2^{\min(n, 10)} - 1)$$

A partir de 16 colisiones, abandona. Con cada colisión se duplica el rango (de ahí "exponencial"). Esto distribuye las estaciones en el tiempo de forma adaptativa: pocas colisiones $\Rightarrow$ esperas cortas; muchas colisiones $\Rightarrow$ esperas largas.

## Frame mínimo y MTU

**Frame mínimo de 64 bytes** (sin preamble) NO es decisión arbitraria. Es necesario para que **CSMA/CD funcione**.

**Razonamiento:** una estación debe seguir transmitiendo mientras una colisión pueda volver. El peor caso es: la estación A empieza a transmitir, en el último instante antes de llegar a B (a distancia máxima), B también empieza. La colisión vuelve hasta A en otro RTT.

$$\textcolor{#a5c8f4}{T_{tx, \min}} \geq 2 \cdot \textcolor{#f4a5a5}{T_{prop, \max}}$$

Para Ethernet a 10 Mbps con 2500 m máximo (con repeaters), $2 \cdot T_{prop} \approx 51.2 \mu s$, que a 10 Mbps son **512 bits = 64 bytes**.

**MTU 1500 bytes** es el máximo. Es un balance: muy chico = overhead de headers; muy grande = un error corrompe mucha data, y un emisor monopoliza el medio. **MTU es un parámetro de capa 2 pero impacta capa 3** (fragmentación IP).

## Performance: goodput vs G

Sea $G$ = tráfico ofrecido (frames/slot incluyendo retransmisiones). El **goodput** $S$ (frames exitosos/slot) tiene forma de campana:

- Bajo $G$: pocas colisiones, $S \approx G$.
- Crece hasta un máximo, luego cae por exceso de colisiones.

Para Aloha ranurado: $S = G e^{-G}$, máximo en $G=1$ con $S = 1/e$.

Para CSMA/CD: el máximo es mucho mayor (cercano a 1 para enlaces cortos) porque el "carrier sense" evita la mayoría de colisiones. La gráfica clásica muestra **caída suave** al superar el punto óptimo.

```
Goodput
  |        ___
1 |       /   \____
  |      /         \___
  |     /              \____
  |    /                    \___
  |   /                          \____
  |  /                                 \____
  |_/__________________________________________ G (carga ofrecida)
       1       2       3       4
```

## Tipos de Ethernet (resumen histórico)

| Estándar | Velocidad | Medio | Codificación | Topología |
|----------|-----------|-------|--------------|-----------|
| 10BASE5 | 10 Mbps | Coaxial grueso | Manchester | Bus |
| 10BASE2 | 10 Mbps | Coaxial fino | Manchester | Bus |
| 10BASE-T | 10 Mbps | Par trenzado | Manchester | Estrella |
| 100BASE-TX | 100 Mbps | Par trenzado | 4B/5B + MLT-3 | Estrella |
| 1000BASE-T | 1 Gbps | Par trenzado | 8B/10B + 4D-PAM5 | Estrella |
| 10GBASE-T | 10 Gbps | Par trenzado Cat6a+ | LDPC + 128-DSQ | Estrella |

A partir de **switches** y conexiones **full-duplex**, las colisiones desaparecen (cada par "switch-host" es punto a punto). CSMA/CD persiste **conceptualmente** y para retrocompatibilidad, pero ya no se ejerce en redes modernas.

## Frame Ethernet (IEEE 802.3)

```
| Preamble (7) | SFD (1) | Dest MAC (6) | Src MAC (6) | Type (2) | Payload (46-1500) | FCS (4) |
```

- **Preamble + SFD:** sincronización del receptor.
- **MAC destino / origen:** direcciones de 48 bits.
- **Type/Length:** indica protocolo superior (0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP).
- **Payload:** mínimo 46 bytes (con padding si hace falta), máximo 1500.
- **FCS:** CRC-32 sobre todo el frame.

## Casos clave / Ejemplos

**Ejemplo 1: tamaño mínimo de frame.** Ethernet 100 Mbps, distancia máxima 200 m (Fast Ethernet con hub), $T_{prop} \approx 1 \mu s$, $2 T_{prop} = 2 \mu s$. Bits en 2 µs a 100 Mbps = 200 bits = 25 bytes. Pero por compatibilidad **se mantiene el mínimo de 64 bytes**.

**Ejemplo 2: backoff tras 3 colisiones.** $k \in [0, 7]$. La estación elige aleatoriamente, por ejemplo $k=4$, y espera $4 \cdot 51.2 \mu s = 204.8 \mu s$.

**Ejemplo 3: utilización máxima Aloha vs CSMA.** Aloha ranurado: 36.8%. Ethernet CSMA/CD con tráfico realista: 80-90%. La diferencia es enorme; por eso CSMA reemplazó a Aloha.

## Errores frecuentes

- Pensar que CSMA/CD funciona en Wi-Fi. **No**: Wi-Fi usa CSMA/CA (collision avoidance) porque no puede detectar colisiones.
- Calcular el tamaño mínimo de frame **sin** el factor 2 (ida y vuelta de la señal de colisión).
- Olvidar que con **switches y full-duplex** Ethernet ya no tiene colisiones. CSMA/CD queda como historia.
- Confundir **jam** con **retransmisión**. El jam es un patrón corto (32 bits) que asegura que **todos noten** la colisión.
- Pensar que el backoff es ilimitado. Después de 16 colisiones se **aborta** el frame.

## Pregunta-trampa típica

> "¿Por qué Ethernet exige 64 bytes mínimo si los datos son más cortos?"

Para que **el emisor siga transmitiendo durante toda la ventana de colisión** ($2 \cdot T_{prop}$). Si el frame es más corto, el emisor podría terminar de transmitir antes de detectar una colisión tardía y nunca enterarse. Por eso se rellena con **padding** hasta 64 bytes.

> "¿Qué pasa con CSMA/CD en redes modernas con switches?"

Es prácticamente innecesario. Cada puerto de switch es un dominio de colisión propio, y en full-duplex no puede haber colisión: cada estación tiene su par TX y RX dedicado. Pero el estándar lo mantiene activo en modo half-duplex para compatibilidad con equipos viejos.

## Énfasis del docente (Righetti)

- Encuadra todo el tema como **"el problema del acceso a un canal compartido"**: define los protocolos MAC como aquellos que buscan "maximizar, en promedio, el número de éxitos en los intentos de comunicación" y "asegurar igualdad de oportunidades (**average fairness**) entre todos los nodos competidores".
- Distingue dos filosofías: **TDM/FDM/WDM/CDMA** (compartición planificada) frente a **contención estadística**: "los sistemas en los cuales varios usuarios comparten un canal común de modo tal que puede dar lugar a conflictos se conocen como **sistemas de contención**". Los conflictos son **aceptados** o **manejados**.
- Sobre Ethernet remarca que el frame tiene **mínimo 512 bits** y muestra la cuenta canónica: a **10 Mbps** sobre un cable de **2500 m** (con repeaters), el peor caso $2 \cdot T_{prop} \approx 51.2 \mu s$, equivalente a **512 bits = 64 bytes**. Esta cuenta cae en final.
- Llama al ALOHA puro **18 %** (Norman Abramson, U. of Hawaii, 1970) y subraya que "la familia CSMA es muy flexible de implementar... pero escala muy mal con G". Usa el diagrama $S = G \cdot (1 - P_{collision})$ como referencia.
- Sobre la curva de performance siempre marca: $G$ = carga ofrecida (intentos por unidad de tiempo) vs $S$ = **goodput** (proporción de transmisiones exitosas).
- Eslogan que repite: **"el broadcast no escala"**. Por eso las **Extended LANs no escalan** y se necesitan **VLANs**. Conviene tener esa frase a mano para el oral.
- Describe el formato Ethernet en bytes: **8 (preámbulo) | 6 dest | 6 src | 2 type | 46-1500 payload | 4 FCS**. El campo "Start of Frame" (parte del preámbulo) lo nombra explícitamente.
- Llama a la subcapa superior **LLC (Logical Link Control, IEEE 802.2)** y la pone sobre toda la familia 802.x (802.3, 802.11). Esto es importante para entender que LLC se reutiliza por encima del MAC específico.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Hub viejo de una oficina chica
En oficinas de los 90 conectaban 10 PCs a un hub Ethernet (no switch). Todas compartían el mismo cable lógico: si dos personas mandaban un mail al mismo tiempo, había colisión, jam, backoff. La oficina entera era **un solo dominio de colisión**. Por eso pasar de hub a switch fue uno de los upgrades más grandes en redes: el switch convierte cada puerto en su dominio aislado.

**Por qué importa acá**: muestra por qué Ethernet original necesitaba CSMA/CD. El medio era literalmente un cable coaxial compartido (10BASE2). Hoy el switch full-duplex eliminó la necesidad.

### El "limite" de 100 metros del cable Ethernet
¿Por qué Cat6 está limitado a 100 metros? No es por atenuación (el cobre llega más lejos). Es porque en redes Fast/Gigabit, el cálculo $T_{tx} \geq 2 T_{prop}$ tiene que cerrar con frame mínimo de 64 bytes. Más de 100 m y el frame mínimo no alcanzaría para garantizar la detección de colisión en half-duplex.

**Por qué importa acá**: el "número mágico" 64 bytes salió justamente de la cuenta del docente: $2 \cdot T_{prop} \cdot R = 512$ bits. La distancia máxima del cable es consecuencia directa del protocolo.

### Bajar Linux ISO con el resto de la familia mirando YouTube
En tu LAN hogareña hay 4 personas usando Wi-Fi. El AP es el medio compartido. Cuando todos cargan video al mismo tiempo, ves que tu ping varía entre 5 ms (canal libre) y 200 ms (esperás contención). El AP es un **dominio de colisión virtual** porque las antenas no pueden hablar simultáneamente en el mismo canal.

**Por qué importa acá**: muestra que el problema de acceso múltiple no es histórico. En Wi-Fi sigue existiendo (CSMA/CA), porque la radio sigue siendo un medio compartido aunque cada cable Ethernet sea dedicado.

## Conexiones

- Se conecta con **switches y STP** porque los switches reemplazan a los hubs y eliminan dominios de colisión.
- Compara con **Wi-Fi (CSMA/CA)**: misma idea, distinta solución (evitar colisión vs detectarla).
- Relaciona con **nivel físico** en codificación (Manchester en 10BASE-T) y temporización (slot time).
