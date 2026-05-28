---
slug: wifi-csmaca
title: Wi-Fi y CSMA/CA (802.11)
category: enlace
order: 8
diagrams: [AccessPointWifi]
---

## Por qué importa

Wi-Fi (802.11) es **el** medio compartido moderno. A diferencia del cable, donde podés detectar colisiones escuchando mientras transmitís, en radio **no podés**: tu propio transmisor satura tu receptor. Sin detección de colisión, Ethernet CSMA/CD no funciona, y necesitamos otro paradigma: **evitar** la colisión en lugar de detectarla.

Wi-Fi también introduce problemas exóticos: estaciones que se escuchan con el AP pero no entre sí (estación oculta), y al revés, estaciones que se escuchan entre sí pero no llegan al destino (estación expuesta). El estudio de estas patologías motiva mecanismos como RTS/CTS.

## Intuición

En una reunión presencial podés ver si alguien está hablando: detección visual de colisión. En una llamada telefónica grupal con audio direccional, no: si dos hablan al mismo tiempo, ninguno se entera hasta que el otro reclame. La solución es **pedir permiso antes de hablar** y **anunciar cuánto vas a durar**, para que los demás esperen.

Eso es CSMA/CA con RTS/CTS: pedís el canal, te lo conceden, hablás, y todos los demás callan durante tu turno.

## El problema de la estación oculta

```
[A] ---- [AP] ---- [B]
```

A y B están al alcance del AP, pero **no entre sí** (muy lejos). Si A transmite al AP y B también transmite al AP simultáneamente, ambos creen el medio libre (porque no se oyen), y colisionan en el AP.

CSMA puro **no funciona** porque "escuchar el medio" en A no detecta la transmisión de B.

## El problema de la estación expuesta

```
[A] -- [B] -- [C] -- [D]
```

B transmite a A. C escucha a B y cree el medio ocupado. Pero C quería transmitir a D, **que no está en el rango de B**. C **podría** transmitir sin colisionar, pero CSMA lo prohíbe inútilmente. Esto reduce el throughput agregado.

Wi-Fi no resuelve perfectamente este problema; lo mitiga con RTS/CTS y heurísticas.

## CSMA/CA (Collision Avoidance)

La idea central: **antes de transmitir, esperá un tiempo aleatorio aunque el medio esté libre**, para reducir probabilidad de colisiones simultáneas.

Hay dos mecanismos principales en 802.11:

### DCF (Distributed Coordination Function)

Modo distribuido, sin coordinación central. Usado en la mayoría de redes Wi-Fi.

```
1. Escuchar el medio.
2. Si libre durante DIFS (DCF Inter-Frame Space), iniciar contador
   de backoff aleatorio entre [0, CW] slots.
3. Decrementar el contador cada slot mientras el medio esté libre.
   Si el medio se ocupa, pausar.
4. Cuando el contador llega a 0, transmitir.
5. Esperar ACK. Si llega, OK. Si no, doblar CW y reintentar.
```

CW (Contention Window) parte de CWmin (típicamente 15 o 31) y se duplica hasta CWmax (1023) en cada fallo, igual que el backoff de Ethernet.

### PCF (Point Coordination Function)

Modo coordinado: el AP da turnos (polling). Más justo y predecible, pero raramente implementado. Usado en versiones tempranas y luego abandonado a favor de QoS extensions (EDCA en 802.11e).

## IFS (Inter-Frame Spacing)

Tiempos de espera obligatorios entre transmisiones. Cuanto más cortos, más prioridad.

- **SIFS** (Short IFS): el más corto. Para ACKs, CTS, fragments. Garantiza que la respuesta inmediata gane.
- **PIFS** (PCF IFS): un slot más largo que SIFS. Usado por el AP en modo PCF.
- **DIFS** (DCF IFS): un slot más que PIFS. Usado por estaciones DCF para iniciar transmisión.
- **EIFS** (Extended IFS): largo, tras recibir un frame corrupto.

