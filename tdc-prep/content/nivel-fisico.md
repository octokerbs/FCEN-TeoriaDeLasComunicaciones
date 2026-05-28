---
slug: nivel-fisico
title: Nivel físico (señales, Nyquist, modulación, multiplexación)
category: fisico
order: 3
diagrams: []
---

## Por qué importa

Toda comunicación digital eventualmente termina como **ondas electromagnéticas** viajando por un medio: cable de cobre, fibra óptica, aire. El nivel físico es donde se decide cómo se representan los unos y ceros como tensión, luz o radio, y a qué velocidad podés mandarlos sin que se mezclen. Sin este nivel, las capas superiores (IP, TCP, HTTP) no tendrían cómo bajar al mundo real.

Entender Nyquist y muestreo te explica por qué un CD usa 44.1 kHz, por qué tu Wi-Fi tiene "canales", y por qué la fibra reemplazó al cobre.

## Intuición

Una señal **analógica** es continua en el tiempo y en amplitud: la voz natural, una onda de luz, la tensión de un sensor. Una señal **digital** toma valores discretos (típicamente dos: alto/bajo) y cambia en instantes definidos.

Para pasar lo analógico al mundo digital hay que **muestrear** (tomar instantáneas en el tiempo) y **cuantizar** (asignar a niveles discretos). El truco es: si muestreás suficientemente rápido, podés reconstruir la señal original sin perder nada. Si muestreás lento, el resultado se vuelve un dibujo borroso e irreversible (aliasing).

## Formalización

**Teorema de Nyquist-Shannon (muestreo):** una señal cuyo espectro está limitado a frecuencias menores que $f_{\max}$ puede reconstruirse exactamente si se muestrea a una tasa:

$$\textcolor{#a5c8f4}{f_s} \geq 2 \textcolor{#f4a5a5}{f_{\max}}$$

A $2 f_{\max}$ se le llama **tasa de Nyquist** (también "frecuencia de sampling" o "frecuencia de muestreo"). Por debajo aparece **aliasing**: frecuencias altas se "doblan" sobre las bajas y arruinan la reconstrucción.

**Capacidad de Nyquist (canal sin ruido, $M$ niveles):**

$$\textcolor{#a5e6b1}{C} = 2 \textcolor{#a5c8f4}{B} \log_2 \textcolor{#a5c8f4}{M} \quad \text{[bps]}$$

**Onda electromagnética:** Righetti la define como "dos campos ortogonales, uno eléctrico $\vec{E}$ y el otro magnético $\vec{B}$, que se propagan juntos". En el vacío viajan a la velocidad de la luz $c = 3 \cdot 10^8$ m/s (Michelson-Morley demostraron que no existe el "éter"). En otros medios la velocidad es $v < c$, generalmente expresada como un factor de $c$.

**Longitud de onda:**

$$\textcolor{#a5e6b1}{\lambda} = \frac{v}{\textcolor{#a5c8f4}{f}} = v \cdot \textcolor{#f4a5a5}{T} \quad \text{[m]}$$

En el vacío: $\lambda = c / f$. Es la "distancia ocupada por un ciclo", o la distancia espacial entre dos puntos de la misma fase en ciclos consecutivos.

**Series de Fourier:** toda señal periódica $g(t)$ con período $T$ se puede escribir como suma de senos y cosenos:

$$\textcolor{#a5c8f4}{g(t)} = \frac{a_0}{2} + \sum_{n=1}^{\infty} \left[a_n \cos\!\left(\frac{2\pi n t}{\textcolor{#f4a5a5}{T}}\right) + b_n \sin\!\left(\frac{2\pi n t}{T}\right)\right]$$

Esto justifica que cualquier señal puede analizarse en términos de sus **componentes de frecuencia**. El **ancho de banda** es el rango de frecuencias relevantes; formalmente, "la frecuencia de corte es donde se produce una atenuación de 3 dB" (la potencia se reduce a la mitad). La respuesta en frecuencia "es como una huella dactilar que caracteriza a cada canal físico".

**Frecuencia fundamental y armónicas:** la onda cuadrada se representa como serie infinita de senoides armónicamente relacionadas: fundamental + 1/3 tercera + 1/5 quinta + 1/7 séptima + 1/9 novena + ... Es el ejemplo canónico del docente para Fourier.

## Medios de transmisión

Righetti divide los medios en dos grandes familias y los recorre uno por uno:

**Guiados (por guía de onda):**

- **Par trenzado de cobre (UTP/STP):** velocidad de propagación $v \approx 0.69 \cdot c$ (ejemplo: UTP Cat. 5).
- **Cable coaxial:** 75 Ω, base histórica de las redes **CATV** ("Community Antenna TV", nacidas en 1949 para resolver problemas de recepción de TV en zonas de mala cobertura; hoy = Cable TV). Amplificadores cada 0,5–1 km, hasta 50 km en cascada.
- **Red eléctrica (Power Line):** la propia infraestructura eléctrica como medio.
- **Fibra óptica (monomodo y multimodo):** núcleo (core) + revestimiento (cladding) + cubierta (buffer). Funciona por **reflexión total interna**. $c_{\text{FO}} \approx (2/3) \cdot c_0$. Su función es "guiar las ondas de luz con un mínimo de atenuación y distorsión".

**No guiados ("Wireless" — el espectro electromagnético):**

- **Radio**, **microondas**, **infrarrojos**, **láser**, **Li-Fi** (Light Fidelity; "el regreso de Morse, hecho luz" — usa LEDs comerciales para transmitir datos codificando cambios sutiles del brillo).
- Caso de luz visible: $\lambda = c/f$ varía entre violeta (380–450 nm, 668–789 THz) y rojo (620–750 nm, 400–484 THz).

**Reflexiones, refracciones y pérdidas:** al chocar con imperfecciones del material la onda produce reflexiones/refracciones y pierde energía. Si el medio tiene muchas pérdidas, la señal se atenúa considerablemente.

## Conversión analógico-digital (PCM)

**Pulse Code Modulation (MIC, Modulación por Impulsos Codificados)** es el método clásico para digitalizar señales. Consta de dos etapas: muestreo + cuantificación.

```
1. Muestrear: tomar el valor de la señal cada T_s = 1/f_s segundos
   (al doble del ancho de banda → tren de pulsos PAM).
2. Cuantizar: aproximar cada muestra por un entero de n bits
   (aparece el "error de cuantificación").
3. Codificar: representar cada nivel como una palabra binaria.
```

**Canal PCM telefónico (el ejemplo canónico del docente):**

- Voz humana con "calidad suficiente para telefonía" → espectro de 0 a 4 kHz.
- Por Nyquist: muestreo a $f_s = 8000$ muestras/segundo → $T_s = 125\ \mu s$/muestra.
- CODEC produce símbolos de 8 bits por muestra (en realidad uno es para señalización).
- Bitrate por canal de voz: $8000 \cdot 8 = 64$ kbps. Este es el **canal DS0**.

> **Cita textual del docente (con un guiño autocrítico):** "Ancho de banda del canal de voz = 64 kbps. *mmm…* Esto es 'hablando mal y pronto'. En rigor, es la **tasa binaria** necesaria para transmitir un canal de voz con una riqueza frecuencial de 4 kHz." Es un detalle típico de la materia: ojo con confundir Hz (ancho de banda) con bps (bitrate).

> "Prácticamente todos los intervalos de tiempo en el sistema telefónico son múltiplos de $125\ \mu s$."

**Portadoras T1 y E1 (multiplexación PCM):**

- **T1** (Norteamérica y Japón): 24 canales de voz multiplexados. Un frame T1 transporta $24 \cdot 8 = 192$ bits + 1 bit de framing = **193 bits cada $125\ \mu s$** → $193 / 0{,}000125 \approx 1{,}544$ Mbps.
- **E1** (Europa, ITU): 32 canales (256 bits) cada $125\ \mu s$ → **2,048 Mbps**.

**Códecs vs. módems** (frase textual de Righetti):

- **Módem (MODulador-DEModulador):** convierte de **digital a analógico** y viceversa.
- **Códec (COdificador-DECodificador):** convierte de **analógico a digital** y viceversa.

> "¡No son lo mismo!" — el docente lo subraya con énfasis casi en cada clase.

**Modulación Delta (DM):** alternativa al PCM que "codifica sólo las diferencias". Para ciertas señales es más eficiente que PCM.

**Códecs modernos** son optimizaciones de este proceso: aprovechan redundancia en voz/audio (MP3, AAC, Opus, G.711, G.729). Reducen el bitrate sin que el oído humano lo note.

## Multiplexación

Es **compartir un medio físico** entre varios canales lógicos.

- **TDM (Time Division):** cada canal usa el medio durante un slot de tiempo. Round-robin. Usado en T1/E1, GSM.
- **FDM (Frequency Division):** cada canal usa una sub-banda distinta del espectro. Usado en radio AM/FM, ADSL.
- **WDM (Wavelength Division):** versión óptica de FDM: cada canal una "color" de luz. DWDM puede llevar 80+ longitudes de onda por fibra.
- **CDM (Code Division):** todos comparten tiempo y frecuencia, pero cada uno multiplica con un código ortogonal. Usado en 3G, GPS.

**TDM síncrono** asigna slots fijos (ineficiente si un canal no tiene datos). **TDM estadístico (statistical multiplexing)** asigna slots según demanda; es la base de la conmutación de paquetes.

## Spread Spectrum

Técnica que **esparce la señal en una banda mucho más ancha** que la mínima necesaria. Surge en aplicaciones militares (resistencia a jamming) y hoy se usa en Wi-Fi, Bluetooth, GPS.

- **DSSS** (Direct Sequence): cada bit se multiplica por un chip code de alta velocidad. La señal resulta de baja densidad espectral, robusta a interferencia angosta.
- **FHSS** (Frequency Hopping): el transmisor salta entre frecuencias siguiendo una secuencia conocida por ambos extremos. Usado en Bluetooth.

## Modulación

**Definición (Righetti):** "Proceso de variación de cierta característica de una señal sin mensaje, llamada **portadora**, de acuerdo con una señal mensaje, llamada **moduladora**."

Cuatro combinaciones posibles (moduladora × portadora):

| Moduladora | Portadora  | Ejemplo                                   |
| ---------- | ---------- | ----------------------------------------- |
| Analógica  | Analógica  | AM, FM (radio comercial)                  |
| Digital    | Analógica  | ASK, FSK, PSK, QAM (módems)               |
| Analógica  | Digital    | PCM, Delta (digitalización de voz)        |
| Digital    | Digital    | NRZ, NRZI, Manchester (códigos de línea)  |

**Modulación digital sobre portadora analógica** (el caso de "transmisión de datos sobre la red telefónica diseñada para voz, 300–3400 Hz"):

- **ASK** (Amplitude Shift Keying): bits cambian la amplitud. Simple pero sensible al ruido / desvanecimiento.
- **FSK** (Frequency Shift Keying): bits cambian la frecuencia. Robusto, usado en módems antiguos y RFID.
- **PSK** (Phase Shift Keying): bits cambian la fase. BPSK = 1 bit/símbolo, QPSK = 2 bits/símbolo. Buen compromiso entre eficiencia y robustez.
- **QAM** (Quadrature Amplitude Modulation): combina amplitud y fase usando dos portadoras en cuadratura (I a 0°, Q a 90°). El símbolo es un vector en la "constelación":
  - 4-QAM ≡ QPSK: 2 bits/símbolo (4 puntos).
  - 16-QAM: 4 bits/símbolo (16 puntos).
  - 64-QAM: 6 bits/símbolo.
  - 256-QAM: 8 bits/símbolo. A medida que crece $M$, los puntos se acercan y el sistema se vuelve más sensible al ruido (la constelación se "ensucia").

**Velocidad de modulación** (terminología explícita de Righetti):

- $V_m$ = velocidad de modulación (baudios = símbolos/segundo).
- $V_t$ = velocidad de transmisión (bps).
- Relación: $V_t = V_m \cdot N$ donde $N = \log_2 M$ bits por símbolo. Equivalentemente: $V_t = V_m \cdot \log_2 S$ con $S = 2^N$ símbolos posibles.

**Códigos de línea (modulación digital sobre portadora digital, "señalización banda base"):**

- **NRZ** (Non Return to Zero): voltaje negativo = 0, positivo = 1. Simple pero "para secuencias largas sin cambios se pierde el sincronismo" (problema de **clock recovery**).
- **NRZI** (NRZ con inversión de unos): transición al principio del intervalo de un 1; sin transición para un 0. Soluciona muchos 1 consecutivos pero no muchos 0 consecutivos.
- **Manchester (bifase):** transición en el medio del intervalo del bit. Bajo→alto = 1, alto→bajo = 0. Auto-sincroniza. **Baud Rate = 2 · Bit Rate**. Eficiencia 50%. Usado en Ethernet 10BASE-T.
- **Manchester diferencial:** un 0 = presencia de transición al inicio del bit; un 1 = ausencia. Robusto a inversión de polaridad.
- **Códigos de alta densidad mBnB:** "reemplazar secuencias de varios bits iguales por otra que proporcione transiciones para preservar el clock". Ejemplos: **4B/5B** (Fast Ethernet 100Base-TX), **8B/10B** (Gigabit Ethernet). Más eficientes que Manchester.

## Casos clave / Ejemplos

**Ejemplo 1: muestreo de música.** Oído humano percibe hasta ~20 kHz. CD muestrea a 44.1 kHz (margen sobre los 40 kHz de Nyquist) con 16 bits/muestra estéreo: $44100 \cdot 16 \cdot 2 = 1.41$ Mbps.

**Ejemplo 2: aliasing.** Una señal senoidal de 7 kHz muestreada a 8 kHz aparece como 1 kHz (se "dobla"). Por eso siempre va un **filtro anti-aliasing** antes del muestreador.

**Ejemplo 3: capacidad con 4 niveles.** Canal sin ruido de 3 kHz con QPSK ($M=4$): $C = 2 \cdot 3000 \cdot \log_2 4 = 12$ kbps.

## Errores frecuentes

- Confundir **frecuencia de muestreo** con **bitrate**. Son distintas: bitrate = $f_s \cdot$ bits/muestra.
- Olvidar que Nyquist exige $f_s > 2 f_{\max}$ **estrictamente** (la igualdad es el límite teórico, no práctico).
- Pensar que Manchester duplica el bitrate. **Duplica el baudrate** (símbolos/seg) pero no los bits/seg útiles.
- Mezclar **ancho de banda** (Hz) con **bitrate** (bps). El primero es del canal, el segundo de la señal.
- Confundir TDM síncrono con TDM estadístico. El primero desperdicia; el segundo aprovecha mejor pero introduce variabilidad.

## Pregunta-trampa típica

> "¿Por qué no se puede transmitir a velocidad arbitraria en un canal de ancho de banda finito sin ruido?"

Trampa: **sí se puede.** Sin ruido, Nyquist te dice $C = 2B \log_2 M$, y $M$ puede ser tan grande como quieras. El límite aparece **solo con ruido** (Shannon-Hartley), porque ahí los niveles cercanos se confunden. Esta es una pregunta clásica para detectar si el alumno mezcló ambos teoremas.

> "¿Cuándo conviene Manchester sobre NRZ?"

Cuando necesitás **clock recovery sin línea separada** (auto-sincronización) y no te molesta usar el doble de ancho de banda. Por eso lo usó Ethernet 10 Mbps clásico.

## Énfasis del docente (Righetti)

- **Agenda exacta** de la teórica: medios guiados y no guiados → dominio de frecuencia → red telefónica → conversión A/D → **modulación** (digital sobre portadora analógica) → **codificación** (digital sobre portadora digital) → **capacidad de volumen del canal**. Esta última suele ser eje del oral.

- **Distinción terminológica que cae en final**: *"modulación"* (modulante digital sobre portadora analógica) vs *"codificación"* (modulante digital sobre portadora digital). Las separa explícitamente y se molesta si se confunden.

- **Medios guiados** que enfatiza:
  - Par trenzado de cobre.
  - **Coaxial 75 Ω** asociado con CATV — historia: 1949, "Community Antenna TV" en zonas de mala recepción, amplificadores cada 0.5-1 km en cascada hasta 50 km.
  - **Fibra óptica**: monomodo vs multimodo, núcleo + cladding + buffer. Velocidad $c_{FO} \approx 2/3 \cdot c_0$. Principio: reflexión total interna.
  - Power Line (red eléctrica) — mencionada aunque marginal.

- **Multiplexación**: presenta TDM y FDM con el ejemplo de **radio AM** (~1 MHz reservado, 500-1500 kHz, cada emisora ocupa una frecuencia → FDM; dentro de cada una, música y avisos alternan en tiempo → TDM). Subraya: *"FDM requiere circuitería analógica no trivial. TDM puede manejarse enteramente con electrónica digital, y se ha vuelto la opción de más amplio uso"*. Además: *"TDM solo puede ser utilizado para datos digitales"*.

- **WDM** (Wavelength Division Multiplexing) lo presenta como FDM aplicada a sistemas ópticos: *"diversas longitudes de onda por una única fibra"*.

- **Teorema de Nyquist (1924)** con notación exacta: *"si queremos reconstruir una señal de componente frecuencial máxima $f_m$, debemos muestrearla según $f_s > 2 f_m$"*. Llama a $f_s$ **frecuencia de sampling** (también muestreo o modulación). Da dos ejemplos canónicos que repite:
  - CD de audio: 44.100 muestras/s → reconstruye hasta ~22 kHz.
  - Voz telefónica: 0-4 kHz → 8000 muestras/s.

- **PCM** al detalle:
  - Etapas: muestreo a $2 \cdot BW$ → tren PAM (pulsos de amplitud variable) → cuantificación (n bits, con **error de cuantificación**) → codificación a bits.
  - **CODEC** (COder-DECoder): 8 bits por muestra, 8000 muestras/s → **64 kbps por canal de voz**.
  - El cálculo $32 \times 64 = 2.048$ Mbps para E1 es **clásico de final**.

- **Multiplexación estadística**: la presenta como contraste con TDM/FDM rígidos. *"División del tiempo bajo demanda. Los paquetes de diferentes fuentes comparten el enlace a tiempos distintos. Se encolan los paquetes que compiten cuando el enlace no está disponible. Cuando hay overflow decimos que hay congestión"*. Conecta directo con la teórica de congestión.

- **Taxonomía de redes** que pide tener clara: redes de **circuitos virtuales (VC)** (X.25, ATM, orientado a conexión) vs **redes de datagramas** (Internet, sin conexión). El nivel de transporte sobre Internet ofrece ambos modelos (TCP / UDP).

- **Capacidad de volumen del canal**: $C_{vol} = BW \cdot RTT$ (bytes "en vuelo" en el medio). Pregunta recurrente en oral para conectar nivel físico con ventana deslizante.

- **MODEM vs CODEC** — pregunta recurrente:
  - **MODEM** (modulator-demodulator): en el local loop telefónico, convierte bits ↔ señal modulada analógica.
  - **CODEC**: en la end office, convierte señal analógica del mundo (voz) ↔ bits cuantizados PCM.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Fibra al hogar (FTTH) de Fibertel/Telecentro
Tu casa tiene fibra óptica que llega hasta una caja en la pared (ONT). Adentro de esa fibra, el ISP usa **WDM** para mandar varias longitudes de onda por la misma fibra: una para internet downlink (1490 nm), otra para uplink (1310 nm), otra para TV (1550 nm). Mismo cable, tres "colores" de luz simultáneos.

**Por qué importa acá**: WDM es FDM aplicado a frecuencias ópticas. Un solo medio físico ($\lambda$ es solo una propiedad de la portadora) lleva múltiples canales sin interferencia entre ellos.

### Bluetooth de tus auriculares
Los AirPods se conectan al iPhone vía Bluetooth, que usa **FHSS** saltando entre 79 frecuencias de 1 MHz en la banda de 2.4 GHz, cambiando 1600 veces por segundo. Por eso podés tener al lado un microondas y tres dispositivos Bluetooth y todos funcionan: cada uno salta a frecuencias distintas en cada momento.

**Por qué importa acá**: spread spectrum FHSS es resistente a interferencia angosta (microondas, Wi-Fi) porque solo perdés los saltos que coinciden con la perturbación; el resto pasa limpio.

### Llamada de WhatsApp internacional
Cuando llamás por WhatsApp a un amigo en Madrid, la voz se muestrea a ~16 kHz (códec Opus), se cuantiza y se manda como ~32 kbps. Aunque la voz humana llega hasta ~20 kHz, se filtra abajo para que entre en menos ancho de banda. La llamada telefónica clásica era a 8 kHz (canal DS0 de 64 kbps) — WhatsApp suena mejor porque captura más espectro.

**Por qué importa acá**: PCM en acción. Nyquist te obliga a muestrear al doble del $f_{\max}$ que querés capturar; los códecs modernos negocian calidad vs. bitrate cambiando ese trade-off.

## Conexiones

- Se conecta con **Shannon-canal** porque la fórmula de capacidad usa el ancho de banda físico definido aquí.
- Es la base del **nivel enlace**, que toma bits ya transmitidos por el medio y los agrupa en frames.
- Relaciona con **acceso múltiple** (Ethernet, Wi-Fi): el medio físico está compartido y hay que coordinar quién transmite cuándo.
