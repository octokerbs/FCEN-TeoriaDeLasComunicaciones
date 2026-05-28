---
slug: criptografia-clave-publica
title: Criptografía de clave pública - RSA y cifrado híbrido
category: cripto
order: 18
diagrams: [RSAFlow]
---

## Por qué importa

El cifrado simétrico tiene un problema profundo: **¿cómo intercambiar la clave secreta de forma segura por primera vez?** Si tenés un canal seguro para mandar la clave, podrías mandar el mensaje directo. Es un huevo-y-gallina que durante siglos no tuvo solución.

En 1976, Diffie y Hellman publicaron una idea revolucionaria: **dos claves matemáticamente relacionadas, una pública (visible para todos), otra privada (secreta de su dueño)**. Cualquiera puede cifrar con la pública; solo el dueño puede descifrar con la privada. Esto cambió todo: posibilitó comercio electrónico, mail seguro, firmas digitales y la web moderna.

RSA (Rivest, Shamir, Adleman, 1977) fue el primer algoritmo práctico de clave pública. Sigue siendo uno de los más usados, aunque hoy compite con criptografía de curvas elípticas.

## Intuición

Pensá en un buzón con dos llaves:

- **Llave de cierre (pública):** la imprimís en folletos, la repartís a todos. Cualquiera puede meter una carta y "cerrar" el buzón.
- **Llave de apertura (privada):** la tenés vos. Sin ella, lo que está adentro no se puede sacar.

La magia: ambas claves están **matemáticamente relacionadas**, pero conocer una no permite calcular la otra (en tiempo razonable). Eso es lo que hace posible la criptografía asimétrica.

## Simétrica vs asimétrica

| Aspecto | Simétrica (AES) | Asimétrica (RSA, ECC) |
|---------|-----------------|----------------------|
| Claves | Una compartida | Par (pública + privada) |
| Distribución | Difícil (canal seguro previo) | Fácil (pública es pública) |
| Velocidad | Muy rápida (Gbps fácil) | Lenta (miles de veces más lenta) |
| Tamaño de clave | 128-256 bits | 2048-4096 bits (RSA), 256 bits (ECC) |
| Uso típico | Encriptar datos | Intercambio de clave, firma |

**Conclusión práctica:** no se usan en aislado. Se combinan en **cifrado híbrido**: asimétrica para intercambiar una clave simétrica de sesión; simétrica para cifrar los datos grandes.

## RSA paso a paso

### Generación de claves

```
1. Elegir dos primos grandes p y q (típicamente 1024 bits cada uno).
2. Calcular n = p · q. Este es el "módulo".
3. Calcular φ(n) = (p-1) · (q-1).
4. Elegir e tal que 1 < e < φ(n) y gcd(e, φ(n)) = 1.
   Usualmente e = 65537 (= 2^16 + 1), pequeño y conveniente.
5. Calcular d tal que e · d ≡ 1 (mod φ(n)).
   Es el inverso multiplicativo de e módulo φ(n).
6. Clave pública: (e, n)
   Clave privada: (d, n) (en realidad incluye más para Chinese Remainder Theorem)
   Descartar p, q, φ(n) (sensible).
```

### Cifrado

Para un mensaje $m$ (entero con $0 \leq m < n$):