La jerarquía `SIFS < PIFS < DIFS < EIFS` da prioridad natural a ACKs y al coordinador.

## Diagrama

{{diagram: AccessPointWifi}}

El diagrama muestra el AP central rodeado de estaciones. Cada flecha indica un intercambio de frames (RTS, CTS, DATA, ACK) en el tiempo. Las estaciones ocultas entre sí se marcan con líneas discontinuas.

## RTS / CTS (MACA / MACAW)

Mecanismo opcional para resolver estación oculta:

```
1. A quiere transmitir a B (típicamente AP). Manda RTS (Request to Send)
   con duración estimada de la transmisión.
2. B responde con CTS (Clear to Send) que repite la duración.
3. Todas las estaciones que escuchen RTS o CTS actualizan su NAV
   (Network Allocation Vector) con esa duración: "no transmitas
   durante este tiempo".
4. A transmite los datos.
5. B responde con ACK.
```

El CTS es la clave: alcanza a estaciones que A no alcanza (la estación oculta de A). Como ven el CTS, **callan** durante la transmisión.

**Costo:** RTS/CTS agrega overhead. Solo conviene para frames grandes o redes muy congestionadas. Generalmente se activa por **threshold** (frames mayores a X bytes usan RTS/CTS).

**Historia:** la idea vino de **MACA** (Multiple Access with Collision Avoidance, Karn 1990). **MACAW** (Bharghavan 1994) la refinó con ACKs y backoff. 802.11 toma de ambos.

## NAV (Network Allocation Vector)

Cada estación mantiene un timer NAV que indica "cuánto tiempo más estará ocupado el medio según los anuncios". Es **virtual carrier sense**: aunque físicamente no oigas la transmisión, sabés que está pasando porque viste el RTS o CTS.

CSMA/CA usa entonces dos sensados:

- **Físico:** ¿hay energía RF en el medio?
- **Virtual:** ¿el NAV indica medio ocupado?

Solo si **ambos** indican libre, podés iniciar el backoff.

## Anomalía de Wi-Fi

Fenómeno contraintuitivo: en un AP donde una estación negocia tasa baja (lejana, mala señal) y otras tasa alta, **todas terminan con throughput equivalente al de la más lenta**.

**Por qué:** DCF da igualdad de oportunidades de **acceso al medio** (cada uno gana un turno). Si la estación lenta tarda 10 veces más en transmitir su frame, ocupa el medio 10x más por turno, y a las rápidas les sobra muy poco tiempo. El throughput agregado se desploma.

Mitigaciones: 802.11e (EDCA) con colas separadas por prioridad, **airtime fairness** (limitar tiempo de aire en lugar de turnos), o aislar lentos en otra banda/canal.

## Algunas tasas (orientativo)

| Estándar | Año | Banda | Velocidad max | Notas |
|----------|-----|-------|---------------|-------|
| 802.11b | 1999 | 2.4 GHz | 11 Mbps | DSSS |
| 802.11g | 2003 | 2.4 GHz | 54 Mbps | OFDM |
| 802.11n | 2009 | 2.4/5 GHz | 600 Mbps | MIMO 4×4 |
| 802.11ac (Wi-Fi 5) | 2013 | 5 GHz | ~7 Gbps | MU-MIMO, QAM-256 |
| 802.11ax (Wi-Fi 6) | 2019 | 2.4/5 GHz | ~10 Gbps | OFDMA, QAM-1024 |
| 802.11be (Wi-Fi 7) | 2024 | 2.4/5/6 GHz | ~46 Gbps | MLO, QAM-4096 |

## Casos clave / Ejemplos

**Ejemplo 1: backoff típico DCF.** CWmin = 15. La estación elige aleatorio en [0,15]. Si slot = 9 µs, espera entre 0 y 135 µs. Tras una colisión, CW = 31, espera entre 0 y 279 µs.

