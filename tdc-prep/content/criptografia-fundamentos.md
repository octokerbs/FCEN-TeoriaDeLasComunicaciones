---
slug: criptografia-fundamentos
title: Criptografía - fundamentos y cifrado simétrico
category: cripto
order: 17
diagrams: [SymmetricVsAsymmetric]
---

## Por qué importa

Cuando mandás un mensaje por internet, atraviesa decenas de routers y enlaces controlados por terceros: tu ISP, ISPs intermedios, gobiernos, posiblemente atacantes. Sin criptografía, **todo viaja en claro**: cualquiera con acceso al cable puede leer tu password, tus DNIs, tus secretos. La criptografía es la disciplina que **transforma mensajes para que solo el destinatario legítimo pueda entenderlos**, incluso si todo el tráfico es interceptado.

Pero criptografía no es solo "esconder": es también **autenticar** (probar quién mandó), **integridad** (detectar modificaciones) y **no repudio** (que el emisor no niegue haberlo mandado). Estos cuatro pilares (confidencialidad, integridad, autenticación, no repudio) sostienen la seguridad de internet entera.

## Intuición

Imaginá que querés mandar una carta secreta a un amigo lejano. ¿Cómo asegurás que solo él la lea?

- **Sustitución:** reemplazás cada letra por otra según una regla acordada. Si interceptan, ven jeroglíficos.
- **Transposición:** mantenés las letras pero las desordenás.
- **Caja con candado (clave compartida):** vos y tu amigo tienen llaves idénticas. Cerrás la caja, la mandás, él la abre.
- **Caja con dos candados (clave pública):** él te manda una caja abierta (con candado abierto que solo él puede cerrar y abrir). Vos metés la carta, cerrás (cualquiera puede cerrar), pero solo él la abre.

Las dos primeras son **clásicas** y se rompen fácil. La tercera es **simétrica**: rápida, pero ¿cómo compartís la llave inicial? La cuarta es **asimétrica** (clave pública): resuelve la distribución pero es lenta. La combinación de ambas es lo que se usa en la práctica.

## Cifrado vs código

- **Código:** sustituye unidades semánticas (palabras, conceptos). "Atacar al amanecer" se convierte en "comprar 100 manzanas". Cada palabra del diccionario tiene un equivalente.
- **Cifrado:** opera sobre símbolos (letras, bits), sin conocer el significado. Más flexible y matemáticamente tratable.

La criptografía moderna es casi 100% cifrado. Los códigos sobreviven en contextos militares específicos (codewords) o como capa sintáctica adicional.

## Vocabulario

- **Plaintext (P) / texto plano:** el mensaje original.
- **Ciphertext (C) / texto cifrado:** el mensaje transformado.
- **Cifrar (encrypt):** $C = E_K(P)$.
- **Descifrar (decrypt):** $P = D_K(C)$.
- **Clave (K):** parámetro secreto que controla la transformación.
- **Algoritmo de cifrado:** la función $E$, $D$. **Público**.
- **Intruso pasivo:** escucha, no modifica. Busca leer mensajes.
- **Intruso activo:** modifica, inserta, repite. Más peligroso.

## Principio de Kerckhoff

> **La seguridad de un sistema criptográfico no debe depender del secreto del algoritmo, sino solo del secreto de la clave.**

Formulado por Auguste Kerckhoff en 1883. Razones:

- Los algoritmos secretos eventualmente se filtran o se descubren (ingeniería inversa).
- Algoritmos públicos pueden ser **analizados por toda la comunidad académica**: encontrar fallas es trabajo colectivo.
- Lo que sí debe ser secreto es la **clave**, que es chica y fácil de cambiar si se compromete.

**Corolario:** sospechá de cualquier producto que diga "nuestro algoritmo es propietario y por eso es seguro". Eso es **seguridad por oscuridad** y no funciona.

## Diagrama

{{diagram: SymmetricVsAsymmetric}}

El diagrama contrasta el flujo simétrico (una sola clave compartida) con el asimétrico (par pública/privada). En simétrico, Alice y Bob comparten K; en asimétrico, Alice cifra con la pública de Bob, Bob descifra con su privada.