$$\textcolor{#a5e6b1}{c} = \textcolor{#a5c8f4}{m}^{\textcolor{#a5c8f4}{e}} \mod n$$

### Descifrado

$$\textcolor{#a5e6b1}{m} = \textcolor{#a5c8f4}{c}^{\textcolor{#a5e6b1}{d}} \mod n$$

### Por qué funciona

Por **teorema de Euler**: $m^{\phi(n)} \equiv 1 \pmod{n}$ si $\gcd(m, n) = 1$. Como $ed \equiv 1 \pmod{\phi(n)}$, existe $k$ tal que $ed = 1 + k\phi(n)$. Entonces:

$$\textcolor{#a5c8f4}{c}^{\textcolor{#a5e6b1}{d}} = m^{ed} = m^{1 + k\phi(n)} = m \cdot (m^{\phi(n)})^k \equiv m \cdot 1^k = \textcolor{#a5e6b1}{m} \pmod{n}$$

### Por qué es seguro

Romper RSA requiere **factorizar $n$** (recuperar $p$ y $q$) para obtener $\phi(n)$ y luego $d$. La factorización de enteros gigantes es un problema **computacionalmente duro** (sin algoritmos polinomiales conocidos en CPUs clásicas).

Para $n$ de 2048 bits, el mejor algoritmo conocido (GNFS) llevaría siglos. Pero **una computadora cuántica con Shor's algorithm lo factoriza en tiempo polinomial**. Por eso surge la criptografía post-cuántica.

## Diagrama

{{diagram: RSAFlow}}

El diagrama ilustra el flujo: Alice genera par (e, d), publica e. Bob cifra mensaje con e; Alice descifra con d. La privada nunca sale del lado de Alice.

## Ejemplo numérico (chico, didáctico)

Elegimos primos pequeños para que se vea:

```
p = 11, q = 13
n = 143
φ(n) = 10 · 12 = 120

Elegimos e = 7 (gcd(7, 120) = 1).

d tal que 7d ≡ 1 (mod 120):
  7 · 103 = 721 = 6 · 120 + 1 → d = 103.

Clave pública: (e=7, n=143)
Clave privada: (d=103, n=143)
```

**Cifrar mensaje m = 9:**

$$\textcolor{#a5e6b1}{c} = 9^7 \mod 143 = 4782969 \mod 143 = 48$$

**Descifrar c = 48:**

$$\textcolor{#a5e6b1}{m} = 48^{103} \mod 143 = 9$$

Listo. (Calcular $48^{103}$ a mano sería tedioso, pero hay algoritmos eficientes: exponenciación modular rápida con cuadrados sucesivos.)

## Confidencialidad vs autenticación

RSA es **conmutativo en cierto sentido**: ambas claves pueden cifrar y descifrar la otra.

### Para confidencialidad

Alice quiere mandar un mensaje secreto a Bob.

```
Alice cifra: c = m^{e_B} mod n_B   (clave pública de Bob)
Bob descifra: m = c^{d_B} mod n_B   (clave privada de Bob)
```

**Solo Bob puede leer**, porque solo él tiene su privada. Pero cualquiera podría haber cifrado con la pública de Bob: **no hay autenticación**.

### Para autenticación (firma)

Alice quiere demostrar que **ella** mandó el mensaje, sin importar quién lo lea.

```
Alice "cifra" con privada: s = m^{d_A} mod n_A
Cualquiera "descifra" con pública: m = s^{e_A} mod n_A
```

Si funciona, prueba que quien generó $s$ tenía la clave privada de Alice. Esto es **firma digital**. No hay confidencialidad (cualquiera lee m), pero hay autenticación.

### Confidencialidad + autenticación

Combinás ambas: primero firmás con tu privada, luego cifrás con la pública del destinatario.

$$\textcolor{#a5e6b1}{\text{ciphertext}} = (\textcolor{#a5c8f4}{m}^{\textcolor{#a5e6b1}{d_A}} \mod n_A)^{\textcolor{#a5c8f4}{e_B}} \mod n_B$$

El receptor primero descifra con su privada, luego verifica firma con la pública del emisor.

En la práctica, esto se hace con **hash** (firma sobre el digest) y cifrado simétrico (no sobre el mensaje completo). El RSA puro tiene además requisitos de padding (OAEP para cifrado, PSS para firma) para ser seguro.

## Costo computacional

RSA es **muchísimo más lento** que AES:

- AES-128: ~1 GB/s en hardware moderno (con AES-NI).
- RSA-2048: ~10-100 KB/s en cifrado, ~100-1000 KB/s en descifrado.

Por eso **no se usa para cifrar payloads grandes**. Se usa para:

- Intercambiar claves simétricas de sesión.
- Firmar mensajes (sobre hash, no sobre mensaje completo).
- Autenticar contrapartes (handshake).

## Cifrado híbrido

Combina lo mejor de ambos mundos:

```
1. Alice genera una clave simétrica aleatoria K (ej: 256 bits para AES).
2. Cifra el mensaje grande M con AES_K: C_data = AES_K(M).
3. Cifra K con la clave pública de Bob: C_key = K^{e_B} mod n_B.
4. Manda (C_key, C_data) a Bob.

Bob:
1. Descifra K con su privada: K = C_key^{d_B} mod n_B.
2. Descifra M con AES_K: M = AES^{-1}_K(C_data).
```

**Ventaja:** RSA cifra solo unos cientos de bytes (la clave K); AES hace el trabajo pesado.

Es lo que hace TLS, S/MIME, PGP. La única "operación cara" por sesión es la negociación RSA inicial.

## Otros algoritmos asimétricos

- **Diffie-Hellman (DH):** no cifra mensajes directamente; permite a dos partes acordar una clave secreta sobre canal público. ¿Cómo? Cada uno genera privado, manda pública, ambos calculan el secreto compartido vía operaciones modulares.
- **ECC (Elliptic Curve Cryptography):** misma idea que RSA/DH pero sobre curvas elípticas. **Mucho más eficiente**: 256 bits de ECC ≈ 3072 bits de RSA en seguridad. Mobile, IoT lo prefieren.
- **EdDSA, Ed25519:** firma sobre ECC, popular en SSH moderno, criptomonedas.
- **Algoritmos post-cuánticos (Kyber, Dilithium):** resistentes a Shor. NIST los está estandarizando.

## Casos clave / Ejemplos

**Ejemplo 1: handshake TLS 1.2 simplificado.**

```
1. Cliente -> Server: ClientHello (random_C, suites soportadas)
2. Server -> Cliente: ServerHello (random_S, suite elegida), Certificado (pública RSA), ServerHelloDone
3. Cliente verifica certificado vía CA.
4. Cliente genera pre-master-secret aleatorio, lo cifra con pública del server: c = pms^{e_S} mod n_S.
5. Cliente -> Server: ClientKeyExchange (c), ChangeCipherSpec, Finished.
6. Ambos derivan master-secret de pms + randoms.
7. De ahí derivan claves AES de sesión.
```

A partir de ahí, todo el tráfico va con AES. **RSA se usó solo una vez por sesión**.

**Ejemplo 2: tamaño de mensaje cifrable directamente.** RSA-2048 cifra mensajes de hasta 2048/8 = 256 bytes. Con padding OAEP, queda ~190 bytes útiles. **Por eso no se cifra contenido directamente.**

**Ejemplo 3: tiempo de factorización.** $n$ de 2048 bits con GNFS estimado: $\sim 10^{20}$ años con tecnología clásica actual. Con Shor en una computadora cuántica con suficientes qubits, **horas a días**. Aún no existe esa máquina cuántica.

## Errores frecuentes

- Pensar que la clave pública también descifra. **No**: cifra. La privada descifra.
- Cifrar grandes archivos directo con RSA. Es lentísimo e impráctico; usá híbrido.
- Reusar el mismo $n$ con distintos $e$ y $d$ para varios usuarios. **No es seguro**: facilita ataques (CRT attack).
- Olvidar el padding (OAEP, PSS). RSA "puro" tiene vulnerabilidades (deterministic encryption, malleability).
- Confundir RSA con DH. RSA cifra mensajes; DH solo acuerda claves.
- Suponer que clave pública = certificado. El certificado **contiene** la pública más metadata firmada por una CA.

## Pregunta-trampa típica

> "¿Por qué RSA es seguro?"

Porque factorizar enteros grandes es un problema **computacionalmente duro** (sin algoritmo eficiente conocido en computadoras clásicas). La seguridad **no es matemática absoluta**: es **computacional**. Si mañana aparece un algoritmo polinomial para factorizar (o una computadora cuántica suficiente), RSA se rompe instantáneamente. Por eso se está migrando a post-cuántico.

> "¿Se puede deducir la clave privada desde la pública?"

Sí, **conceptualmente**: dado $n$, podés factorizarlo en $p \cdot q$, calcular $\phi(n)$, y de ahí $d$ a partir de $e$. Pero **factorizar $n$ es el cuello de botella**: para tamaños actuales (2048+ bits), es inviable con tecnología clásica.

> "Si Bob recibe un mensaje cifrado con su pública, ¿está seguro de que viene de Alice?"

**No.** Cualquiera puede cifrar con la pública de Bob (¡por eso es pública!). Para autenticación, Alice debe **firmar** (con su privada). Lo ideal es combinar: Alice firma + Alice cifra con pública de Bob.

## Énfasis del docente (Righetti)

- **El problema fundacional**: Righetti plantea la motivación así: "Criptografía de clave simétrica: requiere que el emisor y el receptor conozcan una misma clave secreta compartida. **¿Cómo ponerse de acuerdo en la clave, especialmente si nunca se han visto?**". La clave pública es "**un enfoque radicalmente distinto**".
- **Hitos históricos**: cita textualmente **[Diffie-Hellman 1976, RSA (Rivest–Shamir–Adleman) 1978]**. Suele preguntar fechas y autores.
- **Definición clave pública/privada**: "Clave de encriptación: pública conocida por todos. Clave de desencriptación: privada, conocida sólo por el receptor". Y enfatiza: "Las claves de encriptado (pública) y desencriptado (privada) son **lo suficientemente diferentes como para que la segunda no pueda calcularse a partir de la primera**".
- **Requisitos formales del par de claves**:
   - Debe ser **fácil cifrar o descifrar dada la clave adecuada**.
   - Debe ser **inviable computacionalmente derivar la clave privada** a partir de (a) la clave pública o (b) un texto que ha sido descifrado.
- **Notación de Righetti**: $K_B^+$ para clave pública de Bob, $K_B^-$ para clave privada de Bob. La identidad fundamental: $m = K_B^-(K_B^+(m))$.
- **RSA - fundamento teórico**: "Los conceptos teóricos que sustentan este algoritmo son propiedades matemáticas respecto a los números primos, módulos y exponenciación. **Factorizar números muy grandes en números primos es computacionalmente muy costoso**". Y la propiedad clave: $(x^a)^b = (x^b)^a$.
- **RSA: elegir claves paso a paso** (esto suele caer en el final):
   1. Elegir dos números primos grandes, $p$ y $q$ (por ejemplo, **de 1024 bits cada uno**).
   2. Calcular $n = p \cdot q$ y $z = (p-1) \cdot (q-1)$.
   3. Elegir $e$ con $e$ pequeño y $e < n$, que **no tenga factores comunes con $z$** (e y z son primos relativos).
   4. Encontrar un número $d$ tal que $e \cdot d - 1$ sea **divisible de forma exacta entre $z$** (en otras palabras, $e \cdot d \mod z = 1$).
   5. La clave pública es $(n,e)$. La clave privada es $(n,d)$.
- **RSA: encriptar/desencriptar paso a paso**:
   - Para encriptar un patrón de bits $m$: $c = m^e \mod n$ (el resto cuando $m^e$ se divide por $n$).
   - Para desencriptar el ciphertext $c$: $m = c^d \mod n$.
   - Identidad: $m = (m^e \mod n)^d \mod n$.
- **Ejemplo numérico de Righetti** (el clásico que él usa, distinto al de p=11, q=13 que tenemos arriba):
   - $p = 3$, $q = 11$.
   - $n = 33$, $z = (3-1) \cdot (11-1) = 20$.
   - $e = 3$, $d = 7$ (verifica $3 \cdot 7 = 21 = 20 + 1$).
   - Clave pública: $(33, 3)$; clave privada: $(33, 7)$.
   - Este ejemplo aparece en sus diapositivas y es el típico que pide reproducir en parcial.
- **"Otra propiedad importante" de RSA**: $K_B^-(K_B^+(m)) = m = K_B^+(K_B^-(m))$. **Las claves son intercambiables en el orden de aplicación**. "Usar primero clave pública, seguida de clave privada" o "usar primero clave privada, seguida de clave pública" dan ambas $m$. Comentario textual: "Por ejemplo útil para firma digital".
- **Cifrado asimétrico es caro para mensajes largos**: "Encriptar con clave pública es computacionalmente caro para mensajes largos". Por eso se usa **híbrido**: clave pública para intercambiar la clave simétrica, simétrica para los datos.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Abrir HTTPS en cualquier sitio
Cuando entrás a homebanking.com, el navegador y el server hacen un TLS handshake. El server presenta su certificado con clave pública RSA-2048 (o ECDSA). Tu navegador genera un pre-master-secret aleatorio, lo cifra con la pública del banco, y se lo manda. Solo el banco con su privada puede descifrarlo. Ambos derivan claves AES de sesión y de ahí todo va con AES-GCM.

**Por qué importa acá**: es el cifrado híbrido en su uso más masivo. RSA solo se ejerce una vez al inicio (handshake), el resto del tráfico va con simétrico rápido. Pasa millones de veces por segundo en internet.

### Firmar un commit de Git con GPG
Configurás Git con tu clave GPG. Cuando hacés `git commit -S`, Git toma el hash del commit, lo "cifra" con tu clave privada GPG (firma). Cualquiera con tu clave pública verifica que el commit lo hiciste vos. GitHub muestra el badge "Verified" al lado.

**Por qué importa acá**: muestra RSA en modo firma. No hay confidencialidad (todos leen el commit), solo autenticación. Es la misma identidad fundamental: $K^-(K^+(m)) = m = K^+(K^-(m))$ — la propiedad del docente que permite ambos sentidos.

### Llave SSH al servidor de la facultad
Generás un par con `ssh-keygen -t ed25519` (curva elíptica, no RSA, pero misma idea asimétrica). Copiás la pública en `~/.ssh/authorized_keys` del server. Cuando hacés `ssh server`, el server te manda un desafío aleatorio que vos firmás con tu privada local; el server verifica con tu pública y te deja entrar sin password.

**Por qué importa acá**: muestra autenticación asimétrica práctica. Tu privada nunca sale de tu laptop. Si te roban el server, no obtienen las privadas de los usuarios — el ataque clásico de "leak de DB de passwords" no aplica.

## Conexiones

- Se conecta con **firma digital y PKI**: la firma usa la misma estructura de clave pública pero al revés.
- Sirve de base para **TLS, SSH, mail seguro**: todos usan cifrado híbrido con RSA o ECC en el handshake.
- Relaciona con **criptografía fundamentos**: AES sigue siendo el caballito de batalla, pero RSA es la entrada.
- Vincula con **seguridad y ataques**: ataques de canal lateral (timing, side-channel) son comunes en implementaciones, incluso si el algoritmo es perfecto.