**Ejemplo 2: ahorro con RTS/CTS.** Frame de 1500 bytes a 6 Mbps: $T_{data} = 2$ ms. Con colisión, perdés 2 ms. Con RTS/CTS (~30 µs), perdés solo 30 µs si chocan los RTS. Útil con frames grandes y muchas estaciones.

**Ejemplo 3: anomalía.** Dos estaciones, una a 54 Mbps y otra a 1 Mbps. Cada una manda un frame de 1500 B por turno. Tiempo agregado: $1500 \cdot 8 / 54 + 1500 \cdot 8 / 1 = 0.22 + 12$ ms. Throughput total $\approx (2 \cdot 1500 \cdot 8) / 12.22 \text{ ms} \approx 2$ Mbps. La rápida se ve frenada por la lenta.

## Errores frecuentes

- Pensar que CSMA/CA detecta colisiones. **No**: las evita estadísticamente con backoff y NAV. La única "detección" es **no recibir ACK**.
- Olvidar el **ACK obligatorio**. Cada frame unicast en Wi-Fi se confirma con ACK. Si falta, retransmisión.
- Confundir **carrier sense físico** con **virtual (NAV)**. Hay que mirar ambos.
- Suponer que RTS/CTS siempre se usa. Solo por encima de un threshold configurable (típicamente 2347 bytes = nunca por defecto).
- Pensar que el AP es transparente. Es un puente capa 2 entre Wi-Fi y Ethernet, pero **convierte el frame** (formato 802.11 vs 802.3).

## Pregunta-trampa típica

> "¿Por qué Wi-Fi no usa CSMA/CD como Ethernet?"

Porque en radio el transmisor **satura su propio receptor**: mientras transmitís, no podés oír si hay colisión. Detectar colisión requiere hardware full-duplex en la misma banda, que recién en los últimos años empezó a ser viable (Wi-Fi 7 lo explora). Por eso desde el inicio Wi-Fi adoptó **avoidance** en lugar de **detection**.

> "¿RTS/CTS resuelve la estación expuesta?"

No, **solo la oculta**. La expuesta no debería callarse, pero CSMA/CA la calla igual al oír el RTS. RTS/CTS empeora levemente la estación expuesta. Resolverla completamente requiere mecanismos más sofisticados que 802.11 estándar no implementa.

## Bandas, regulación y espectro expandido

Righetti antecede CSMA/CA con un bloque sobre **medio inalámbrico** que también suele aparecer en final.

- **Quién regula la potencia de transmisión:** depende de la banda. En Argentina **ENACOM**, en USA **FCC**. Hay bandas **licenciadas** (AM, FM, TV, celulares) y bandas **no licenciadas** (las ISM — Industrial, Scientific & Medical — donde vive Wi-Fi).
- En bandas no licenciadas la potencia está acotada, lo que **limita la distancia** y deja a la red expuesta a **interferencias** de otros dispositivos.
- Como el espectro es compartido por muchas aplicaciones, surge la idea de **espectro expandido (spread-spectrum)** para tolerar interferencia.
- Anécdota que el docente disfruta y suele preguntar: **Hedy Lamarr** (1942), el origen de **FHSS** (Frequency-Hopping Spread Spectrum) en torpedos guiados por radio, donde una "piano-roll" cambiaba entre 88 frecuencias para evitar el jamming enemigo. De ahí descienden las técnicas modernas de Wi-Fi.
- El medio inalámbrico **permite "pinchar" la comunicación** (eavesdropping): por eso es obligatorio encriptar los datos.

## Modelo de referencia 802.11

Righetti dibuja el stack de 802.11 partido en MAC + Físico, con la subcapa LLC (802.2) compartida con Ethernet:

- **LLC (Logical Link Control)** — común a toda la familia 802.
- **MAC (Medium Access Control)** — CSMA/CA, ACKs, fragmentación, confidencialidad (WEP en sus orígenes).
- **PLCP (Physical Layer Convergence Procedure)** y **PMD (Physical Media Dependent)** — definen el físico concreto: Infrarrojos, **FHSS**, **DSSS**, **OFDM**.