## Cifrados clásicos

### Sustitución (César, Vigenère)

**César (siglo I a.C.):** cada letra se reemplaza por la que está $k$ posiciones después. "HOLA" con $k=3$ → "KROD".

- **Espacio de claves:** 25 (no hay desplazamiento 0). Trivial de quebrar por fuerza bruta.
- **Análisis de frecuencias** quiebra cualquier sustitución monoalfabética: en español, 'E' es la más común, luego 'A', 'O', etc.

**Vigenère (siglo XVI):** usa una clave (palabra). Cada letra del plaintext se desplaza según la letra correspondiente de la clave (repetida).

- Resistente al análisis de frecuencias mientras la clave sea larga y aleatoria.
- **Si la clave se repite mucho**, se puede atacar por análisis Kasiski (encontrar patrones).

### Transposición

Reordena las letras sin cambiarlas. Ejemplo: escribir el mensaje en columnas, leerlo por filas en otro orden.

```
Mensaje: HOLA MUNDO
Columnas (5):
H O L A M
U N D O .

Leído por filas reordenadas: HULOANDLAOOM.
```

Análisis: la frecuencia de letras es **igual** al plaintext (no las cambia), lo que delata la transposición pura. Se ataca por anagramas.

### Combinación

Cifrados serios combinan **sustitución + transposición** repetidas muchas veces. Cada ronda mezcla más el resultado, dificultando el análisis. Este es el principio de los cifrados de bloque modernos.

## One-Time Pad (OTP) y secreto perfecto

Si la **clave es tan larga como el mensaje, totalmente aleatoria, usada una sola vez**, el cifrado es **provadamente irrompible** (Shannon, 1949).

