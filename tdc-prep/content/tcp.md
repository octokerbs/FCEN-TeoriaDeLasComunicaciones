---
slug: tcp
title: TCP - conexión, fiabilidad, ventana deslizante
category: transporte
order: 11
diagrams: [TCPHandshake, TCPSegment, TCPStateMachine, SlidingWindow]
---

## Por qué importa

IP entrega paquetes "best effort": pueden perderse, llegar fuera de orden, duplicarse, corromperse. Si tu navegador hablara IP directamente, una página web sería una experiencia caótica. **TCP** es la capa que **simula un canal confiable, bidireccional, ordenado, sobre una red poco confiable**. Para el programador, una conexión TCP se siente como un stream de bytes; toda la complejidad queda escondida abajo.

Entender TCP es entender el 90% del tráfico de internet: HTTP, HTTPS, SMTP, FTP, SSH, todos corren sobre TCP. Y los detalles importan: por qué hay 3-way handshake, por qué los RTOs son adaptativos, por qué TCP siempre baja la velocidad ante pérdidas.

## Intuición

Pensá en una conversación telefónica internacional con eco y cortes. ¿Cómo te asegurás de que el otro entendió todo?

- **Saludás antes:** "¿Hola, me escuchás?" — handshake.
- **Repetís lo que oíste:** "Dijiste 'me voy mañana', ¿correcto?" — ACK.
- **Si no llega respuesta, repetís:** retransmisión por timeout.
- **Numerás partes complejas:** "punto 1, punto 2..." — secuencias.
- **Te despedís claramente:** "Listo, te dejo. Chau." — cierre limpio.

TCP es exactamente eso, pero entre dos máquinas y con números en lugar de palabras.

## Stream de bytes y conexión

TCP ofrece una abstracción de **stream de bytes**: el emisor escribe bytes, el receptor lee bytes, sin "límites de mensaje" naturales. Si el emisor hace dos `write(1000 bytes)` y `write(500 bytes)`, el receptor puede leer un solo bloque de 1500, o tres de 500, según el sistema operativo. **TCP no preserva mensajes**, solo bytes.

Cada conexión TCP está identificada por la tupla:

$$(\textcolor{#a5c8f4}{\text{IP origen}},\ \textcolor{#a5c8f4}{\text{puerto origen}},\ \text{IP destino},\ \text{puerto destino})$$

Dos pares conectados pueden tener **muchas** conexiones simultáneas si usan puertos distintos.

## 3-Way Handshake (apertura)

Para establecer una conexión TCP:

```
Cliente                                  Servidor
  |                                        |
  |  -------- SYN, seq=x  ---------------> |
  |                                        |
  |  <----- SYN-ACK, seq=y, ack=x+1 ------ |
  |                                        |
  |  ---------- ACK, ack=y+1 ------------> |
  |                                        |
  |        (conexión establecida)          |
```

1. **SYN:** cliente manda un segmento con bit SYN=1 y secuencia inicial $x$ (aleatoria).
2. **SYN-ACK:** servidor responde con SYN=1, ACK=1, su propia secuencia inicial $y$, y ack=$x+1$ (confirma SYN del cliente).
3. **ACK:** cliente confirma con ack=$y+1$.

**Por qué tres pasos:** dos no alcanzan porque el servidor no sabría si el cliente recibió su SYN. Cuatro serían redundantes. Tres es el mínimo para que **ambos** confirmen mutuamente.

**Por qué números aleatorios:** evitan ataques de spoofing (un atacante no puede adivinar el ISN para inyectar segmentos falsos).

## Diagrama

{{diagram: TCPHandshake}}

El diagrama ilustra el intercambio de tres mensajes con flags y números de secuencia.

## 4-Way Close (cierre)

Cerrar una conexión es más complejo: cada lado cierra **su sentido** independientemente (half-close).

```
Cliente                                  Servidor
  |  -------- FIN  ----------------------> |
  |  <----- ACK   ------------------------ |
  |                                        |
  |  (cliente ya no manda; sigue leyendo)  |
  |                                        |
  |  <------ FIN  ------------------------ |
  |  -------- ACK  ----------------------> |
  |                                        |
  |        (conexión cerrada)              |
```

1. Cliente manda FIN: "ya no tengo más que decir".
2. Servidor ACK-ea: "entendido".
3. Servidor termina su tarea y manda FIN: "yo tampoco tengo más".
4. Cliente ACK-ea: "entendido". Espera **2·MSL** (Maximum Segment Lifetime, ~2 min) en estado **TIME_WAIT** antes de cerrar definitivamente.

**Por qué TIME_WAIT:** asegurar que el último ACK llegue (si se pierde, el servidor retransmite FIN y debemos poder ACK-earlo de nuevo). Y evitar que segmentos viejos contaminen una nueva conexión con los mismos puertos.

## Segmento TCP

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |Reserv |U|A|P|R|S|F|         Window Size               |
| Offset|       |R|C|S|S|Y|I|                                   |
|       |       |G|K|H|T|N|N|                                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options                    |   Padding     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

Campos clave:

- **Source/Destination Port:** 16 bits cada uno.
- **Sequence Number:** offset en bytes del primer byte de datos en el stream.
- **ACK Number:** próximo byte esperado por el receptor (acumulativo).
- **Data Offset:** longitud del header en palabras de 32 bits.
- **Flags:** URG, ACK, PSH, RST, SYN, FIN.
- **Window Size:** **AdvertisedWindow**, cuántos bytes más el receptor está dispuesto a recibir.
- **Checksum:** cubre header + payload + pseudo-header con IPs.
- **Options:** MSS, Window Scale, SACK, Timestamps.

## Diagrama

{{diagram: TCPSegment}}

El diagrama desglosa el segmento. Marcá especialmente seq/ack y los flags más usados.

## Números de secuencia y ACK

- **Sequence:** indica la posición del primer byte de datos del segmento en el stream.
- **ACK:** indica el próximo byte que el receptor espera. Si recibí 1000 bytes ordenados, mando ACK=1001.

Los ACKs son **acumulativos**: si pierdo un segmento intermedio, mando ACK del último byte recibido en orden, no de los posteriores. SACK (Selective ACK) extiende esto.

## Ventana deslizante y AdvertisedWindow

El receptor anuncia en el header **cuánto buffer libre tiene**: `AdvertisedWindow`. El emisor mantiene:

```
LastByteSent - LastByteAcked <= AdvertisedWindow
```

Es decir, **no manda más de lo que el receptor puede absorber**. Esto es **control de flujo**.

A medida que el receptor lee del buffer y libera espacio, anuncia ventanas mayores en sus ACKs, permitiendo al emisor seguir. Si la ventana llega a 0, el emisor manda **probes** periódicos para no quedarse colgado.

## Diagrama

{{diagram: SlidingWindow}}

El diagrama ilustra cómo la ventana se desplaza al ritmo de los ACKs. Bytes enviados pero no ACK-eados están "en vuelo".

## Estados TCP

```
                CLOSED
                  |
       PASSIVE OPEN /  ACTIVE OPEN
              v          v
            LISTEN   SYN_SENT
              |          |
              v          v
         SYN_RCVD  ──→ ESTABLISHED ←── SYN_RCVD
                          |
                    CLOSE / FIN
                          |
                   /              \
            FIN_WAIT_1       CLOSE_WAIT
               |                  |
            FIN_WAIT_2         LAST_ACK
               |                  |
            TIME_WAIT          CLOSED
               |
            CLOSED
```

Los estados clave:

- **LISTEN:** servidor esperando SYNs.
- **SYN_SENT:** cliente que mandó SYN, espera SYN-ACK.
- **SYN_RCVD:** servidor recibió SYN, mandó SYN-ACK, espera ACK final.
- **ESTABLISHED:** conexión activa, intercambio de datos.
- **FIN_WAIT_1, FIN_WAIT_2:** el lado que cerró primero.
- **CLOSE_WAIT, LAST_ACK:** el lado pasivo del cierre.
- **TIME_WAIT:** post-cierre activo, esperando 2·MSL.

## Diagrama

{{diagram: TCPStateMachine}}

El diagrama representa la máquina de estados completa.

## RTO adaptativo

El timeout de retransmisión (RTO) no es fijo: se calcula en función del RTT observado. Si fuera muy corto, retransmitirías de más; muy largo, esperarías eternamente ante pérdidas.

### Karn y la regla

**Problema:** ¿cómo medir RTT cuando un segmento se retransmite? Si el ACK que llega es para la original, anota RTT mucho mayor que el real; si es para la retransmisión, anota mucho menor.

**Regla de Karn:** **no usar segmentos retransmitidos para calcular RTT**. Solo los entregados a la primera. Y duplicar el RTO en cada retransmisión (backoff exponencial).

### Algoritmo de Jacobson

Mejora el promedio con varianza:

$$
\textcolor{#a5e6b1}{\text{EstimatedRTT}} = (1-\alpha) \cdot \text{EstimatedRTT} + \alpha \cdot \textcolor{#a5c8f4}{\text{SampleRTT}}
$$

$$
\textcolor{#a5e6b1}{\text{DevRTT}} = (1-\beta) \cdot \text{DevRTT} + \beta \cdot |\text{SampleRTT} - \text{EstimatedRTT}|
$$

$$
\textcolor{#f4a5a5}{\text{RTO}} = \textcolor{#a5e6b1}{\text{EstimatedRTT}} + 4 \cdot \textcolor{#a5e6b1}{\text{DevRTT}}
$$

Con $\alpha = 0.125$ y $\beta = 0.25$ típicamente. Esto absorbe RTTs variables sin disparar timeouts prematuros.

## Casos clave / Ejemplos

**Ejemplo 1: handshake con valores.** Cliente elige ISN=10000. Servidor elige ISN=50000.

- C → S: SYN, seq=10000.
- S → C: SYN-ACK, seq=50000, ack=10001.
- C → S: ACK, seq=10001, ack=50001.

Ahora el cliente puede mandar datos a partir del byte 10001; el servidor a partir de 50001.

**Ejemplo 2: ACKs acumulativos con pérdida.** Cliente manda segmentos 1, 2, 3, 4 (cada 100 bytes). El 2 se pierde.

- Servidor recibe 1: ACK=101.
- Servidor recibe 3: vio gap. ACK=101 (duplicado).
- Servidor recibe 4: ACK=101 (otro duplicado).
- Cliente ve **3 ACKs duplicados**: dispara **Fast Retransmit** de 2.
- Servidor recibe 2: ACK=401 (cubre 1, 2, 3, 4 acumuladamente).

**Ejemplo 3: cálculo de RTO.** SampleRTT = 100 ms. Tras varias muestras, EstimatedRTT = 95 ms, DevRTT = 15 ms.

$$\textcolor{#f4a5a5}{\text{RTO}} = 95 + 4 \cdot 15 = 155 \text{ ms}$$

Cualquier ACK que tarde más de 155 ms dispara retransmisión.

## Errores frecuentes

- Pensar que TCP es por mensajes. **No**: stream de bytes. Si querés mensajes, los delimitás vos arriba.
- Confundir control de flujo (AdvertisedWindow) con control de congestión (CongestionWindow). El primero protege al **receptor**, el segundo protege a la **red**.
- Olvidar TIME_WAIT al rebooten servidor. Por eso un servicio caído puede tardar minutos en aceptar reconexiones (`SO_REUSEADDR` lo bypassea con cuidado).
- Suponer que TCP siempre llega. **No** si la conexión se rompe (RST). TCP detecta pero no resucita.
- Olvidar la regla de Karn al estimar RTT. Sin ella, retransmisiones distorsionan el cálculo.
- Pensar que 3 ACKs duplicados disparan retransmisión inmediata sin razón. Es **Fast Retransmit** (Reno), una optimización deliberada.

## Pregunta-trampa típica

> "¿Por qué TCP necesita 3 mensajes y no 2 para abrir conexión?"

Porque ambos lados eligen un ISN aleatorio y el otro debe confirmarlo. Con 2 mensajes, el iniciador no sabría si el servidor recibió el ACK; con 3, hay confirmación bidireccional. Es el mínimo para sincronizar **dos secuencias independientes**.

> "Si mando 1 byte, ¿el otro lado recibe 1 byte?"

Casi seguro que **eventualmente sí**, pero no necesariamente en un solo `read`. TCP puede agregar (Nagle), particionar (MSS, fragmentación), retransmitir, etc. La aplicación debe estar preparada para reads parciales.

> "¿Por qué TIME_WAIT dura tanto?"

Para garantizar que **todos los segmentos de la conexión vieja se extingan** antes de poder reusar los mismos puertos. Si un segmento perdido reaparece más tarde con la misma 5-tupla en una nueva conexión, podría corromper datos. MSL es por defecto 2 minutos, así que 2·MSL = 4 min.

## MSS, MTU y encapsulamiento

Righetti hace foco en cómo se encadenan los tamaños desde aplicación hasta enlace:

```
Application Message  ─→  TCP Segment  ─→  IP Packet  ─→  Ethernet Frame
                          [TCP hdr | data]   [IP hdr | data]   [Eth hdr | data | CRC]
```

- **MSS (Maximum Segment Size):** tamaño máximo del **payload** de un segmento TCP, sin contar headers. **Default: 536 bytes** (definido en RFC 879 para enlaces conservadores). Negociado en el SYN.
- **TCP header:** mínimo **20 bytes** (más opcional).
- **IP header:** **20 bytes** (mínimo) + opcional.
- **Ethernet header:** **14 bytes** + 4 bytes CRC.
- **MTU Ethernet:** **1500 bytes** (el "Maximum Transmission Unit" del frame Ethernet). Por eso un MSS típico en LAN es 1500 - 20 (IP) - 20 (TCP) = **1460 bytes**.
- **MTU default (RFC):** **576 bytes**, que da MSS default de 536. Conservador para internet legacy.

Esta cadena explica por qué **Path MTU Discovery** es importante y por qué fragmentación IP impacta el throughput TCP.

## Cuándo se envía un segmento

Righetti enumera explícitamente:

1. **Segmento full** (MSS bytes acumulados en el buffer).
2. **No está full, pero sucede TimeOut** (timer de transmisión, por ejemplo Nagle).
3. **Pushed por la aplicación** (flag PSH).

## Identificación de conexión: la 4-tupla

Righetti subraya que cada conexión TCP está identificada por una **4-tupla**:

$$(\textcolor{#a5c8f4}{\text{SrcPort}},\ \textcolor{#a5c8f4}{\text{SrcIPAddr}},\ \text{DstPort},\ \text{DstIPAddr})$$

Un servidor puede tener muchas conexiones simultáneas usando el mismo puerto local (típicamente bien conocido, ej. 80), pero cada conexión se distingue por el (IP, puerto) del cliente.

## Ventana deslizante: punteros detallados (Righetti)

Righetti detalla la implementación con punteros, que es contenido habitual de parcial.

**Lado Emisor (TX):**

- `LastByteWritten`: último byte que la aplicación escribió en el buffer TCP.
- `LastByteSent`: último byte enviado a la red.
- `LastByteAcked`: último byte cuyo ACK se recibió.

Relaciones invariantes: $\text{LastByteAcked} \leq \text{LastByteSent} \leq \text{LastByteWritten}$.

Los bytes entre `LastByteAcked` y `LastByteWritten` están **bufferados**: los anteriores ya fueron confirmados, los posteriores aún no fueron generados.

**Lado Receptor (RX):**

- `LastByteRead`: último byte que la aplicación leyó del buffer TCP.
- `NextByteExpected`: próximo byte que se espera (apunta al gap si hay reordenamiento).
- `LastByteRcvd`: último byte recibido.

Relaciones (menos intuitivas por el reordenamiento):

- $\text{LastByteRead} < \text{NextByteExpected}$ (un byte no puede leerse si no llegaron los previos).
- $\text{NextByteExpected} \leq \text{LastByteRcvd} + 1$ (igualdad si todo está en orden; menor si hay gap).

## Fórmulas de Control de Flujo

**Lado RX (Receptor):**

$$\textcolor{#a5c8f4}{\text{LastByteRcvd}} - \textcolor{#a5c8f4}{\text{LastByteRead}} \leq \textcolor{#f4a5a5}{\text{MaxRcvBuffer}}$$

$$\textcolor{#a5e6b1}{\text{AdvertisedWindow}} = \textcolor{#f4a5a5}{\text{MaxRcvBuffer}} - (\text{LastByteRcvd} - \text{LastByteRead})$$

**Lado TX (Emisor):**

$$\textcolor{#a5c8f4}{\text{LastByteSent}} - \textcolor{#a5c8f4}{\text{LastByteAcked}} \leq \textcolor{#a5e6b1}{\text{AdvertisedWindow}}$$

$$\textcolor{#a5e6b1}{\text{EffectiveWindow}} = \textcolor{#a5e6b1}{\text{AdvertisedWindow}} - (\text{LastByteSent} - \text{LastByteAcked})$$

$$\textcolor{#a5c8f4}{\text{LastByteWritten}} - \textcolor{#a5c8f4}{\text{LastByteAcked}} \leq \textcolor{#f4a5a5}{\text{MaxSendBuffer}}$$

**Bloquear TX** si $(\text{LastByteWritten} - \text{LastByteAcked}) + y > \text{MaxSendBuffer}$, donde $y$ son los bytes que se desean escribir.

**Persistir:** cuando $\text{AdvertisedWindow} = 0$, el emisor manda **probes de 1 byte** periódicamente para no quedarse colgado esperando una ventana abierta cuyo anuncio podría haberse perdido.

## RTT y RTO: visión de teoría de control

Righetti enmarca la estimación del RTT como un **lazo cerrado** de teoría de control: el RTO es un **valor adaptativo** que debe responder a cambios de RTT por congestión y por cambios de ruta.

Observa que la **distribución del tiempo de llegada de ACKs** en TCP es **mucho más dispersa** que en un nivel de enlace, donde los RTTs son más estables. Esto motiva el uso de varianza (Jacobson/Karels) y no solo media.

### Algoritmo original

$$\textcolor{#a5e6b1}{\text{EstimatedRTT}} = \alpha \cdot \text{EstimatedRTT} + (1-\alpha) \cdot \textcolor{#a5c8f4}{\text{SampleRTT}_i}$$

Con $\alpha + (1-\alpha) = 1$, $\alpha \leq 0.9$ y $(1-\alpha) \leq 0.2$ típicos.

$$\textcolor{#f4a5a5}{\text{TimeOut}} = 2 \cdot \textcolor{#a5e6b1}{\text{EstimatedRTT}}$$

### Karn/Partridge (1987)

Righetti señala **dos reglas** de Karn/Partridge:

1. **No considerar los RTT de paquetes retransmitidos** (no se sabe si el ACK era para la original o la retransmisión).
2. **Duplicar TimeOut luego de cada retransmisión** (exponential backoff).

### Jacobson/Karels (1988)

Considera la varianza:

$$\textcolor{#a5e6b1}{\text{Diff}} = \textcolor{#a5c8f4}{\text{SampleRTT}} - \textcolor{#a5e6b1}{\text{EstRTT}}$$

$$\textcolor{#a5e6b1}{\text{EstRTT}} = \text{EstRTT} + \delta \cdot \text{Diff}$$

$$\textcolor{#a5e6b1}{\text{Dev}} = \text{Dev} + \delta \cdot (|\text{Diff}| - \text{Dev})$$

Con $\delta$ típico $= 1/8$.

$$\textcolor{#f4a5a5}{\text{TimeOut}} = \mu \cdot \textcolor{#a5e6b1}{\text{EstRTT}} + \phi \cdot \textcolor{#a5e6b1}{\text{Dev}}$$

Con $\mu = 1$ y $\phi = 4$ típicos.

**Observación de Righetti:** los algoritmos son tan buenos/malos como la **granularidad de su reloj** (500 ms en Unix-like). Un mecanismo preciso de timeout **es importante para controlar la congestión** (anticipa el tema siguiente).

## Bandwidth × Delay Product (mantener el caño lleno)

Una pregunta clave para Righetti: **¿alcanza una ventana de 16 bits (64 KB) para llenar el caño?**

Asumiendo RTT de 100 ms, BDP = BW × RTT:

| Enlace | BW × Delay |
|--------|-----------|
| T1 (1.5 Mbps) | 18 KB |
| Ethernet (10 Mbps) | 122 KB |
| T3 (45 Mbps) | 549 KB |
| FDDI (100 Mbps) | 1.2 MB |
| STS-3 (155 Mbps) | 1.8 MB |
| STS-12 (622 Mbps) | 7.4 MB |
| STS-24 (1.2 Gbps) | 14.8 MB |

El `AdvertisedWindow` de 16 bits (64 KB) **se queda corto desde Ethernet en adelante**. Por eso existe la opción **Window Scaling** (RFC 1323) que aplica un shift factor para anunciar ventanas mayores.

## TCP vs Nivel de Enlace (Righetti)

Diferencias clave que el docente subraya:

- TCP **potencialmente conecta muchas máquinas distintas** → requiere setup/release explícitos.
- TCP **enfrenta RTTs muy variables** → necesita timeouts adaptativos.
- TCP **enfrenta largos retardos** → debe estar preparado para arrivar paquetes muy viejos (TIME_WAIT).
- TCP **enfrenta capacidades distintas** del destino → control de flujo (AdvertisedWindow).
- TCP **enfrenta capacidad variable de red** → control de congestión.

Una capa de enlace no enfrenta ninguno de estos problemas con la misma intensidad.

## Énfasis del docente (Righetti)

- **Cita histórica a Vinton Cerf**: en sus diapositivas pone explícitamente "Vinton Cerf en Exactas-UBA, 22-08-2007". Cerf y Kahn 1974 es la referencia fundacional. Frase posible: "los errores e inconsistencias del RFC 793" (1981) que el RFC 1122 (1989) salvó.
- **Servicios End-to-End deseados**: él lista los siete servicios que la capa transporte debe ofrecer sobre un nivel de red best-effort: garantía de entrega, orden, no duplicados, mensajes largos, sincronización, control de flujo, multiplexación.
- **Política Go-Back-N en la ventana deslizante TCP**: él la menciona explícitamente como la política de retransmisión base (aunque SACK la modifica). El receptor anuncia ventanas de **4 KB a 8 KB durante el connection setup** típicamente.
- **Manejo de conexión: 3-way handshake / 2-2 o 4-way handshake**: él insiste en que el release puede ser 2-2 (cada lado independiente) o 4-way (con esperas). El **caso ideal** es lo que se ve en las diapositivas; el RFC 793 plantea varios escenarios reales.
- **Sockets Berkeley**: él enumera las primitivas (LISTEN, CONNECT, CLOSE, SEND, etc.) y los eventos (SYN, ACK, FIN, RST). En la máquina de estados, líneas continuas = cliente, líneas punteadas = servidor.
- **Granularidad del reloj (500 ms en Unix-like)**: detalle muy específico que él subraya. Un RTO calculado en 155 ms no se cumple realmente: el reloj solo dispara cada 500 ms.
- **Fórmulas del control de flujo con punteros**: él pone las fórmulas explícitas (LastByteRcvd, LastByteRead, etc.) y suele pedirlas. Memorizar.
- **MSS default = 536 bytes** y **MTU default = 576 bytes**: valores históricos del RFC 879 que él recuerda.
- **Mantener el caño lleno con BDP**: tabla específica que él muestra para argumentar por qué AdvertisedWindow de 16 bits es insuficiente en enlaces de alto BDP. Pregunta-clave probable.
- **Vocabulario textual**: "stream de bytes", "ventana deslizante", "control de flujo evita que el TX inunde al Rx", "control de congestión evita que el TX sobrecargue a la red", "exponential backoff", "Karn/Partridge", "Jacobson/Karels", "retransmisión adaptativa", "valor adaptativo de timeout de ReTX (lazo cerrado, teoría de control)".

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Bajar una imagen ISO de 4 GB
Bajás Ubuntu desde un mirror argentino. TCP abre conexión (3-way handshake, ~50 ms). Empieza a mandar segmentos de 1460 bytes. Tu PC tiene buffer de recepción de 4 MB, anuncia ventana grande. Si un segmento se pierde, el receptor manda 3 ACKs duplicados, fast retransmit, y sigue. Al final cierra con 4-way FIN. Toda la descarga, byte por byte ordenado, sin que vos hagas nada.

**Por qué importa acá**: TCP en estado puro. El stream de bytes es la abstracción que hace que `wget` "simplemente funcione" aunque IP esté perdiendo paquetes.

### SSH desde el subte (BadTCP)
Estás haciendo `ssh produccion` desde el subte. La señal va y viene. TCP retransmite por timeout, pero RTT cambia entre 50 ms (señal buena) y 2000 ms (señal cae). Si el RTO no fuera adaptativo (Jacobson), o saturarías la red con retransmisiones inútiles, o esperarías eternidades. Con backoff exponencial de Karn, los RTOs aumentan: 200ms, 400ms, 800ms, 1600ms.

**Por qué importa acá**: muestra el RTO adaptativo en acción. Sin Jacobson/Karels, SSH sería inusable en redes móviles. La regla de Karn evita que las retransmisiones contaminen la estimación.

### Abrir gmail.com en el navegador
Tipeás "gmail.com" + Enter. Chrome resuelve DNS, abre TCP al puerto 443 de Google (3-way handshake), encima TLS hace su handshake, encima HTTP/2 manda el GET. Cada uno de esos 3 RTTs son ~30 ms desde Argentina hasta servidor en USA. Por eso desde una conexión "rápida" (200 Mbps), abrir Gmail tarda ~300 ms — está dominado por latencia, no por bandwidth.

**Por qué importa acá**: ilustra que TCP tiene un costo de setup (3-way handshake) que importa para conexiones cortas. Por eso HTTP/2 reusa conexiones, y QUIC (HTTP/3) directamente usa UDP para reducir RTTs.

## Conexiones

- Se conecta con **IP**: TCP corre sobre IP, agrega fiabilidad que IP no da.
- Relaciona con **enlace** porque sliding window y ACKs son herederos de los protocolos de nivel enlace.
- Vincula con **congestión** (próximo tema): la lógica de detectar pérdida y ajustar ventana es la base del control de congestión TCP.
- Se compara con **UDP** que renuncia a todo esto a cambio de simplicidad y latencia.
