---
slug: shannon-teoria-informacion
title: Teoría de la información (Shannon)
category: shannon
order: 1
diagrams: [ShannonEntropy]
---

## Por qué importa

Antes de Shannon (1948), la "información" era un concepto vago. ¿Cuánta información hay en una foto? ¿En una novela? ¿En un mensaje "sí/no"? Shannon le puso números: definió la información como una **medida de incertidumbre que se reduce al recibir un mensaje**. Esto cambió todo, porque permitió calcular cuánto se puede comprimir un mensaje y cuánta data se puede mandar por un canal ruidoso.

Sin esta teoría no existirían los códecs (MP3, JPEG, H.264), no sabríamos cuánto comprimir un ZIP, ni podríamos comparar canales de comunicación de forma objetiva.

## Intuición

Pensá en el clima en San Pablo: si llueve casi todos los días en enero, recibir "hoy llueve" no te dice mucho. Pero recibir "hoy nevó" sí, porque era casi imposible. **La información es inversamente proporcional a la probabilidad**: cuanto más raro un evento, más información aporta cuando ocurre.

Si tirás una moneda justa, no sabés qué va a salir hasta verla. Esa incertidumbre se mide en **bits**: 1 bit es exactamente la información de una moneda 50/50. Si la moneda está cargada (90% cara), la mayoría de tiros aportan poco, y en promedio la fuente da menos de 1 bit por símbolo.

## Formalización

**Información de un evento E con probabilidad $p(E)$:**