Sobre el MAC define dos modos: **DCF (Distributed Coordination Function, CSMA/CA)** que es el mecanismo base, y **PCF (Point Coordination Function)** opcional para **Contention Free Service** coordinado por el AP.

{{diagram: AccessPointWifi}}

## Performance: caso de estudio del docente

Una de las "preguntas de banco" que Righetti plantea es: tengo una notebook conectada a un AP **802.11ac** (a su vez al **Home Gateway** del proveedor de ADSL "**1 Giga**" con G.Fast). Quiero descargar **10 GB desde un servidor en USA**. ¿Cuánto tarda?

Pasos que él fuerza a considerar:

1. **PHY rate vs MAC rate.** 802.11ac wave 1 declara 1.3 Gbps de PHY rate; asumiendo eficiencia del 65 %, el MAC rate efectivo es **~845 Mbps**.
2. **Overhead de protocolo** (IP + TCP headers) recorta más.
3. **Wi-Fi es half-duplex**: TX y RX comparten el mismo aire.
4. **¿El ADSL "1 Giga" es simétrico?** Casi nunca lo es: la relación **upstream/downstream** anda de **1:4 a 1:20**. Si tenés P2P consumiendo upstream, los ACK de TCP se demoran.
5. **RTT al servidor** (Verizon publica tablas).
6. **¿Es el Wi-Fi el cuello de botella o el ADSL?** Casi siempre el último.

La moraleja es que **performance percibida** $\neq$ tasa nominal del estándar; hay que sumar las pérdidas en cada capa.

## Anomalía de Wi-Fi (en palabras del docente)

Righetti la define textualmente así: **"en Wi-Fi los nodos de baja velocidad degradan el throughput de los nodos de alta velocidad"**. La cadena causal que él destaca:

- Los nodos reducen su data rate cuando la potencia de la señal es baja (**Wi-Fi auto-rate**).
- Los paquetes de los nodos lentos **consumen más "tiempo de aire"**.
- Como Wi-Fi es **half-duplex** y arbitra paquete a paquete, los nodos lentos **monopolizan el canal**.
- Los nodos de alta velocidad **reciben menos tiempo de aire** y su throughput cae al nivel del más lento.

## Evolución: Wi-Fi 6 y 802.11ah

El docente cierra la unidad con la "evolución de 802.11" y suele preguntar por mejoras concretas. Algunas que él menciona:

- **Wi-Fi 6 (802.11ax):**
  - **OFDMA** — divide los canales en porciones más chicas para servir múltiples dispositivos en simultáneo.
  - **MU-MIMO** — múltiples dispositivos usando las mismas frecuencias.
  - **Intervalos de guarda ampliados** — mejor cobertura outdoor.
  - **TWT (Target Wake Time)** — mejora la batería en dispositivos móviles permitiéndoles dormir cuando no hay datos.
  - **BSS Coloring** — redes solapadas pueden transmitir en paralelo.
  - Canales de **160 MHz** para alta performance.
- **802.11ah (HaLow)** — apunta a **IoT**: consumo mínimo, mayor alcance, más dispositivos por AP, IP nativo, "government-grade security", **tri-band** (2.4 GHz / 5 GHz / 900 MHz).
- **802.11af (WhiteFi)** — operación en espacios de TV ("white spaces").

## Énfasis del docente (Righetti)

