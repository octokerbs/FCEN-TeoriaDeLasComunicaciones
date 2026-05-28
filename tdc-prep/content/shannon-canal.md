---
slug: shannon-canal
title: Capacidad de canal y ruido (Shannon)
category: shannon
order: 2
diagrams: [ShannonChannel]
---

## Por qué importa

Una vez que sabés cuánta información genera tu fuente (entropía), la pregunta natural es: **¿cuánto se puede transmitir por un canal real?** Un cable, un enlace de radio, una fibra óptica: todos tienen un límite físico. Shannon demostró que ese límite existe, es finito, y se puede calcular sabiendo solo dos cosas: **el ancho de banda** y **la relación señal-ruido**.

Esto explica por qué tu Wi-Fi de 80 MHz puede dar gigabits, por qué un módem 56k no podía pasar de ahí, y por qué los enlaces satelitales con SNR baja necesitan modulaciones robustas y antenas grandes.

## Intuición

Imaginá un canal como una autopista. El ancho de banda $B$ es **cuántos carriles** tiene; la SNR es **qué tan visibles son los carriles** entre la niebla (ruido). Más carriles y mejor visibilidad significan más autos por segundo de forma confiable.

Si la niebla (ruido) es muy densa, igual podés pasar autos: pero tenés que ir despacio o usar autos muy distintos entre sí (señales muy separadas), porque si dos autos se parecen mucho, los confundís. Por eso aumentar la potencia (señal) o reducir el ruido sube la capacidad, pero solo en forma **logarítmica**: duplicar SNR no duplica la capacidad.

## Formalización

**Fórmula de Shannon-Hartley** para canal con ruido gaussiano (AWGN):