$$\textcolor{#a5e6b1}{I(E)} = \log_2 \frac{1}{\textcolor{#a5c8f4}{p(E)}} = -\log_2 \textcolor{#a5c8f4}{p(E)} \quad \text{[bits]}$$

**Entropía de una fuente $S = \{s_1, s_2, \dots, s_n\}$ con probabilidades $p_i$:**

$$\textcolor{#a5e6b1}{H(S)} = \sum_{i=1}^{n} \textcolor{#a5c8f4}{p_i} \log_2 \frac{1}{p_i} = -\sum_{i=1}^{n} p_i \log_2 p_i$$

La entropía es la **información promedio por símbolo** que genera la fuente. Tiene dos propiedades clave:

- $H(S) \geq 0$, y vale 0 si la fuente es determinística (un solo símbolo con $p=1$).
- $H(S) \leq \log_2 n$, y la cota se alcanza con distribución uniforme.

**Fuente de memoria nula:** los símbolos se emiten de forma independiente. La probabilidad del siguiente símbolo no depende de los anteriores. Es el modelo más simple; en la práctica las fuentes reales tienen memoria (texto natural, voz), pero el modelo sin memoria es la base.

**Longitud media de un código:** si a cada símbolo $s_i$ le asignamos una palabra binaria de longitud $\ell_i$:

$$\textcolor{#a5e6b1}{\bar{L}} = \sum_{i=1}^{n} \textcolor{#a5c8f4}{p_i} \cdot \ell_i$$

**Teorema fundamental de Shannon (sin ruido):** $\bar{L} \geq H(S)$. No se puede codificar la fuente con menos bits promedio que su entropía.

**Eficiencia del código:** $\eta = H(S) / \bar{L}$. Un código óptimo tiene $\eta \to 1$.

## Diagrama

{{diagram: ShannonEntropy}}

El diagrama muestra cómo la entropía cambia con la distribución de probabilidades. Para dos símbolos, $H$ es máxima en $p=0.5$ (incertidumbre total) y cero en $p=0$ o $p=1$ (certeza).

## Tipos de códigos

Righetti usa esta clasificación jerárquica (de Abramson) como condiciones que debe cumplir un código:

- **Bloque:** asigna palabras de longitud fija (o de un alfabeto definido) a cada símbolo de la fuente.
- **Singular:** todas las palabras del código son distintas. Mínimo razonable.
- **Separable (unívocamente decodificable):** toda secuencia de palabras concatenadas se decodifica de una sola forma. Sin ambigüedades.
- **Instantáneo (prefix-free):** ninguna palabra es prefijo de otra. Se puede decodificar símbolo por símbolo sin esperar. Todos los códigos instantáneos son separables, pero no al revés.

**Condición de los prefijos** (frase textual del docente): "La condición necesaria y suficiente para que un código sea instantáneo es que sus palabras cumplan la condición de los prefijos: que no exista palabra que sea prefijo de otra palabra de longitud mayor."

**Longitud media y eficiencia (notación de Righetti):**

$$\textcolor{#a5e6b1}{\bar{L}} \cdot \log_2 r \geq \textcolor{#a5e6b1}{H(S)}$$

con $r$ = número de símbolos distintos del alfabeto del código (para binario, $r=2$, y la expresión se reduce a $\bar{L} \geq H(S)$). La eficiencia se define como:

$$\textcolor{#a5e6b1}{\eta} = \frac{\textcolor{#a5e6b1}{H(S)}}{\textcolor{#a5e6b1}{\bar{L}} \cdot \log_2 r}, \quad \eta_{\max} = 1$$

**Desigualdad de Kraft:** existe un código instantáneo binario con longitudes $\ell_1, \dots, \ell_n$ si y solo si:

$$\sum_{i=1}^{n} 2^{-\textcolor{#a5c8f4}{\ell_i}} \leq 1$$

## Algoritmo de Huffman

Es el **codificador óptimo** para fuentes de memoria nula (longitud media mínima entre los instantáneos).

```
1. Ordenar los símbolos por probabilidad creciente.
2. Tomar los dos de menor probabilidad y combinarlos
   en un nodo padre con p = p1 + p2.
3. Volver a ordenar y repetir hasta tener un solo nodo (raíz).
4. Etiquetar las aristas con 0 y 1; leer las palabras
   bajando desde la raíz a cada hoja.
```

El árbol resultante asigna palabras cortas a símbolos frecuentes y largas a raros, minimizando $\bar{L}$.

## Casos clave / Ejemplos

**Ejemplo 1: moneda justa.** $S=\{C, X\}$ con $p=0.5$ cada uno.

$$\textcolor{#a5e6b1}{H} = -0.5\log_2 0.5 - 0.5\log_2 0.5 = 1 \text{ bit/símbolo}$$

Huffman: C=0, X=1. $\bar{L}=1$, $\eta = 1$. Óptimo trivial.

**Ejemplo 2: fuente con 4 símbolos, $p = \{0.5, 0.25, 0.125, 0.125\}$.**

$$\textcolor{#a5e6b1}{H} = 0.5(1) + 0.25(2) + 0.125(3) + 0.125(3) = 1.75 \text{ bits}$$

Huffman: A=0, B=10, C=110, D=111. $\bar{L} = 0.5(1) + 0.25(2) + 0.125(3) + 0.125(3) = 1.75$. $\eta = 100\%$. Esto ocurre cuando todas las $p_i$ son potencias de $\frac{1}{2}$.

**Ejemplo 3: fuente sesgada, $p = \{0.9, 0.1\}$.**

$$\textcolor{#a5e6b1}{H} = -0.9\log_2 0.9 - 0.1\log_2 0.1 \approx 0.469 \text{ bits}$$

Huffman directo da $\bar{L}=1$ (no se puede menos que 1 bit/símbolo). $\eta \approx 47\%$. Para mejorar hay que **agrupar símbolos** (codificar bloques de 2 o más), acercándose a $H$ asintóticamente. Esto se formaliza como **extensión de una fuente de memoria nula**.

**Ejemplo 4 (del docente): "MI MAMA ME MIMA".** Mensaje de 15 símbolos. Frecuencias observadas:

- M: 6 → código `1`
- " " (espacio): 3 → código `01`
- A: 3 → código `000`
- I: 2 → código `0010`
- E: 1 → código `0011`

Mensaje codificado: `1 0010 01 1 000 1 000 01 1 0011 01 1 0010 1 000` → **33 bits**. En ASCII (8 bits/símbolo) habrían sido $15 \cdot 8 = 120$ bits. La compresión refleja que los símbolos frecuentes (`M`, espacio) reciben palabras cortas, y la condición de prefijos garantiza decodificación instantánea.

## Errores frecuentes

- Confundir información con datos. Un archivo de 1 GB de ceros tiene casi 1 GB de datos pero casi 0 bits de información.
- Pensar que la entropía depende de los símbolos. Solo depende de sus **probabilidades**, no de cómo se llamen.
- Olvidar que $\log_2 0 = -\infty$, pero $0 \cdot \log_2 0 = 0$ por convención (se demuestra por límite).
- Creer que Huffman siempre da eficiencia 100%. Solo cuando las probabilidades son potencias de 2.
- Confundir prefix-free con singular. Singular es solo "todas distintas"; prefix-free es mucho más fuerte.

## Pregunta-trampa típica

> "¿Por qué la longitud media nunca puede ser menor que la entropía?"

Porque la entropía es la cantidad real de información por símbolo: representa el **mínimo número promedio de preguntas binarias** necesarias para identificar un símbolo. Cualquier código binario asigna decisiones binarias (bits), y no podés tomar menos decisiones que las necesarias para reducir la incertidumbre a cero. La prueba formal usa la desigualdad de Kraft y la desigualdad de Gibbs.

> "Dame un código no instantáneo pero unívocamente decodificable."

Clásico: $\{0, 01, 011, 0111\}$. Cada palabra es prefijo de la siguiente, pero leyendo de izquierda a derecha podés decodificar sin ambigüedad porque siempre que veas un 0 sabés que arranca una palabra nueva.

## Marco de referencia integrador (Alice - Bob - Claude)

Righetti organiza la teoría como una arquitectura de cuatro componentes que conviven en cada pregunta de final:

1. **Conceptos básicos** — Información y Entropía. Cota: $0 \leq H(S) \leq \log_2 K$ con $K$ símbolos.
2. **Teorema de codificación de fuente (sin ruido)** — comunicación eficiente, define cuánto se puede comprimir.
3. **Teorema de capacidad de información** — compromiso ancho de banda vs. relación señal-ruido.
4. **Teorema de comunicación confiable (canal ruidoso)** — codificación de canal con error bajo control.

El marco se piensa como **Alice transmitiendo a Bob a través de un canal supervisado por Claude (Shannon)**: la fuente Alice tiene una entropía, el canal tiene una capacidad, y el problema es ajustar la codificación para que Bob reciba con error tan bajo como se quiera mientras $R < C$.

## Visión integradora: límites fundamentales

El docente subraya que Shannon estableció **dos preguntas con respuesta cuantitativa** (frases textuales de sus diapositivas):

- "¿Cuál es la complejidad irreducible por debajo de la cual una señal que debe ser transmitida no puede ser compactada sin pérdida de información?" — **Límite de la eficiencia** (codificación de fuente).
- "¿Cuál es el límite absoluto de la tasa de transmisión utilizada para transportar una señal de manera confiable a través de un canal ruidoso?" — **Límite de la confiabilidad** (codificación de canal).

Esta visión integradora es el "Marco de Referencia" que el docente recomienda tener presente al estudiar cualquier subtema.

## Énfasis del docente (Righetti)

- **Nombre exacto de la teoría:** la llama "Teoría Clásica de la Información" (también "teoría estadística de la información"), para diferenciarla de la "teoría algorítmica de la información" (Gregory Chaitin y otros). Suele mencionarlo al introducir el tema.
- **Bibliografía oficial:** Norman Abramson, *Information Theory and Coding* (1963; versión española: *Teoría de la Información y Codificación*, Paraninfo, 1986). Es el "libro cabecera" para este bloque.
- **Dos teoremas fundacionales** (los nombra en este orden):
  1. Codificación para una fuente sin ruido.
  2. Codificación para un canal ruidoso.
- **Marco "Alice / Bob / Claude":** lo usa en la primera diapositiva del tema y al cerrar — siempre dibuja el canal con perturbación $K^-$ entre transmisor y receptor.
- **Frase recurrente** sobre Shannon (1948): "el significado semántico de un mensaje era irrelevante para su transmisión. Un mensaje debe ser concebido como una secuencia con propiedades estadísticas".
- **Frase recurrente** sobre entropía y esfuerzo: "Cuanto mayor es la entropía del mensaje, más esfuerzo se necesita para transmitirlo".
- **Resultado clave que repite:** Shannon "brinda un límite teórico absoluto para la transmisión de bits (basándose en la Ley de los Grandes Números). No dice nada sobre cómo implementar dicha codificación." Útil para distinguir teoría de ingeniería en el final.
- **Pregunta típica de su ejemplo de Huffman:** "Con cuántos bits se codificaría si se usara ASCII? Saque conclusiones." (i.e. comparar 33 vs. 120 bits en `MI MAMA ME MIMA`).
- **Codificador óptimo:** lo define como "aquel que para codificar un mensaje X usa el menor número posible de bits (dígitos binarios)" y resalta que $\log_2[1/p(x_i)]$ es exactamente el número de bits que el codificador óptimo asigna al símbolo $x_i$.
- **Propiedades de la entropía que pregunta en final** (lista textual):
  - "Es no negativa. Se anula si y solo si un estado es 1 y el resto 0 (determinista)."
  - "Es máxima cuando todos los valores posibles son equiprobables."
  - "Para $n$ estados equiprobables, $H_{\max} = \log_2 n$."
- **Hartley antes de Shannon:** menciona el paper de R.V.L. Hartley (1928, "Transmission of information", Bell System Tech. J.) como antecedente directo. Útil para preguntas sobre historia.
- **Extensión de fuente de memoria nula:** es el camino para acercarse a $H$ con fuentes muy sesgadas; lo señala como justificación de por qué Huffman bloque-a-bloque no siempre es óptimo en eficiencia.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Comprimir un PDF con ZIP
Tomás un PDF de 10 MB lleno de texto y lo comprimís con ZIP: queda en 3 MB. Si en cambio comprimís un MP4 de Netflix, baja apenas un 1%. La diferencia es la entropía: el texto repite letras, espacios y palabras, así que su entropía por byte es baja y se comprime mucho. El video ya viene codificado con H.264 cerca de su entropía mínima, no queda jugo para exprimir.

**Por qué importa acá**: el Teorema de Shannon dice que no podés comprimir por debajo de $H(S)$. Cuando ZIP no logra reducir, es porque la fuente ya está cerca de ese límite teórico.

### JPEG en una foto de WhatsApp
Sacás una foto con el celu (12 MP en RAW pesa ~25 MB) y al mandarla por WhatsApp llega como JPEG de 200 KB. Adentro del JPEG hay un paso de codificación de Huffman: los coeficientes DCT más frecuentes (cercanos a cero) reciben códigos cortos como `00`, y los raros reciben códigos largos de 10+ bits.

**Por qué importa acá**: Huffman aplicado a una distribución muy sesgada (la mayoría de coeficientes son ~0) acerca $\bar{L}$ a $H$, logrando ratios de compresión enormes — exactamente el escenario del ejemplo $p=\{0.9, 0.1\}$.

### ASCII vs UTF-8 en un tweet
Un tweet en inglés "hello world" en ASCII usa 11 bytes (8 bits cada uno = 88 bits). Pero la entropía real del inglés es ~1.5 bits/letra (Shannon lo midió en 1951). El alfabeto tiene 26 letras pero "e", "t", "a" aparecen mucho más que "z" o "q".

**Por qué importa acá**: ASCII es un código de bloque de longitud fija (singular pero lejos de óptimo). La eficiencia es $\eta = 1.5/8 \approx 19\%$ — por eso los algoritmos como gzip pueden reducir texto a la quinta parte.

## Conexiones

- Se conecta con **Shannon-canal** porque define qué tan rápido puede emitir información una fuente, y el canal limita cuánto se puede transmitir.
- Sirve de base para **compresión** (ZIP, gzip usan variantes de Huffman + LZ), **códecs multimedia** y **cifrado** (one-time pad alcanza secreto perfecto cuando la clave tiene entropía $\geq H$ del mensaje).
- Relaciona con **probabilidades condicionales** cuando la fuente tiene memoria (entropía condicional, cadenas de Markov).