- Marca tres limitaciones clave del medio inalámbrico: "la intensidad de la señal disminuye con la distancia", "fuentes de ruido más impredecibles que en medios guiados con lo cual tasa de errores elevadas" y "en dispositivos móviles la energía es un nuevo desafío".
- Define el **problema de la estación oculta** casi palabra por palabra: "el problema de que una estación no puede detectar a un competidor potencial por el medio, puesto que el competidor está demasiado lejos, se denomina **problema de la estación oculta**". La **estación expuesta** la define como la situación inversa.
- Cuando explica por qué no se puede usar **CD** en Wi-Fi resume dos razones: (1) requeriría un radio **full duplex** que "incrementa los costos significativamente", (2) "no todas las estaciones pueden escucharse una con otras" y "que todos escuchan es la premisa clave de CD".
- En CSMA/CA el flujo que él pide reproducir es: escuchar el medio, esperar **IFS** si está libre, sino esperar al final de la transacción, ejecutar **algoritmo de backoff** con espera aleatoria uniforme en la **ventana de contención (CW)** medida en **slots (Contention Timer)**, transmitir, esperar **ACK**; si no llega ACK se asume colisión y se reintenta.
- Define **NAV (Network Allocation Vector)** como **contadores regresivos de tiempo** que sostienen el carrier sense **virtual**. Suele dibujar las cuatro capas de tiempo en torno a RTS/CTS/DATA/ACK.
- Lema que repite sobre redes wireless: la **encriptación** no es opcional porque el medio **permite eavesdropping** por construcción.
- Para la **anomalía de Wi-Fi** insiste en el costo del "tiempo de aire" (airtime) — es lo que motiva **airtime fairness** como mitigación.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### WhatsApp en el subte lleno
Estás parado en la Línea D rumbo a Tribunales, vagón lleno. Cada celular tiene su 4G/5G pero también muchos están conectados al Wi-Fi del subte. Una decena de teléfonos compite por el AP del vagón. Aunque tu teléfono "ve" el AP a 10 m, no ve los otros teléfonos al otro extremo del vagón (estación oculta). El resultado: ráfagas de colisiones, retransmisiones, y WhatsApp tarda 5 segundos en mandar un audio.

**Por qué importa acá**: típico caso de estación oculta. RTS/CTS podría ayudar, pero está deshabilitado por defecto en la mayoría de redes públicas. La anomalía de Wi-Fi también golpea: el que está al fondo con QPSK frena a todos.

### Vecino que usa el mismo canal Wi-Fi
Tu router de casa y el del depto del lado están ambos en el canal 6 de 2.4 GHz. Aunque tu Wi-Fi anda, notás que se "traba" cuando tu vecino mira Netflix. Eso es porque ambos APs ven el mismo medio físico (radio) y comparten el canal: cuando él transmite, tu router espera (carrier sense físico) y tu throughput se reduce a la mitad.

**Por qué importa acá**: spectrum sharing es la realidad del Wi-Fi en zonas densas. La solución moderna: 5 GHz (más canales no solapados) o Wi-Fi 6 con BSS Coloring (transmitir en paralelo).

### Cafetería con Wi-Fi "lento aunque haya señal"
En Starbucks tenés 30 personas conectadas al mismo AP. Tu iPhone marca 4 barras de Wi-Fi, pero Gmail tarda 10 segundos en cargar. ¿Por qué? Porque todos compiten por el medio compartido. Aunque la PHY rate es 600 Mbps, el throughput real por usuario cae a 1-2 Mbps. Si alguien al fondo está negociando a 6 Mbps (Wi-Fi auto-rate por mala señal), arrastra a todos por la anomalía.

**Por qué importa acá**: es la diferencia entre "tener señal" y "tener throughput". DCF reparte oportunidades de acceso, no airtime; los lentos comen la mayor parte.

## Conexiones

- Se conecta con **Ethernet/CSMA-CD**: ambos resuelven acceso múltiple pero con primitivas distintas (avoid vs detect).
- Relaciona con **nivel físico**: las modulaciones (OFDM, MIMO) y bandas determinan velocidades y robustez.
- Sirve de fundamento para **IP móvil** y **roaming**: a nivel red, el host se mueve entre APs y la asociación cambia sin perder la sesión TCP (idealmente).
