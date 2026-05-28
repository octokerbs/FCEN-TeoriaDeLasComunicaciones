---
slug: congestion
title: Control de congestión (AIMD, Slow Start, Reno, RED)
category: transporte
order: 13
diagrams: [CongestionControl]
---

## Por qué importa

Si todos los emisores transmiten al máximo, los routers se saturan, las colas se llenan, los paquetes se descartan, las retransmisiones empeoran la carga y la red colapsa. Eso es **congestion collapse**, ocurrido en internet en 1986 cuando el throughput cayó tres órdenes de magnitud. La respuesta fue inventar **control de congestión en TCP**: cada conexión limita su velocidad según las pérdidas que detecta.

Es uno de los logros más elegantes de la ingeniería de redes: un sistema **distribuido, sin coordinación central, sin información explícita**, que mantiene internet estable a pesar de millones de conexiones simultáneas. Todos los hosts cooperan implícitamente bajando la velocidad cuando hay congestión.

## Intuición

Imaginá que entrás a una autopista. ¿Cuán rápido vas? Comenzás lento, acelerás hasta sentir que el tráfico se traba: ahí frenás. Eso es **AIMD**: aumentar lentamente, frenar fuerte ante el primer indicio de problema.

¿Cómo "sentís" la congestión sin radio del gobierno? Por las **pérdidas** (autos parados que ves, retransmisiones que necesitás). TCP usa lo mismo: si un paquete se pierde, asume que algún router está saturado y descartó. Baja la velocidad.

## Control de flujo vs control de congestión

Conviene distinguirlos claramente:

| Aspecto | Control de flujo | Control de congestión |
|---------|------------------|----------------------|
| Protege a | Receptor | Red intermedia |
| Mecanismo | AdvertisedWindow (explícito) | CongestionWindow (implícito) |
| Señal | Buffer del receptor lleno | Pérdidas / timeouts |
| Ámbito | Por conexión | Por conexión, pero el efecto agregado regula la red |
| Quién decide | Receptor | Emisor (en base a inferencia) |

Una conexión TCP toma el **mínimo** de ambas ventanas:

$$\textcolor{#a5e6b1}{\text{EffectiveWindow}} = \min(\text{AdvertisedWindow},\ \text{CongestionWindow})$$

## M/M/1: modelo de cola básico

Un router con cola se modela como cola M/M/1: arrivals Poisson, servicio exponencial, un servidor. Sea $\lambda$ la tasa de llegada y $\mu$ la de servicio:

$$\textcolor{#a5e6b1}{\rho} = \frac{\textcolor{#f4a5a5}{\lambda}}{\mu} \quad \text{(utilización)}$$

$$\textcolor{#a5e6b1}{E[N]} = \frac{\textcolor{#a5e6b1}{\rho}}{1-\rho} \quad \text{(largo medio de cola)}$$

$$\textcolor{#a5e6b1}{E[T]} = \frac{1}{\mu - \textcolor{#f4a5a5}{\lambda}} = \frac{1/\mu}{1-\rho} \quad \text{(tiempo medio en sistema)}$$

**Interpretación:** a medida que $\rho \to 1$, $E[N]$ y $E[T]$ explotan a infinito. Por eso una utilización del 99% **no es buena**: las colas crecen muchísimo y los delays se disparan. Las redes operan típicamente al 60-70% para tener margen.

## Métricas

- **Throughput / goodput:** bytes útiles por segundo. Goodput excluye retransmisiones.
- **Latencia (RTT):** tiempo ida y vuelta. Crece con la cola en routers (queueing delay).
- **Jitter:** variación del RTT.
- **Pérdida (loss):** fracción de paquetes que no llegan.
- **Fairness:** cómo se reparte el ancho de banda entre conexiones competidoras.

## Soluciones a la congestión

### Implícita vs explícita

- **Implícita:** el emisor infiere congestión por **pérdidas** o **demora**. TCP clásico opera así.
- **Explícita:** los routers **señalan** congestión sin descartar. Ej: **ECN** (Explicit Congestion Notification) marca paquetes con bit CE; el receptor lo refleja al emisor.

ECN es más eficiente (no perdés paquetes) pero requiere apoyo en routers, hosts y a veces middleboxes.

### Routers: FIFO drop-tail vs RED

- **Drop-tail:** la cola del router descarta al llegar a su capacidad. Simple, pero causa **sincronización global** (todos los TCPs pierden a la vez, bajan a la vez, suben juntos, vuelven a saturar).
- **RED (Random Early Detection):** descarta paquetes **antes** de que la cola se llene, con probabilidad creciente. Esto **avisa** a los emisores antes del colapso y **desincroniza** las reducciones.

### RED parámetros

```
            Probabilidad
            de descarte
                1.0 |             /
                    |           /
                    |         /
                MaxP|       /
                    |      /
                    |     /
                  0 |____/__________
                       |    |    |   AvgLen
                     MinTh MaxTh MaxCapacity
```

- **MinThreshold:** cola por debajo, nunca se descarta.
- **MaxThreshold:** cola por encima, se descarta con probabilidad MaxP.
- **AvgLen:** promedio móvil de la cola (no instantáneo, para suavizar bursts).
- Entre umbrales: probabilidad lineal de descarte.

Por encima de MaxCapacity, drop-tail clásico (sin más opción).

### FRED (Flow Random Early Drop)

Extensión de RED que **diferencia conexiones**: penaliza más a las que ocupan más cola, premiando a las "tímidas". Mejora fairness, especialmente contra flujos UDP agresivos.

## TCP Tahoe / Reno: AIMD

**TCP Tahoe** (Jacobson 1988) introdujo el control de congestión moderno. **TCP Reno** lo refinó con Fast Recovery.

### Variables clave

- **CongestionWindow (cwnd):** ventana de congestión, en bytes (o MSS).
- **ssthresh (slow start threshold):** límite entre slow start y congestion avoidance.
- **MSS (Maximum Segment Size):** típicamente 1460 bytes.

### Slow Start

Comienza con cwnd = 1 MSS. **Por cada ACK recibido, cwnd += 1 MSS.** En un RTT, todos los segmentos en vuelo se ACK-ean, así que cwnd **se duplica** cada RTT.

```
RTT 0: cwnd=1, manda 1 segmento.
RTT 1: ACK recibido, cwnd=2, manda 2.
RTT 2: 2 ACKs, cwnd=4, manda 4.
RTT 3: 4 ACKs, cwnd=8, manda 8.
...
```

Es crecimiento **exponencial**, no "lento". El nombre es histórico (comparado con mandar de golpe).

Slow start dura **hasta** que cwnd alcanza ssthresh **o** hay pérdida.

### Congestion Avoidance

Una vez en avoidance, **por cada RTT** se incrementa cwnd en 1 MSS (no por cada ACK). Implementación práctica:

$$\textcolor{#a5e6b1}{\text{cwnd}} \mathrel{+}= \frac{\textcolor{#f4a5a5}{\text{MSS}}}{\text{cwnd}} \quad \text{por cada ACK}$$

Es crecimiento **lineal**.

### Detección de pérdida

Dos formas:

1. **Timeout (RTO):** mucho tiempo sin ACK. Indica congestión severa.
2. **Triple ACK duplicado:** 3 ACKs por el mismo seq. Indica pérdida puntual con red sana.

### Tahoe: respuesta a pérdida

Ambos casos:

```
ssthresh = cwnd / 2
cwnd = 1 MSS
Volver a Slow Start.
```

Muy conservador: cualquier pérdida te resetea.

### Reno: Fast Retransmit + Fast Recovery

**Fast Retransmit:** al recibir 3 ACKs duplicados, **retransmite inmediatamente** sin esperar timeout.

**Fast Recovery:** tras Fast Retransmit, no vuelve a slow start. En cambio:

```
ssthresh = cwnd / 2
cwnd = ssthresh         (no a 1)
Entrar en Congestion Avoidance directamente.
```

Esto se llama **AIMD** (Additive Increase, Multiplicative Decrease):

- Subo de a 1 MSS por RTT (additive).
- Bajo a la mitad ante pérdida (multiplicative).

## Diagrama

{{diagram: CongestionControl}}

El diagrama muestra cwnd vs tiempo: crecimiento exponencial (slow start) que se transforma en lineal al alcanzar ssthresh; ante pérdida (timeout o 3-DupACK), salto hacia abajo y reinicio.

## Fórmula de Mathis

Aproxima el throughput estable de TCP en función de pérdidas y RTT:

$$\textcolor{#a5e6b1}{\text{BW}} \approx \frac{\textcolor{#f4a5a5}{\text{MSS}}}{\textcolor{#f4a5a5}{\text{RTT}} \cdot \sqrt{\textcolor{#f4a5a5}{p}}}$$

Donde $p$ es la tasa de pérdida. Implicación: **TCP es muy sensible al RTT y a las pérdidas**.

**Ejemplo:** MSS = 1460 bytes, RTT = 100 ms, $p = 10^{-4}$.

$$\textcolor{#a5e6b1}{\text{BW}} \approx \frac{1460 \cdot 8}{0.1 \cdot 0.01} = \frac{11680}{0.001} \approx 11.7 \text{ Mbps}$$

Para enlaces largos (RTT alto) con cualquier pérdida significativa, TCP queda corto frente al BDP teórico. Por eso enlaces transcontinentales necesitan TCP tuning o algoritmos alternativos (BBR).

## TCP variants modernos

- **NewReno:** Reno mejorado para múltiples pérdidas en una misma ventana.
- **CUBIC** (default en Linux): crecimiento cúbico de cwnd, mejor uso de BDP grandes.
- **BBR** (Bottleneck Bandwidth and RTT, Google): mide BW y RTT, no espera a pérdidas. Más agresivo y eficaz.
- **Vegas:** detecta congestión por aumento de RTT, no por pérdida.

## Casos clave / Ejemplos

**Ejemplo 1: Slow start a Congestion Avoidance.** cwnd=1, ssthresh=64. Cada RTT, cwnd se duplica: 1, 2, 4, 8, 16, 32, 64. Al llegar a 64 entra en CA. Crece +1 por RTT: 65, 66, 67...

**Ejemplo 2: Reno con pérdida.** cwnd=80, recibe 3 DupACK. ssthresh = 40, cwnd = 40, entra en CA. Crece +1: 41, 42, 43... Hasta la próxima pérdida.

**Ejemplo 3: utilización M/M/1.** $\lambda = 90$ paquetes/s, $\mu = 100$. $\rho = 0.9$. $E[N] = 9$ paquetes en sistema. $E[T] = 1/(100-90) = 100$ ms. Si $\lambda$ sube a 99: $\rho = 0.99$, $E[N] = 99$, $E[T] = 1$ s. **Pequeño aumento de carga, gran aumento de delay.**

## Errores frecuentes

- Confundir slow start con "lento". Es **exponencial**, lo único lento es el arranque desde 1.
- Pensar que cwnd se ajusta por byte. Se ajusta por **ACK** (o por RTT), en unidades de MSS típicamente.
- Olvidar que TCP NO sabe distinguir pérdida por congestión vs pérdida por ruido (Wi-Fi malo). Por eso TCP sobre Wi-Fi a veces baja velocidad innecesariamente.
- Confundir Tahoe con Reno. Tahoe vuelve a slow start; Reno sigue en CA tras Fast Retransmit.
- Suponer que AIMD garantiza fairness. Lo aproxima en flujos similares, pero RTTs distintos resultan en BWs distintas (RTT-unfairness).
- Olvidar la fórmula de Mathis al evaluar performance. Pérdidas del 1% sobre enlaces de 100ms ya limitan severamente TCP.

## Pregunta-trampa típica

> "Si el ancho de banda físico es 1 Gbps y la latencia es 50 ms, ¿por qué TCP no llega a 1 Gbps?"

Por BDP y por la fórmula de Mathis. El BDP es $10^9 \cdot 0.05 = 50$ Mbits = 6.25 MB. Si la ventana TCP es chica (default Linux puede ser 64KB), no alcanza. Si hay pérdida $p = 10^{-5}$:

$$\textcolor{#a5e6b1}{\text{BW}} \approx \frac{12000}{0.05 \cdot 0.003} = 76 \text{ Mbps}$$

Para llegar a 1 Gbps necesitarías $p < 10^{-7}$ o ventanas enormes (window scaling + buffers tuneados).

> "¿Por qué Reno baja cwnd a la mitad y no a 0?"

Porque la red probablemente está **algo** congestionada, no totalmente. Reset a 1 (Tahoe) es excesivo si fue una pérdida puntual. Bajar a la mitad mantiene flujo razonable mientras se cede capacidad. Es resultado empírico calibrado contra simulaciones y experimentos.

> "¿RED ayuda a TCP o a UDP?"

A TCP, principalmente. Al descartar antes de que la cola estalle, RED señala a TCP que baje **temprano**, desincronizadamente. UDP **no escucha**: a un emisor UDP terco, RED no lo frena (aunque le descarta sus paquetes igual). FRED y otras variantes intentan penalizar específicamente a flujos no-responsive.

## Énfasis del docente (Righetti)

Esta es **la teórica más larga del docente** (~40K de diapos) y es **el tema central del final** — Righetti lo toma en 7 de los 14 últimos finales.

- **Fuentes que cita textualmente**:
  - Jacobson & Karels, *Congestion Avoidance and Control*, ACM SIGCOMM '88. Es **la** referencia obligada.
  - Mathis et al., *The Macroscopic Behavior of the TCP Congestion Avoidance Algorithm*, ACM CCR 1997. Suele preguntar la fórmula en final.
  - Peterson & Davie, capítulo 6 (págs 479-499 y 499-530) como bibliografía obligatoria.

- **Encuadre conceptual**: arranca con **multiplexación estadística** ("tenemos que pensar en términos de distribuciones estadísticas") y **administración de buffers**. Usa el ejemplo de N×100 Mbps agregándose en un enlace WAN de 3 Mbps para mostrar el cuello de botella natural.

- **Definición textual** que pide en final: *"Congestión: estado de sobrecarga **sostenida** de una red, donde la demanda de recursos (enlaces y buffers) se encuentra al límite o excede la capacidad de los mismos. La consecuencia es perceptible en términos de **QoS degradada**"*. Subrayá "sostenida" — distingue congestión de una ráfaga puntual.

- **Análisis con M/M/1**: parte de la teoría de colas. Distingue $\lambda$ (tasa de arribos), $\mu$ (tasa de servicio), $\rho = \lambda/\mu$ (intensidad). Insiste: *"si y solo si $\rho < 1$ se puede alcanzar un estado estacionario"*. Esperanza de paquetes en el sistema: $E(N) = \rho/(1-\rho)$. Esperanza de tiempo: $E(T) = E(N)/\lambda$.

- **Antecedente histórico** que le gusta usar: el **gobernador centrífugo de la máquina de vapor de James Watt (~1760)** como ejemplo primigenio de control automático con realimentación negativa. Aparece en la primera diapo de la sección de teoría de control. Si lo nombrás en el oral, le va a gustar.

- **Taxonomía de Yang & Reddy (1995)**: la usa explícitamente para clasificar algoritmos.
  - **Lazo abierto**: redes de circuitos (GMPLS).
  - **Lazo cerrado**:
    - **Realimentación implícita**: TCP (Tahoe, Reno, Vegas, CUBIC, SCTP). "End-to-end congestion control".
    - **Realimentación explícita**: DECbit, ECN, ATM ABR, ICMP source quench. "Network-assisted congestion control".

- **Distinción clave que cae en final**: *Congestion Control* = **reactivo**, *Congestion Avoidance* = **preventivo (proactivo)*. RED es avoidance; AIMD reacciona a pérdidas → control.

- **RED al detalle** (lo desarrolla extensamente):
  - $AvgLen = (1 - W) \cdot AvgLen + W \cdot SampleLen$ con $0 < W < 1$. AvgLen es la versión "suavizada" del SampleLen instantáneo. Lo llama *"realidad discreta vs aproximación fluida"*.
  - Dos umbrales: $MinThreshold$ y $MaxThreshold$.
  - Regla:
    - $AvgLen \leq MinThreshold$: encolar.
    - $MinThreshold < AvgLen < MaxThreshold$: descartar con probabilidad $P$ creciente.
    - $AvgLen \geq MaxThreshold$: descartar siempre.
  - **Insiste** en por qué usa promedio: para tolerar ráfagas. Y por qué descarta probabilísticamente: para **evitar sincronización global** de TCPs.

- **AIMD como motor de la equidad**: cuando se pregunta "¿por qué TCP es equitativo?" la respuesta esperada es geométrica: additive increase mueve la pareja $(x_1, x_2)$ paralela a la diagonal, multiplicative decrease la acerca al origen. Converge a la diagonal de equidad. **UDP no se autorregula → tráfico egoísta**.

- **Fórmula de Mathis que cae en final**:
  $$\textcolor{#a5e6b1}{BW} = \frac{\textcolor{#f4a5a5}{MSS} \cdot C}{\textcolor{#f4a5a5}{RTT} \cdot \sqrt{\textcolor{#f4a5a5}{p}}}$$
  con $C \approx 1.22$ para Reno, $p$ probabilidad de pérdida. La pregunta típica: *"¿qué relación tiene con un protocolo de ventana deslizante a nivel enlace?"* — la analogía es que en ambos el throughput depende de cuántos segmentos hay en vuelo y de cómo las pérdidas reducen esa ventana.

- **TCP como sistema de control** (le encanta esta lectura): identifica setpoint, sensor, actuador, lazo. Los timeouts y ACK duplicados son los sensores; CWND es la variable de control; la red es el sistema a controlar.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Netflix en hora pico (21:30)
Te ponés a ver Stranger Things a las 21:30, el horario donde toda Argentina mira Netflix. Tu conexión es de 200 Mbps pero recibís solo 15 Mbps reales — el ISP está congestionado en el peering con Open Connect (CDN de Netflix). TCP detecta pérdidas, baja cwnd a la mitad, lo va recuperando. El bitrate adaptativo de Netflix nota que llegan pocos bytes, baja de 4K a 1080p. Todo automático.

**Por qué importa acá**: AIMD en vivo. Cada conexión TCP en el cuello de botella se autorregula sin coordinación. Es la razón por la que internet no colapsa en hora pico.

### Descarga lenta a las 9 AM del lunes
En la oficina, lunes 9 AM, 200 personas abren Outlook, Teams, Slack a la vez. El uplink corporativo de 100 Mbps se satura. Los routers empiezan a llenar colas, retransmisiones se multiplican. RED en el router del proveedor empieza a descartar paquetes probabilísticamente para "avisar" a TCPs antes del colapso. Cada conexión baja cwnd, la oficina entera anda lento pero estable.

**Por qué importa acá**: ilustra RED vs drop-tail. Sin RED, todos los TCPs perderían a la vez (sincronización global) y verías oscilación. Con RED, las reducciones se desincronizan y el throughput agregado es más estable.

### Llamada Zoom vs descarga Steam simultáneas
Estás en una reunión Zoom (UDP, ~2 Mbps) y a la vez Steam baja un juego (TCP, hasta 100 Mbps). En tu casa, ambas comparten 100 Mbps de internet. Cuando se satura el upload, Zoom sigue mandando porque UDP no se autorregula, pero TCP de Steam baja cwnd. Resultado: Zoom queda bien, Steam baja a 50 Mbps. **El usuario "egoísta" (UDP) gana**.

**Por qué importa acá**: muestra el problema del tráfico egoísta. Por eso el docente subraya que apps UDP serias (QUIC, WebRTC) implementan su propio control TCP-friendly — sino los routers terminan necesitando FRED.

## Conexiones

- Se conecta con **TCP** porque cwnd vive ahí. Sin TCP no hay control implícito.
- Relaciona con **UDP** por contraste: UDP no se autorregula, por eso es problemático en masa.
- Vincula con **routers** porque las soluciones explícitas (RED, ECN) viven en routers.
- Se relaciona con **Shannon-canal** indirectamente: la capacidad física es una; lo que TCP puede usar es otra, limitada por el algoritmo de control.
