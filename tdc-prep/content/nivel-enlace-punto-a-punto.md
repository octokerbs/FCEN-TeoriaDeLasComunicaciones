---
slug: nivel-enlace-punto-a-punto
title: Nivel enlace punto a punto (framing, errores, sliding window)
category: enlace
order: 5
diagrams: [SlidingWindow]
---

## Por qué importa

El nivel físico te entrega un chorro de bits sin estructura. El **nivel enlace** los agrupa en unidades manejables (**frames**), detecta y a veces corrige errores, y controla el ritmo entre dos nodos vecinos. Sin esto, una ráfaga de ruido te corrompería gigabytes en silencio, o un emisor rápido inundaría a un receptor lento.

Es la capa donde nacen ideas como **ACKs**, **timeouts**, **retransmisión**, **ventana deslizante**: conceptos que después subirán a TCP. Entenderla acá, donde es más simple, te ahorra dolores de cabeza después.

## Intuición

Imaginá dictar un mensaje por radio: "Cambio y corto" delimita el fin de tu turno, "¿Recibido?" pide confirmación, "Negativo, repita" pide retransmisión. Eso es **frame + ACK + retransmisión**, exactamente lo que hace un protocolo de enlace.

Si dictás muy rápido el otro no llega a anotar (control de flujo). Si manda confirmación por cada palabra, vas a perder tiempo esperando (ineficiencia). La solución es mandar **varias palabras seguidas** y pedir confirmación en bloque: **sliding window**.

## Framing

El receptor recibe un chorro de bits y tiene que saber dónde empieza y termina cada frame. Hay cuatro métodos clásicos:

### 1. Largo fijo

Todos los frames tienen el mismo tamaño. Simple pero inflexible: si un frame se pierde, se desincroniza todo. Usado en ATM (celdas de 53 bytes).

### 2. Longitud en el header

Un campo al inicio dice cuántos bytes vienen. Eficiente, pero si ese campo se corrompe, perdés sincronía. Solución: combinar con delimitadores o checksum del header.

### 3. Delimitadores con bit stuffing

Un patrón especial (ej: `01111110` en HDLC) marca inicio y fin. Si los datos contienen el patrón, el emisor inserta un `0` después de cinco `1` seguidos. El receptor lo retira al recibir. Así el patrón es **único e inequívoco**.

```
Original:    01111110 11111101 01111110
Stuffed:     01111110 111110101 01111110
                          ^ aquí se insertó un 0
```

### 4. Delimitadores con violación de código de línea

Si el código de línea (Manchester, 4B/5B) deja símbolos sin asignar, esos se usan como delimitadores. Imposible que aparezcan en datos, por construcción.

## Tipos de servicio

El nivel enlace puede ofrecer:

- **No confirmado sin conexión:** manda frames y se olvida. No retransmite, no ordena. Ej: Ethernet. La fiabilidad la maneja una capa superior.
- **Confirmado sin conexión:** cada frame tiene ACK, hay retransmisión. Sin conexión persistente. Ej: Wi-Fi MAC.
- **Confirmado con conexión:** establecimiento, transferencia ordenada, cierre. Más fuerte. Ej: HDLC LAPB, PPP en algunos modos.

## Detección de errores

### Paridad simple

Agregar un bit para que el total de unos sea par (o impar). **Detecta errores de 1 bit** pero no los de 2 (que se cancelan).

### CRC (Cyclic Redundancy Check)

El frame se trata como un polinomio binario y se divide por un **polinomio generador** $G(x)$ conocido por ambos extremos. El resto de la división es el **FCS** (Frame Check Sequence), que se envía con el frame. El receptor repite la división; si el resto es 0, el frame está OK.