$$\textcolor{#a5e6b1}{C_i} = \textcolor{#a5c8f4}{P_i} \oplus \textcolor{#a5c8f4}{K_i}$$

(XOR bit a bit.)

**Propiedades:**

- Dado solo $C$, cualquier $P$ del mismo largo es **equiprobable**. No hay información que extraer.
- Secreto perfecto = entropía del mensaje conocida igual sin ver $C$ que con verlo.

**Limitaciones prácticas:**

- La clave debe ser **del mismo tamaño** que el mensaje. Si mandás 1 GB, necesitás 1 GB de clave verdaderamente aleatoria.
- La clave **no se puede reutilizar**: si la usás dos veces, $C_1 \oplus C_2 = P_1 \oplus P_2$, y ahí filtras información del par de plaintexts.
- Distribución de claves: ¿cómo intercambiás 1 GB de clave secreta? Si pudieras, podrías mandar el mensaje directo.

Usado en aplicaciones de máxima seguridad (hot line Washington-Moscú durante la Guerra Fría) con claves entregadas físicamente.

## Cifrado de bloque iterativo

Idea moderna: dividir el plaintext en **bloques** de tamaño fijo (64, 128 bits) y aplicar muchas **rondas** de operaciones invertibles. Cada ronda mezcla sustitución y transposición. La clave se expande en **subclaves**, una por ronda.

Ventajas:

- Algoritmo simétrico (cifrado y descifrado usan misma clave).
- Diseñable para que cada bit del output dependa de todos los bits del input (**difusión**) y de la clave (**confusión**).
- Eficiente en hardware y software.

## DES (Data Encryption Standard)

1977, NSA + IBM. Bloque de 64 bits, clave de 56 bits efectivos. 16 rondas Feistel.

**Estructura Feistel:**

```
Bloque dividido en izq (L) y der (R), 32 bits cada uno.
Por cada ronda i:
  L_i+1 = R_i
  R_i+1 = L_i XOR F(R_i, K_i)
Donde F es una función no lineal.
```

Propiedad: si la ronda es la misma, **cifrar y descifrar usan misma lógica**, solo invirtiendo orden de subclaves. Muy elegante.

**Problemas de DES:**

- Clave de **56 bits** es chica. Fuerza bruta moderna lo quiebra en horas.
- Por eso surgió 3DES.

## 3DES (Triple DES)

Aplicar DES tres veces con dos o tres claves distintas:

$$\textcolor{#a5e6b1}{C} = E_{K3}(D_{K2}(E_{K1}(\textcolor{#a5c8f4}{P})))$$

(Encrypt-Decrypt-Encrypt: si $K1 = K2 = K3$, equivalente a un DES simple → retrocompatible.)

- Con dos claves (K1 = K3): 112 bits de seguridad efectiva.
- Con tres claves: 168 bits.

Lento (tres pasadas) pero seguro. Usado en pagos por años. Hoy en deprecación a favor de AES.

## AES (Advanced Encryption Standard)

Año 2001, NIST. Reemplazo de DES. Bloque de **128 bits**. Claves de **128, 192 o 256 bits**.

- Estructura distinta a Feistel: cada ronda aplica **SubBytes** (sustitución), **ShiftRows** (transposición), **MixColumns** (mezcla lineal), **AddRoundKey** (XOR con subclave).
- 10, 12 o 14 rondas según tamaño de clave.

**Por qué se eligió AES:**

- Diseño público, abierto a análisis.
- Rápido en hardware y software (instrucciones AES-NI en CPUs modernas).
- Sin debilidades conocidas tras 20+ años de análisis.

Es el cifrado simétrico **estándar de facto** hoy. Lo usás cuando navegás HTTPS, encriptás discos, mandás mail con TLS.

## Modos de operación

Un cifrado de bloque solo cifra **un bloque**. Para mensajes largos, se necesita un **modo**:

- **ECB (Electronic Codebook):** cada bloque cifrado independientemente. **Inseguro**: bloques idénticos del plaintext dan ciphertext idéntico, revelando patrones.
- **CBC (Cipher Block Chaining):** cada bloque XOR-eado con el ciphertext anterior antes de cifrar. Necesita un IV (vector inicial) aleatorio.
- **CTR (Counter):** cifra un contador incremental y XOR con plaintext. Paralelizable.
- **GCM (Galois Counter Mode):** CTR + autenticación. Estándar moderno para "cifrado autenticado". TLS 1.2/1.3 lo usa.

## Casos clave / Ejemplos

**Ejemplo 1: César manual.** Plaintext "ATAQUE" con $k=3$: D-W-D-T-X-H → "DWDTXH". Para descifrar, restar 3 a cada letra.

**Ejemplo 2: OTP con XOR.** Plaintext "01101001". Clave aleatoria "10110100". Ciphertext = XOR = "11011101". Sin la clave, **cualquier plaintext de 8 bits es posible**.

**Ejemplo 3: ECB vs CBC visual.** Si cifrás una imagen con ECB, los patrones (un tablero de ajedrez, una foto con áreas uniformes) **siguen visibles**. Con CBC, el ciphertext parece ruido aleatorio. Por eso ECB se considera inseguro para cualquier cosa más allá de demos.

## Errores frecuentes

- Pensar que algoritmo secreto = seguro. **Kerckhoff:** la clave es lo único secreto.
- Reutilizar clave de OTP. **Anula el secreto perfecto.**
- Usar ECB para mensajes con estructura. Patrón visible.
- Usar IV predecible o constante en CBC. Compromete confidencialidad de los primeros bloques.
- Confundir cifrado con codificación. Base64 **codifica** (no es cripto), AES **cifra**.
- Suponer que cifrado solo = seguro. Falta **autenticación** (cifrado autenticado: GCM, ChaCha20-Poly1305) o un MAC separado. Sin eso, un atacante activo puede modificar el ciphertext.

## Pregunta-trampa típica

> "Si la clave es de 256 bits, ¿es 256 bits de seguridad?"

Solo **en el mejor caso**. La seguridad efectiva puede ser menor si el algoritmo tiene debilidades o la clave es predecible (mal generada). AES-256 con clave bien aleatoria tiene 256 bits; AES-256 con clave derivada de password débil tiene mucho menos. **Las cosas se rompen por la pieza más débil**, casi siempre la generación de claves o el manejo (no el algoritmo).

> "¿Cuál es la diferencia entre cifrado y codificación?"

**Codificación** transforma datos para que sean transportables (base64, UTF-8), sin secreto: cualquiera la revierte. **Cifrado** requiere una clave para revertir; sin ella, el resultado es ininteligible. Confundirlos es error muy común en alumnos nuevos y en algunas APIs ("encrypted" cuando solo encodea).

> "¿Por qué AES no usa Feistel como DES?"

Porque Feistel solo cifra **la mitad** del bloque por ronda (la otra mitad pasa sin cambio). AES aplica operaciones sobre **todo el bloque** en cada ronda, logrando difusión más rápida y permitiendo mejor paralelización en hardware moderno.

## Marco de propiedades de seguridad

Righetti abre el tema de seguridad enumerando **8 propiedades** que cualquier mecanismo debe enmarcar. Antes de evaluar una tecnología siempre pregunta: "¿qué subconjunto de estas propiedades provee?".

- **Confidencialidad**: los mensajes solo pueden ser entendidos por las partes especificadas.
- **Integridad**: los mensajes enviados no pueden ser modificados durante su transmisión.
- **Originalidad**: el mensaje no es una copia artificial repetida (anti-replay).
- **Temporalidad**: el mensaje no fue demorado maliciosamente.
- **Autenticación**: ninguna parte puede asumir en forma no autorizada la identidad de otra.
- **Control de acceso (Autorización)**: solo ciertos usuarios remotos pueden realizar ciertas acciones permitidas.
- **Disponibilidad**: todo usuario potencial tendrá su oportunidad de ser considerado y eventualmente admitido.
- **No repudiación**: ninguna de las partes puede negar haber participado en una transacción.

Y subraya que la seguridad se implementa en **diferentes capas** según el problema: Aplicación (SSH, PGP), Transporte (SSL/TLS), Red (IPsec), Enlace (WEP, WPA, WPA2).

## Énfasis del docente (Righetti)

- **Shannon como pilar histórico**: cita explícitamente el "Reporte interno en los Bell Labs (1945)" y el paper "C. E. Shannon, *Communication theory of secrecy systems*, The Bell System Technical Journal, vol. 28, no. 4, pp. 656-715, Oct. 1949". El **secreto perfecto del OTP** lo derivó Shannon. Righetti suele decir literalmente que es "**inmune a todos los ataques actuales y futuros sin importar cuánta potencia computacional tenga el intruso**".
- **One-Time Pad como cifrado inviolable**: tema central de su clase. Lo destaca como "Cifrado Inviolable" con bullets: elegir gran random bit string como clave (de igual longitud que el texto), usar **bit XOR** para encriptar y desencriptar. Y el caveat: "¿cómo distribuir y proteger la clave? Poco práctico".
- **Principio de Kerckhoff (1883)**: lo cita textualmente "Todos los algoritmos deben ser públicos, sólo las claves deben ser secretas". Refiere a `petitcolas.net/kerckhoffs` para profundizar. Idea clave: "tratar de mantener secreto el algoritmo nunca funciona (es decir, la seguridad por desconocimiento)".
- **Factor de trabajo**: terminología que usa explícitamente. "A mayor longitud de clave, mayor Factor de Trabajo o tiempo requerido del criptoanalista para romper la clave". Crece exponencialmente con el tamaño.
- **Tamaños de clave concretos**: usa estos rangos en su clase:
   - 64 bits: "previene lectura de mails por parte de hermanos menores".
   - 128/256 bits: uso comercial rutinario.
   - >256 bits: para sistemas más críticos.
- **Etimología griega**: empieza el tema con `κρύπτω (krypto, "oculto") y γράφως (graphos, "escribir")` = "escritura oculta". Detalle que suele aparecer.
- **Cifrado vs código**: distinción importante. **Cifrado** es transformación carácter por carácter o bit por bit, sin importar la estructura lingüística. **Código** reemplaza palabra por palabra/símbolo. Ejemplo recurrente: los **"code talkers"** indios Navajo usados por EE.UU. en el Pacífico durante la WWII.
- **Definiciones formales**: "Los mensajes a ser encriptados se denominan Texto Plano o `plaintext`. Son tomados como una entrada y son transformados por una función (algoritmo) parametrizada por una clave. La salida del proceso de encripción (cifrado) es conocida como `ciphertext`. Se asume que un intruso puede escuchar y copiar el ciphertext completo del canal de comunicación (intruso pasivo)".
- **Criptografía + criptoanálisis = criptología**. Righetti lo recalca.
- **Métodos básicos**: sustitución (preserva orden, ejemplo César 50 a.C. y sustitución monoalfabética con `26! ≈ 4·10^26` claves posibles), transposición (reordena, ejemplo clave `MEGABUCK`), polialfabética (1 alfabeto distinto por letra). Sustituciones monoalfabéticas se rompen por **propiedades estadísticas del lenguaje natural** (frecuencias de letras).
- **DES paso a paso**: cifrado de bloques, **orientado a bits no a caracteres**, transposición + sustitución, **bloques de 64 bits**, n=16 iteraciones con distintas claves derivadas de la clave única de 64 bits. Comentario: "AES es lo mínimo recomendado hoy en día. Claves más largas resuelven vulnerabilidades en DES".
- **3DES con tres claves**: $\text{ciphertext} = E_{K3}(D_{K2}(E_{K1}(\text{plaintext})))$. La forma `E-D-E` es importante porque con K1=K2=K3 colapsa a DES simple (retrocompatibilidad).
- **Modelo genérico de clave simétrica**: $C = E_K(P)$, $P = D_K(C)$, $P = D_K(E_K(P))$. "E y D son funciones matemáticas de dos parámetros, uno de los cuales representa la clave". Tanenbaum p. 767 es la referencia que usa.
- **Scherbius & Ritter 1918 / Enigma**: lo menciona como icono histórico de la criptografía, usada por Alemania en la WW2.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### WhatsApp end-to-end encryption
Cuando le mandás un mensaje a un amigo por WhatsApp, antes de salir de tu celu se cifra con una clave AES-256 derivada de una sesión Signal Protocol. Los servers de Meta solo ven ciphertext — no pueden leer tus mensajes aunque quisieran. Si alguien con autoridad pide los logs, Meta entrega bytes ininteligibles.

**Por qué importa acá**: cifrado simétrico (AES) en producción a escala global. Cada mensaje usa una clave distinta (forward secrecy). La distribución de claves la resuelve el handshake Signal usando criptografía asimétrica (próximo tema).

### Disco encriptado con FileVault/BitLocker
Apple/Windows ofrecen encriptación full-disk: cuando bootéa el sistema, ponés password, y se descifra una clave maestra AES que encripta todo el disco. Si te roban la laptop, sin la password el disco es ruido aleatorio.

**Por qué importa acá**: AES en modo XTS (variante para discos) protege datos en reposo. Es la diferencia entre "perder una laptop" y "filtrar datos sensibles". Sin encriptación, todo el disco es legible con quitar el SSD y conectarlo a otro equipo.

### Códigos OTP de banca digital
Cuando hacés una transferencia grande en homebanking, el banco te manda un código de 6 dígitos por SMS o app que solo sirve por 30 segundos. Internamente, ese código se genera con TOTP (HMAC-SHA1 sobre la hora actual + clave secreta compartida). Si interceptan el código, ya expiró.

**Por qué importa acá**: muestra OTP en un sentido distinto al one-time pad — aquí "one-time" significa que el token caduca. Pero el principio del docente aplica: clave secreta compartida + algoritmo público (TOTP RFC 6238).

## Conexiones

- Se conecta con **clave pública (siguiente tema)** porque la combinación híbrida usa AES + RSA en la práctica.
- Relaciona con **firma digital**: aunque firmas usan asimétrica, los message digests (hash) son primitivas relacionadas.
- Vincula con **seguridad de redes**: TLS, IPSec, SSH usan estos algoritmos como base.
- Se conecta con **teoría de información** (Shannon): el OTP alcanza el secreto perfecto porque la clave aporta entropía igual a la del mensaje.