$$\textcolor{#a5e6b1}{C} = \textcolor{#a5c8f4}{B} \cdot \log_2(1 + \text{SNR}) \quad \text{[bits/segundo]}$$

Donde:

- $B$ = ancho de banda del canal en Hz.
- $\text{SNR} = P_{\text{señal}} / P_{\text{ruido}}$ (razón de potencias, lineal, sin unidades).
- $C$ = capacidad máxima teórica: la máxima velocidad a la que se puede transmitir con **probabilidad de error tan baja como se quiera**.

**SNR en decibeles:**

$$\textcolor{#a5e6b1}{\text{SNR}_{\text{dB}}} = 10 \log_{10}(\text{SNR})$$

Conversiones útiles: 0 dB = SNR 1, 10 dB = SNR 10, 20 dB = SNR 100, 30 dB = SNR 1000.

**Capacidad de Nyquist (canal sin ruido):**

$$\textcolor{#a5e6b1}{C_{\text{Nyquist}}} = 2\textcolor{#a5c8f4}{B} \log_2 \textcolor{#a5c8f4}{M} \quad \text{[bits/segundo]}$$

Donde $M$ es el número de niveles de la señal. Sin ruido podés usar infinitos niveles y mandar info infinita. Con ruido, Shannon te corta el chorro.

**Baudio (velocidad de modulación):** Righetti insiste en la distinción:

- 1 **baudio** = 1 estado de señalización por segundo (símbolos/seg).
- 1 baudio = 1 bps **solo si $M=2$**. Si $M=4$, 1 baudio = 2 bps. Si $M=16$, 1 baudio = 4 bps.
- Relación entre velocidad de transmisión $V_t$ y velocidad de modulación $V_m$: $V_t = V_m \cdot N$ con $N = \log_2 M$ bits/símbolo.

**Combinación Nyquist + Shannon (restricción sobre $M$):** dado que Nyquist dice $C = 2B \log_2 M$ y Shannon dice $C = B \log_2(1+\text{SNR})$, igualando se obtiene una cota sobre el número de niveles utilizables:

$$\textcolor{#f4a5a5}{M} \leq \sqrt{1 + \text{SNR}}$$

"No se podrá aumentar $M$ tanto como se quiera" — la SNR define el techo.

## Diagrama

{{diagram: ShannonChannel}}

El diagrama representa el modelo general: una fuente emite un mensaje, un codificador lo convierte en señal, el canal le agrega ruido $n(t)$, el receptor decodifica y entrega al destino. La capacidad $C$ es el máximo flujo de información que sobrevive al ruido.

## Componentes que degradan la señal

Righetti agrupa las perturbaciones en cuatro causas (con esta nomenclatura exacta):

- **Atenuación y distorsión de atenuación:** la señal pierde intensidad con la distancia y "se ve más afectada a mayores frecuencias". La señal recibida debe ser (a) suficiente para que se detecte y (b) suficientemente mayor que el ruido para que se reciba sin error. Se corrige con **ecualización** (amplificar más las frecuencias altas). Problema "menos grave" para señales digitales.
- **Distorsión de retardo:** "solo en medios guiados". La velocidad de propagación varía con la frecuencia, así que las componentes de Fourier llegan al receptor en distintos instantes, originando desfasajes. Para una señal limitada en frecuencia, la velocidad es mayor cerca de la frecuencia central.
- **Ruido:** señales adicionales insertadas entre transmisor y receptor. Se subdivide en:
  - **Ruido térmico:** debido a la agitación térmica de los electrones; aumenta linealmente con la temperatura absoluta. Densidad Espectral de Potencia: $N_0 = k \cdot T$. Potencia total en un ancho de banda $B$: $N = N_0 \cdot B = k \cdot T \cdot B$. Distribuido uniformemente en frecuencia ("ruido blanco").
  - **Ruido por intermodulación:** señales que son suma y diferencia de frecuencias originales y sus múltiplos $(m f_1 \pm n f_2)$. Se produce por falta de linealidad en el canal.
  - **Ruido por diafonía:** una señal de una línea interfiere en otra (crosstalk).
  - **Ruido impulsivo:** impulsos irregulares o picos (ej. interferencia electromagnética externa por tormenta). Corta duración, gran amplitud, **disruptivo**.

**Sobre la frecuencia de corte y el dB:** Righetti repite que "formalmente la frecuencia de corte es donde se produce una atenuación de 3 dB (la potencia de entrada se reduce a la mitad)". Convención: $\mathrm{dB} = 10 \log_{10}(P_1/P_2)$; **3 dB es "el doble"** (o la mitad, según el sentido).

## Casos clave / Ejemplos

**Ejemplo 1: línea telefónica.** $B = 3100$ Hz, SNR = 30 dB (= 1000 lineal).

$$\textcolor{#a5e6b1}{C} = 3100 \cdot \log_2(1001) \approx 3100 \cdot 9.97 \approx 30{,}900 \text{ bps}$$

Por eso los módems clásicos rondaban los 33.6 kbps. Los 56k explotaban asimetría del canal digital del ISP.

**Ejemplo 2: canal Wi-Fi 802.11ac.** $B = 80$ MHz, SNR = 25 dB (~316 lineal).

$$\textcolor{#a5e6b1}{C} = 80 \cdot 10^6 \cdot \log_2(317) \approx 80 \cdot 10^6 \cdot 8.31 \approx 665 \text{ Mbps}$$

La capacidad teórica es alta; en la práctica se logran cientos de Mbps reales con MIMO y modulaciones QAM-256.

**Ejemplo 3: BER (Bit Error Rate).** Si transmitís $10^9$ bits y se corrompen $10^3$:

$$\textcolor{#a5e6b1}{\text{BER}} = \frac{10^3}{10^9} = 10^{-6}$$

Los canales ópticos modernos exigen BER $< 10^{-12}$. Para llegar ahí se usan **códigos correctores** (FEC, LDPC, Reed-Solomon). El docente lo define como "Bit Error Rate = cambiar 0 por 1, o viceversa; cantidad de veces que esto sucede por unidad de tiempo (errores por segundo)".

**Ejemplo 4 (el "ejemplo canónico" del docente).** Canal entre 3 MHz y 4 MHz; relación señal-ruido = 24 dB.

- Ancho de banda: $B = 4 - 3 = 1$ MHz.
- $\text{SNR}_{\text{lineal}} = 10^{24/10} \approx 251$.
- Velocidad binaria teórica máxima (Shannon):

  $$\textcolor{#a5e6b1}{C} = 10^6 \cdot \log_2(1 + 251) \approx 10^6 \cdot 7.977 \approx 8 \text{ Mbps}$$

- Número de niveles (de la combinación Nyquist + Shannon, $C = 2B \log_2 M$):

  $$\textcolor{#f4a5a5}{M} = 2^{C/(2B)} = 2^{8/2} = 16 \text{ niveles}$$

Es el ejemplo numérico que Righetti suele repetir en clase y aparece en finales: B = 1 MHz, C = 8 Mbps, M = 16.

## Modulación y trade-off

Las modulaciones digitales mapean bits a símbolos analógicos:

- **ASK** (Amplitude Shift Keying): varía la amplitud. Simple, sensible al ruido.
- **FSK** (Frequency): varía la frecuencia. Robusto pero usa más banda.
- **PSK** (Phase): varía la fase. BPSK (1 bit/símbolo), QPSK (2), 8-PSK (3).
- **QAM** (Quadrature Amplitude): combina amplitud y fase. QAM-16 (4 bits/símbolo), QAM-64, QAM-256.

**Trade-off:** más bits por símbolo $\Rightarrow$ mayor bitrate, pero los símbolos se vuelven más parecidos y necesitan **más SNR** para distinguirse. Por eso los esquemas adaptativos (DVB-S2, Wi-Fi, LTE) cambian de QAM-256 a BPSK cuando empeora el enlace.

## Errores frecuentes

- Confundir $B$ (ancho de banda en Hz) con bitrate (bps). El ancho de banda es la franja del espectro; el bitrate depende de $B$ y SNR.
- Operar SNR en dB sin convertir a lineal antes de usar la fórmula. Siempre: $\text{SNR}_{\text{lineal}} = 10^{\text{dB}/10}$.
- Pensar que Shannon te dice cómo lograr la capacidad. Solo te dice que es **alcanzable**; los códigos concretos (Turbo, LDPC, polares) son la ingeniería para acercarse.
- Olvidar que $C$ es un límite asintótico. Para alcanzarlo se necesitan bloques de codificación muy largos (mayor latencia).
- Suponer que aumentar potencia siempre paga. Sube logarítmicamente: triplicar potencia agrega solo $\log_2 3 \approx 1.58$ bps/Hz.

## Pregunta-trampa típica

> "¿Cuál es la capacidad de un canal sin ruido?"

**Infinita.** Si SNR $\to \infty$, $\log_2(1+\text{SNR}) \to \infty$. La fórmula de Shannon te lo dice; intuitivamente, sin ruido podés usar tantos niveles como quieras (Nyquist con $M$ arbitrario).

> "Si duplico el ancho de banda, ¿duplico la capacidad?"

Cuidado: depende. Si $B$ duplica pero el ruido es térmico ($N = kTB$), también duplica $N$, y la SNR cae a la mitad. La capacidad crece **menos que el doble**. Si la potencia de ruido fuera fija (no térmico), sí duplicaría linealmente.

## Diagrama de eficiencia del ancho de banda ("Semáforo de Shannon")

Righetti usa una visualización que llama el **"Semáforo de Shannon"** (también "Diagrama de Eficiencia del Ancho de Banda"). En el plano eficiencia-vs-SNR, una curva separa dos regiones:

- **Zona verde:** "Hay potencial para soportar transmisión libre de errores con probabilidad controlada y tan baja como se desee." Válido para **cualquier** algoritmo de codificación/decodificación del canal — Shannon no dice cómo, solo que se puede.
- **Zona roja:** "El sistema está condenado a tener una muy alta probabilidad de errores, sin posibilidad de control."

**Límite asintótico para $B \to \infty$:** cuando el ancho de banda crece sin límite (expresando todo en términos de energía por bit $E_b$ y densidad de ruido $N_0$ en lugar de potencias $S$ y $N$), se llega al límite:

$$\frac{\textcolor{#a5c8f4}{E_b}}{\textcolor{#f4a5a5}{N_0}} \geq \ln 2 \approx 0.693 \quad (\approx -1.59 \text{ dB})$$

Es decir: "llegando a un límite, aumentar el ancho de banda $B$ es inútil". Por debajo de ese piso de energía por bit, ninguna codificación recupera la información sin error.

**Bit Error Rate vs. modulación ("la otra cara de la moneda"):** el docente subraya en varias diapositivas la frase:

> "El precio a pagar en las modulaciones de orden superior por la mejora en la velocidad de transmisión es una mayor tasa de errores."

Por eso esquemas adaptativos (DVB-S2, Wi-Fi, LTE) bajan de QAM-256 → 64 → 16 → QPSK → BPSK cuando la SNR cae.

## Énfasis del docente (Righetti)

- **"Semáforo de Shannon" (zona verde / zona roja):** lo usa para resumir todo el teorema de codificación de canal en una imagen. Pregunta clásica: "¿Qué pasa si trabajo en la zona verde con un código mal diseñado?" — Respuesta: aún en zona verde, el código concreto debe acercarse al límite; Shannon garantiza que existe, no que cualquier código lo logra.
- **Marco de referencia "Alice / Bob / Claude":** lo dibuja siempre con un canal sometido a ruido, limitado en potencia y en ancho de banda. Esto enmarca el "Tercer Teorema" (Comunicación Confiable / Codificación de Canal).
- **Distinción precisa Nyquist vs. Shannon:** "Nyquist da el techo sin ruido; Shannon agrega la restricción cuando hay ruido. La combinación impone $M \leq \sqrt{1+\text{SNR}}$."
- **Ejemplo numérico recurrente:** canal $3$-$4$ MHz, SNR = 24 dB → $B=1$ MHz, $C \approx 8$ Mbps, $M = 16$. Aparece en ejercicios y finales; vale la pena memorizarlo.
- **Definición exacta de baudio (la pregunta de definición típica):** "1 baudio = 1 estado de señalización por segundo". Y la insistencia: "1 baudio = 1 bps **solo si M=2**". Las dos magnitudes ($V_m$ baudios, $V_t$ bps) NO son lo mismo.
- **Las cuatro perturbaciones canónicas en el orden de Righetti:** atenuación, distorsión de retardo, ruido térmico, ruido por intermodulación. Y dentro de ruido: térmico / intermodulación / diafonía / impulsivo.
- **Frase para el ruido térmico:** "Densidad Espectral de Potencia $N_0 = kT$, uniformemente distribuida en frecuencia ($\Rightarrow$ ruido blanco). Potencia total $N = N_0 \cdot B = kTB$." Ojo: $k$ es la constante de Boltzmann.
- **Convención de dB que repite:** $\mathrm{dB} = 10 \log_{10}(P_1/P_2)$, "3 dB es el doble". Útil para conversiones rápidas (24 dB → factor ~250).
- **"Shannon no dice cómo":** insiste en que el teorema es de existencia: "brinda un límite teórico absoluto, no dice cómo implementar dicha codificación". Útil para preguntas de teoría sobre la diferencia entre cota y construcción.
- **Aumentar B aumenta el ruido:** subraya que $N = kTB$ crece con $B$, así que la ganancia de capacidad al ampliar el ancho de banda es **menor que lineal**. Pregunta-trampa frecuente.
- **El segundo y tercer teorema combinados:** el "compromiso ancho de banda vs. relación señal a ruido" es el contenido específico del **Segundo Teorema (capacidad)**, mientras que el **Tercer Teorema (comunicación confiable)** asegura que existe codificación de canal con error controlado para $R < C$.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Wi-Fi en el baño de casa
Estás en el living con 500 Mbps reales y mirás Netflix 4K sin drama. Te vas al baño del fondo, tres paredes de por medio, y el iPhone baja a "2 barras". La SNR cayó de ~30 dB a ~10 dB. El router te degrada de QAM-256 a QPSK automáticamente, y la capacidad se desploma de cientos de Mbps a 20-30 Mbps. Netflix te baja la calidad a 720p.

**Por qué importa acá**: es Shannon en vivo: $C = B \log_2(1 + \text{SNR})$. Mismo ancho de banda (80 MHz), pero la SNR colapsa por la atenuación de las paredes y los niveles utilizables caen de 256 a 4. El "rate adaptation" del 802.11 es exactamente el "Semáforo de Shannon" aplicado.

### Cable submarino transatlántico
Google manda data entre Buenos Aires y Tokio por cables de fibra óptica submarinos (no por cobre). Una fibra moderna lleva ~100 Tbps por par. Si fuera cobre, la atenuación y el ruido térmico ($N = kTB$) harían imposible mantener SNR a 9000 km de distancia.

**Por qué importa acá**: la fibra ofrece $B$ enormes (THz disponibles) y SNR alta porque el fotón no sufre diafonía ni interferencia electromagnética como el cobre. La capacidad de Shannon se vuelve descomunal: por eso TODA la troncal de internet es óptica.

### 4G en el subte de Buenos Aires
Estás en la Línea D, el celu marca "4G" pero WhatsApp tarda 8 segundos en mandar un audio. La SNR baja por la cantidad de gente compitiendo por la celda (mismo canal compartido) y por la atenuación de los túneles. El BER sube, hay retransmisiones, y la capacidad efectiva por usuario cae de los 50 Mbps teóricos a 200 kbps reales.

**Por qué importa acá**: muestra la combinación de tres efectos del docente: atenuación (túnel), ruido (intermodulación entre usuarios) y caída de SNR. La modulación adaptativa baja a QPSK robusto, sacrificando bitrate para que el BER no explote.

## Conexiones

- Se conecta con **teoría de información** porque define el complemento: la fuente genera $H$ bits/símbolo, el canal acepta $C$ bits/segundo. Si la fuente emite a tasa $R < C$, hay códigos que la transmiten con error tendiendo a 0.
- Sirve de base para **modulación** (nivel físico), **códigos correctores** y diseño de **enlaces inalámbricos** (cálculo de presupuesto de enlace, link budget).
- Relaciona con **nivel físico** (Nyquist, PCM) y con **congestión** (cuando la red, no el canal físico, es el cuello de botella).