$$\textcolor{#a5e6b1}{\text{FCS}} = \textcolor{#a5c8f4}{M(x)} \cdot x^r \mod G(x)$$

Donde $r$ es el grado de $G(x)$. CRC-32 (usado en Ethernet) detecta:

- Todos los errores de hasta $r$ bits seguidos (burst).
- Probabilidad de error no detectado $\approx 2^{-r}$ para errores grandes.

Es **mucho** más robusto que paridad y barato de calcular en hardware.

### Hamming

Corrige errores, no solo los detecta. Agrega $r$ bits de paridad para $m$ bits de datos cumpliendo:

$$2^{\textcolor{#f4a5a5}{r}} \geq \textcolor{#a5c8f4}{m} + r + 1$$

Cada bit de paridad cubre posiciones específicas (potencias de 2). El síndrome resultante apunta al bit erróneo. Hamming(7,4) corrige 1 error en 7 bits. Usado donde no podés retransmitir (memoria ECC, FEC en transmisión).

**Detectar vs corregir:** detectar es barato y suficiente si podés retransmitir. Corregir es caro pero necesario en canales unidireccionales (broadcast, almacenamiento).

## Control de flujo: Stop & Wait

El protocolo más simple:

```
Emisor:  manda frame 0  →  ........ → recibido
                          ← ACK 0
         manda frame 1  →
                          ← ACK 1
```

Si pasa un timeout sin ACK, retransmite. Necesita **números de secuencia** (al menos 1 bit) para que el receptor distinga retransmisiones de duplicados.

**Eficiencia:**

$$\textcolor{#a5e6b1}{\eta} = \frac{T_{tx}}{T_{tx} + 2 \textcolor{#f4a5a5}{T_{prop}}} = \frac{1}{1 + 2a}$$

Donde $a = T_{prop} / T_{tx}$. Si el frame es chico o el enlace largo (alto BDP), $a$ crece y $\eta$ se desploma. **Stop & Wait solo sirve para enlaces cortos o frames grandes.**

## Sliding Window

Generalización: el emisor manda hasta $W$ frames sin esperar ACK. Solo se bloquea si la ventana está llena.

```
Emisor:  manda 0,1,2,3,4 (W=5) → 
                                ← ACK 0
         libera 0, manda 5    →
                                ← ACK 1
         libera 1, manda 6    →
         ...
```

**Eficiencia:**

$$\textcolor{#a5e6b1}{\eta} = \min\!\left(1, \frac{\textcolor{#a5e6b1}{W}}{1 + 2a}\right)$$

Si $W \geq 1 + 2a$, el enlace queda **saturado** (eficiencia 100%).

## Diagrama

{{diagram: SlidingWindow}}

El diagrama muestra cómo la ventana avanza a medida que llegan ACKs. El borde izquierdo (frames confirmados) y el derecho (frames mandados pendientes de ACK) se mueven juntos hacia la derecha.

## Variantes de retransmisión

### Go-Back-N

Si se pierde el frame $k$, el receptor descarta todos los siguientes y el emisor retransmite $k$, $k+1$, $k+2$... hasta el final de la ventana. Simple, pero ineficiente con pérdidas frecuentes.

### Selective Repeat

El receptor **bufferea** los frames fuera de orden y solo pide retransmitir los faltantes. Más eficiente pero requiere buffer en ambos lados.

### SACK (Selective Acknowledgment)

El receptor manda ACKs que indican explícitamente qué rangos recibió. Permite al emisor retransmitir solo los huecos. Es la versión "Selective Repeat" en TCP moderno.

## Capacidad de volumen (BDP)

**Bandwidth-Delay Product:** $\text{BDP} = R \cdot \text{RTT}$. Es el volumen de bits "en vuelo" en estado estacionario. La ventana ideal del protocolo iguala el BDP. Más chica subutiliza; más grande no ayuda.

**Ejemplo:** enlace de 100 Mbps con RTT = 100 ms.

$$\textcolor{#a5e6b1}{\text{BDP}} = 10^8 \cdot 0.1 = 10^7 \text{ bits} = 1.25 \text{ MB}$$

La ventana TCP debería poder llegar a 1.25 MB para saturar este enlace.

## Casos clave / Ejemplos

**Ejemplo 1: Stop & Wait satélite GEO.** RTT $\approx 500$ ms, frame de 1500 B a 1 Mbps. $T_{tx} = 12$ ms, $2 T_{prop} = 500$ ms. $\eta = 12 / 512 \approx 2.3\%$. **Inútil.** Hay que usar sliding window con W grande.

**Ejemplo 2: CRC con G = $x^3 + x + 1$ y M = 110101.**

- $M(x) = x^5 + x^4 + x^2 + 1$.
- Se shifta multiplicando por $x^3$: $M(x) \cdot x^3 = x^8 + x^7 + x^5 + x^3$.
- División polinomial módulo 2 por $G(x)$ da un resto de 3 bits.
- El frame transmitido es $M$ seguido del resto.

**Ejemplo 3: tamaño de ventana mínima para enlace lleno.** R = 10 Mbps, RTT = 80 ms, frames de 1000 bytes. $T_{tx} = 800$ µs, $a = 80\text{ms} / 800\mu\text{s} = 100$. Necesitás $W \geq 1 + 200 = 201$ frames.

## Errores frecuentes

- Confundir **detección** con **corrección**. CRC detecta pero no corrige; Hamming corrige.
- Olvidar el **número de secuencia** en Stop & Wait. Sin él, una retransmisión por timeout perdido se confunde con frame nuevo.
- Calcular eficiencia con bits por segundo en lugar de tiempo. Siempre razonar en términos de **$T_{tx}$ vs $T_{prop}$**.
- Pensar que Sliding Window resuelve la pérdida. Solo resuelve la espera; las pérdidas las maneja la **estrategia de retransmisión** (GBN, SR, SACK).
- Suponer que CRC corrige errores. **No**: solo detecta. La acción correctiva es retransmitir.

## Pregunta-trampa típica

> "Si aumento el tamaño de la ventana indefinidamente, ¿aumenta indefinidamente la eficiencia?"

No. La eficiencia se satura en 1 cuando $W = 1 + 2a$. Pasada esa ventana, el emisor termina esperando ACKs igual y no gana nada (a menos que aumente el throughput de aplicación, pero eso es otro tema).

> "¿Cuándo conviene Selective Repeat sobre Go-Back-N?"

Cuando la **tasa de pérdida es alta** o el **BDP es grande**. Con muchas pérdidas, GBN retransmite muchísimos frames inocentes; SR solo retransmite los perdidos, a costa de buffer del receptor.

## Buffers y dimensionamiento (cola M/M/1)

Righetti dedica varias diapositivas al **dimensionamiento de buffers** en cualquier nodo que reciba tráfico: hay que pensar en el comportamiento de cola, no solo en throughput pico.

La aproximación clásica es modelar la cola como **M/M/1**: arribos Poisson, tiempo de servicio exponencial, un servidor, capacidad infinita. La intensidad de tráfico es:

$$\textcolor{#a5e6b1}{\rho} = \frac{\textcolor{#a5c8f4}{L} \cdot \textcolor{#f4a5a5}{a}}{\textcolor{#a5c8f4}{B}}$$

con $L$ = longitud del paquete (bits), $a$ = tasa media de arribos (pps), $B$ = capacidad del enlace (bps).

- Si $\rho \to 0$: retardo medio muy bajo.
- Si $\rho \to 1$: el retardo crece **exponencialmente**.
- Si $\rho > 1$: llega más trabajo del que puede servirse, retardo medio infinito.

**Regla práctica de Righetti para dimensionar el buffer (BufferDelay vs throughput):**

| Tamaño del buffer | BufferDelay máx. | Utilización promedio |
|-------------------|------------------|----------------------|
| Undersized ($0.25 \cdot D$) | 50 ms | 85% |
| Igual al BDP ($D$) | 200 ms | 98.3% |
| Oversized ($2.5 \cdot D$) | 500 ms | 98.4% |

Conclusión del docente: agrandar el buffer más allá del **BDP** casi no mejora la utilización pero sí **multiplica la latencia** (el famoso problema de **bufferbloat**).

## Énfasis del docente (Righetti)

- Insiste en separar **detección vs corrección de errores**: CRC detecta y "la acción correctiva es retransmitir". Hamming solo aparece donde no podés retransmitir (memoria ECC, FEC).
- Sobre Stop & Wait usa siempre la fórmula textual $U = 1 / (2a + 1)$ con $a = T_{prop}/T_{frame}$, y plantea el cálculo en términos de **distancia / velocidad de la señal** vs **tamaño de frame / bit rate**. Recordá las velocidades de propagación: $c = 3 \times 10^8$ m/s en vacío, $\approx 2 \times 10^8$ m/s en fibra óptica, $\approx 2.5 \times 10^8$ m/s en cobre.
- Para Ventana Deslizante remarca que $U = 1$ si y solo si $W \geq 2a + 1$. Es la condición que casi siempre se pregunta en final.
- Ejercicio canónico que él usa: archivo de 10 GB, ventana de 64 KB, RTT = 1 s. La cota es $T < W/\text{RTT}$, es decir el throughput máximo es 64 KB/s independientemente del bit rate del enlace.
- Subraya el **Bandwidth-Delay Product (BDP)** como invariante: $\text{BDP (bits)} = B \cdot D$. La ventana del protocolo "debe igualar el BDP".
- Conecta el nivel de enlace con el **traffic shaping** (Token Bucket: aceptar un **Burst Size** controlando un **Average Rate**). Si bien excede el nivel enlace puro, lo usa para introducir el concepto de cola y buffer.

{{diagram: SlidingWindow}}

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Bajar Steam en hora pico
Tu PC pide un juego de 80 GB desde el CDN de Steam en Brasil. RTT ~30 ms, enlace 200 Mbps. El BDP es $200 \cdot 10^6 \cdot 0.03 = 6$ Mb = 750 KB. Si la ventana TCP fuera de 64 KB (default viejo), tu throughput máximo sería $64\text{KB}/30\text{ms} \approx 2$ MB/s — desperdiciando 90% del enlace. TCP moderno escala la ventana hasta MB y satura.

**Por qué importa acá**: ventana = BDP es la regla de oro. Si tu ventana es chica, el "tubo" queda vacío esperando ACKs. Es exactamente el ejemplo canónico del docente con archivo de 10 GB.

### SSH desde un café con Wi-Fi malo
Estás haciendo `ssh servidor` desde un bar con señal débil. La conexión se siente "rara" — tipeás y los caracteres aparecen con lag de 1-2 segundos en ráfagas. Pasa porque la capa de enlace Wi-Fi está retransmitiendo frames con CRC inválido (errores por baja SNR), y cada retransmisión introduce delay.

**Por qué importa acá**: Wi-Fi usa "confirmado sin conexión" — ACK por frame y retransmisión local. Sin esto, TCP arriba retransmitiría desde el extremo, mucho más caro. La retransmisión local es nodo-a-nodo, no end-to-end.

### Ethernet de la PC al router
Cuando bajás algo por cable, tu PC y el router intercambian frames Ethernet con CRC-32 al final. Si un electrón cósmico voltea un bit en el cable, el receptor calcula el CRC y descarta el frame silenciosamente. TCP arriba detecta la pérdida por timeout y lo retransmite. Con CRC-32, la probabilidad de no detectar un error es $\sim 2^{-32}$ — un error cada 4 mil millones de frames corruptos.

**Por qué importa acá**: muestra la división de trabajo. Nivel enlace solo **detecta** (CRC) y descarta. La **corrección** (retransmisión) sucede arriba. Es más simple y barato que poner Hamming en cada frame.

## Conexiones

- Se conecta con **acceso múltiple (Ethernet, Wi-Fi)** porque también es nivel enlace, pero con medio compartido (subcapa MAC).
- Sirve de base para **TCP**: ventana deslizante, ACKs, RTO, SACK son herederos directos.
- Relaciona con **Shannon** porque los códigos de detección/corrección (CRC, Hamming) son códigos del canal, que Shannon demostró que pueden acercarse a la capacidad.
