---
slug: firma-digital-pki
title: Firma digital, hashes y PKI
category: cripto
order: 19
diagrams: [DigitalSignature]
---

## Por qué importa

Cifrar es esconder, pero a menudo lo importante no es esconder sino **probar** cosas:

- Que el mensaje **no fue modificado** en el camino (integridad).
- Que el remitente es **quien dice ser** (autenticación).
- Que el remitente **no puede negar** haberlo mandado (no repudio).
- Que la clave pública que estás usando **realmente es de quien decís que es** (autenticidad de la clave).

La firma digital combinada con una infraestructura de certificados (PKI) resuelve todo esto. Es la base de HTTPS, firmas legales (DNI digital, AFIP), updates de software, y los sistemas blockchain.

## Intuición

Imaginá que recibís un contrato firmado a mano. La firma sirve para tres cosas:

1. **Identificación:** la firma es única de la persona.
2. **No repudio:** firmaste, no podés decir después "no fui yo".
3. **Integridad:** si se modifica el documento posterior, las copias firmadas siguen mostrando el contenido original.

Una firma digital hace exactamente lo mismo pero matemáticamente. La diferencia: no podés "imitar" una firma digital sin la clave privada.

## Las propiedades

- **Confidencialidad:** solo el destinatario puede leer. → cifrado.
- **Integridad:** detectar si el mensaje fue alterado. → hash + MAC o firma.
- **Autenticación:** verificar identidad del emisor. → firma.
- **No repudio:** el emisor no puede negar después. → firma digital con clave privada solo suya.

Notá: confidencialidad **no implica** integridad ni autenticación. Hace falta combinar mecanismos. Por eso TLS usa cifrado + MAC, o cifrado autenticado (AEAD: GCM, ChaCha20-Poly1305).

## Hash (message digest)

Una función hash $H$ toma un input de **tamaño arbitrario** y devuelve un output de **tamaño fijo** (típicamente 128-512 bits). Para uso criptográfico debe cumplir:

- **Preimagen resistente:** dado $h$, es inviable encontrar $m$ tal que $H(m) = h$.
- **Segunda preimagen resistente:** dado $m_1$, es inviable encontrar $m_2 \neq m_1$ con $H(m_1) = H(m_2)$.
- **Colisión resistente:** es inviable encontrar **cualquier** par $(m_1, m_2)$ con $H(m_1) = H(m_2)$.

Y debe ser **rápida** de calcular y **determinística** (mismo input → mismo output, siempre).

### Algoritmos comunes

| Algoritmo | Año | Salida | Estado |
|-----------|-----|--------|--------|
| MD5 | 1992 | 128 bits | **Roto** (colisiones triviales). No usar para seguridad. |
| SHA-1 | 1995 | 160 bits | **Roto** (colisiones encontradas 2017). Deprecado. |
| SHA-2 (SHA-256, SHA-512) | 2001 | 256/512 bits | Seguro. **Estándar actual.** |
| SHA-3 (Keccak) | 2015 | variable | Seguro. Estructura distinta a SHA-2 (sponge). |
| BLAKE2 / BLAKE3 | 2012/2020 | variable | Seguro y rapidísimo. |

MD5 y SHA-1 **siguen usándose para checksums no-críticos** (verificar descargas, no para seguridad). Para firma, certificados, integridad seria: SHA-256 mínimo.

## Cómo se firma

La firma se aplica **sobre el hash del mensaje**, no sobre el mensaje completo. Razones:

- Hashear es rápido; firmar grandes mensajes con RSA sería lentísimo.
- Permite firmar mensajes de cualquier tamaño con un cómputo de tamaño fijo.

### Proceso (firmar)

```
1. Alice quiere firmar un mensaje m.
2. Calcula h = H(m) con SHA-256 (por ejemplo).
3. Cifra h con su clave privada: s = h^{d_A} mod n_A.
   (En la práctica con padding PSS u otro esquema seguro.)
4. Envía (m, s) a quien sea.
```

### Proceso (verificar)

```
1. Bob recibe (m, s) y conoce la clave pública de Alice.
2. Calcula h' = H(m).
3. "Descifra" s con la pública de Alice: h'' = s^{e_A} mod n_A.
4. Si h' == h'', la firma es válida.
   - Si difieren: el mensaje fue modificado, o la firma no es de Alice.
```

## Diagrama

{{diagram: DigitalSignature}}

El diagrama muestra el flujo: hash del mensaje, firma con privada, verificación con pública comparando los hashes.

## ¿Por qué proporciona no repudio?

Porque **solo Alice tiene su clave privada**. Si una firma $s$ verifica con la pública de Alice, **alguien con la privada generó esa firma**. Asumiendo que la privada está protegida, ese alguien es Alice. Ella no puede decir "no fui yo" sin admitir negligencia (filtración de clave) o robo.

Cifrar con clave **simétrica compartida** no da no repudio: ambos lados tienen la clave, así que cualquiera de los dos pudo generar el ciphertext. Por eso firmas requieren **asimétrica**.

## El problema de la clave pública: PKI

Tenés la clave pública de "Bob". ¿Cómo sabés que es realmente de Bob y no de un atacante? Si Eve te manda su pública diciendo "soy Bob", podrías cifrar tus secretos para Eve.

Necesitás una **infraestructura de confianza**: un tercero que dé fe de que "esta pública pertenece a este sujeto". Eso es PKI (Public Key Infrastructure).

## Certificados X.509

Un **certificado** es un documento que contiene:

- Identidad del sujeto (nombre, organización, dominio).
- Su clave pública.
- Período de validez.
- Identidad del emisor (la CA que lo firma).
- **Firma digital de la CA** sobre todo lo anterior.

Si confiás en la CA, confiás en el certificado, y por tanto en la pública que contiene.

```
Certificate:
    Data:
        Version: 3
        Serial Number: 12345
        Issuer: CN = Let's Encrypt Authority X3
        Validity:
            Not Before: Jan 1 2024 00:00:00
            Not After:  Apr 1 2024 00:00:00
        Subject: CN = www.empresa.com
        Subject Public Key Info: RSA, 2048 bits, modulus = ...
    Signature Algorithm: SHA256-RSA
    Signature: <bytes>
```

## Cadena de confianza

Las CAs forman una jerarquía:

```
Root CA (autofirmado, en el "trust store" del sistema)
   |
   v
Intermediate CA (firmado por Root)
   |
   v
Certificate de www.empresa.com (firmado por Intermediate)
```

Cuando tu navegador valida un cert, **construye y verifica toda la cadena**. La root debe estar en el trust store del sistema (vienen pre-instaladas: Mozilla, Apple, Google, MS las curan).

**Por qué jerarquía:** la root es **muy valiosa** y se mantiene offline. Operar con intermediates evita exponerla. Si una intermediate se compromete, se revoca y se emite otra, sin tocar la root.

## CAs (Certificate Authorities)

- **Comerciales:** DigiCert, Sectigo, GoDaddy. Cobran. Verificación variable (DV, OV, EV).
- **Gratuitas:** Let's Encrypt (la más usada hoy), ZeroSSL. Solo DV, automatizadas vía ACME.
- **Privadas internas:** una empresa puede operar su propia CA para certificados internos.

Tipos de validación:

- **DV (Domain Validation):** la CA verifica que controlás el dominio (típicamente respondiendo a un challenge en HTTP o DNS). El más común hoy.
- **OV (Organization Validation):** la CA verifica también la organización. Más caro.
- **EV (Extended Validation):** verificación humana intensiva. Antes mostraban barra verde en navegadores; hoy ese trato visual se eliminó.

## Revocación

¿Qué pasa si una clave privada se filtra antes del vencimiento?

- **CRL (Certificate Revocation List):** lista publicada por la CA con los certificados revocados. El navegador la descarga periódicamente.
- **OCSP (Online Certificate Status Protocol):** consulta en tiempo real a un endpoint de la CA por el estado de un cert.
- **OCSP Stapling:** el server adjunta la respuesta OCSP firmada al handshake TLS, evitando que el cliente tenga que consultar (privacidad + performance).

## SSL / TLS handshake (resumen)

**TLS** (sucesor de SSL) usa todo esto para establecer comunicación segura.

```
Cliente                                  Servidor
  |                                        |
  |-- ClientHello (cipher suites, random) ->|
  |                                        |
  |<-- ServerHello (suite elegida, random) -|
  |<-- Certificate (cadena hasta root) ----|
  |<-- ServerKeyExchange (DH params)*------|
  |<-- ServerHelloDone --------------------|
  |                                        |
  | Cliente valida certificado.            |
  |                                        |
  |-- ClientKeyExchange (encrypted pms) -->|
  |-- ChangeCipherSpec ------------------->|
  |-- Finished (hash de handshake) ------->|
  |                                        |
  |<-- ChangeCipherSpec -------------------|
  |<-- Finished ---------------------------|
  |                                        |
  |==== datos cifrados con AES de sesión ==>|
  |<==== datos cifrados con AES de sesión ==|
```

(* ServerKeyExchange aparece en suites con forward secrecy, DHE/ECDHE.)

Pasos clave:

1. Cliente y server acuerdan suite criptográfica.
2. Server prueba su identidad con certificado firmado por CA.
3. Acuerdan un secret compartido (vía RSA o DH).
4. Derivan claves AES de sesión.
5. Cierran el handshake con verificación de integridad.
6. Comienza el tráfico cifrado.

**TLS 1.3** (2018) simplifica enormemente este flujo: 1 RTT, opcionalmente 0-RTT en reconexiones, elimina suites inseguras.

## Casos clave / Ejemplos

**Ejemplo 1: firma de mail (S/MIME, PGP).** Alice firma su mail con su privada y adjunta su certificado. Bob verifica firma con la pública de Alice (en el cert), valida cert hasta la root, y sabe que el mail no fue alterado y que Alice lo mandó.

**Ejemplo 2: descargar software firmado.** Microsoft firma sus updates. Tu Windows verifica la firma usando la pública embebida. Si la firma no calza, **rechaza el update**: protege contra malware que intente hacerse pasar por Microsoft.

**Ejemplo 3: certificado wildcard.** `*.empresa.com` cubre `mail.empresa.com`, `www.empresa.com`, `api.empresa.com`. Pero **no** cubre `mail.dev.empresa.com` (un nivel más). Práctico para empresas con muchos subdominios.

## Errores frecuentes

- Confundir cifrado con firma. Cifrar con pública = solo el dueño de privada puede leer. Firmar con privada = cualquiera con pública puede verificar.
- Verificar firma sobre el mensaje sin hashearlo primero. La firma es sobre el hash; recalculá el hash.
- Aceptar certificados auto-firmados sin pensar. En desarrollo está bien; en producción es vector de MitM.
- Olvidar verificar la fecha de validez o la revocación.
- Pensar que un certificado prueba que el sitio es "bueno". Solo prueba **que controla el dominio**. Un sitio de phishing también puede tener cert.
- Reutilizar claves entre firma y cifrado en RSA. **Mala práctica**: separá pares para cada uso.

## Pregunta-trampa típica

> "¿Una firma digital encripta el mensaje?"

**No.** Encriptación y firma son operaciones distintas. La firma genera un **anexo** (bloque de firma) que se adjunta al mensaje en claro. Para confidencialidad + firma, hacés ambas: firmá con tu privada y cifrás con la pública del receptor.

> "Si tengo el certificado de un sitio HTTPS, ¿puedo descifrar su tráfico?"

**No**, salvo que tengas su **clave privada** (que no está en el certificado público). El certificado contiene solo la pública. Para descifrar tráfico TLS necesitarías la privada del server, o capturar el handshake completo y romper RSA o DH.

> "¿Por qué TLS 1.3 elimina RSA key exchange?"

Porque RSA key exchange **no provee forward secrecy**: si la clave privada del server se compromete en el futuro, todo el tráfico pasado capturado puede descifrarse. TLS 1.3 obliga a usar (EC)DHE, que genera claves efímeras por sesión.

## Autenticación: protocolo challenge-response

Righetti dedica una sección entera a **autenticación de dos vías** con claves compartidas. Es un tema que suele caer en finales con preguntas sobre vulnerabilidades.

### Protocolo "challenge-response" básico

Notación: $K_{AB}$ es la clave secreta compartida entre Alice y Bob. $R$ es un random sin encriptar.

```
1.  A ---------------- "soy A" -------------------> B
2.  A <-------------- R_B (challenge) -------------- B
3.  A -------------- K_AB(R_B) -------------------> B    (A demuestra conocer K_AB)
4.  A <-------------- R_A (challenge) -------------- B
5.  A -------------- K_AB(R_A) -------------------> B    (B demuestra conocer K_AB)
```

Pasos paso a paso (texto de Righetti):

1. A envía su identidad a B.
2. B no puede aún determinar si el mensaje es realmente de A. B elige un challenge $R_B$, un número aleatorio suficientemente grande, y lo envía a A **sin encriptar**.
3. A encripta el mensaje 2 con la clave compartida, $K_{AB}(R_B)$, y lo devuelve a B.
4. Cuando B recibe el texto cifrado, sabe que proviene de A porque es el único que conoce $K_{AB}$.

Para autenticación mutua, A debe verificar también a B: A elige $R_A$ aleatorio y se lo manda sin encriptar; cuando B responde con $K_{AB}(R_A)$, A se asegura.

**Sobre la longitud del challenge**: la elección random y la longitud (e.g. **128 bits**) hace **muy improbable** que un tercero T tome $R_B$ y su respuesta $K_{AB}(R_B)$ de alguna sesión previa.

### Versión simplificada (vulnerable)

Una forma de simplificar la secuencia es haciendo que **cada participante transmita su identidad y el challenge elegido en el mismo mensaje**, sin esperar al envío de la otra parte:

```
1.  A ----- A, R_A -------------------------> B
2.  A <---- R_B, K_AB(R_A) ------------------- B
3.  A ----- K_AB(R_B) ----------------------> B
```

Parece más eficiente, pero **es vulnerable a ataques por sesiones paralelas**.

### Ataque por sesiones paralelas (reflection attack)

Si resulta posible establecer **sesiones múltiples** entre los participantes, un tercero T puede engañar a B:

1. Mensaje 1 (primera sesión): T simula ser A, enviando identidad de A y $R_T$.
2. Mensaje 2: B responde con su challenge $R_B$, esperando que A lo devuelva encriptado.
3. Mensaje 3: T **no conoce $K_{AB}$**, así que **inicia una segunda sesión** con B usando $R_B$ como su challenge.
4. Mensaje 4: B le devuelve el challenge encriptado $K_{AB}(R_B)$ en la segunda sesión.
5. Mensaje 5: T usa esto como respuesta al mensaje 2 de la **primera sesión** y aborta la segunda.

Resultado: T se autenticó como A sin conocer la clave.

### Reglas de diseño (textuales de Righetti)

- El participante que **inicia** la transmisión debe probar su identidad **en forma previa** al participante receptor.
- Ambos participantes deben usar **claves diferentes** para la verificación de identidades, aun cuando esto signifique tener dos claves compartidas $K_{AB}$ y $K'_{AB}$.
- Deben elegir los challenges de **conjuntos diferentes** (por ejemplo el que inicia usa números pares y el que contesta números impares).
- Deben **resistir ataques que involucren una segunda sesión paralela**, en la que la información obtenida se use en una sesión diferente.

### KDC (Key Distribution Center)

Para distribuir claves de sesión de forma confiable:

```
1.  A ------ K_A( B, K_S ) -----------> KDC
                                          |
                                          v
2.  KDC -- K_B( A, K_S ) -----------------> B
```

1. A selecciona una clave de sesión $K_S$ y le comunica al KDC su intención de hablar con B. Este mensaje es encriptado con $K_A$ (la clave secreta que A comparte **solo con el KDC**).
2. El KDC desencripta el mensaje, toma la identidad de B y la clave de sesión, y construye un nuevo mensaje conteniendo la identidad de A y $K_S$, encriptado con $K_B$ (la clave que B comparte con el KDC).
3. Cuando B desencripta, sabe que A quiere comunicarse con él y conoce $K_S$.

## Énfasis del docente (Righetti)

- **No repudiación con criptografía asimétrica**: Righetti enuncia: "Mediante cifrado con la **Clave Privada**, Bob puede producir P y D_A(P), cosa que **solo Alice pudo haber hecho**". Esa es la base del no repudio.
- **Por qué no firmar el mensaje entero**: "Encriptar con clave pública es computacionalmente caro para mensajes largos". Solución: **hash + firma sobre el digest**.
- **Propiedades de la función de hash** (textuales):
   - **Muchos a uno**: muchos mensajes mapean a un mismo hash.
   - Produce **resumen de mensaje de tamaño fijo**.
   - Dado el resumen $x$, es **computacionalmente inviable** hallar $m$ para que $x = H(m)$.
- **Flujo de firma digital paso a paso** (notación de Righetti):
   1. Bob aplica función de hash $H$ al mensaje largo $m$ → obtiene $H(m)$.
   2. Bob encripta $H(m)$ con su **clave privada** $K_B^-$ → firma digital $K_B^-(H(m))$.
   3. Envía mensaje largo $m$ + firma digital a Alicia.
   4. Alicia: aplica $H$ al mensaje recibido $m$ → $H(m)$.
   5. Alicia: desencripta la firma con la **clave pública** $K_B^+$ → recupera $H(m)$.
   6. Compara: **¿Son iguales?**
- **Algoritmos de hash que Righetti destaca**:
   - **MD5** (RFC 1321): resumen de **128 bits** en proceso de **cuatro pasos**. Cadena $x$ arbitraria de 128 bits, parece difícil construir mensaje cuya dispersión MD5 sea igual a $x$. **Colisiones encontradas**.
   - **SHA-1**: estándar de EE.UU. [NIST, FIPS PUB 180-1]. Resumen de **160 bits**. **Colisiones encontradas**.
   - **SHA-2**: resumen de **256 y 512 bits**.
- **Firma digital con RSA + SHA-1** es el combo canónico que él presenta.
- **No repudio requiere asimétrica**: el énfasis es que cifrar con clave **simétrica compartida no da no repudio** porque ambos lados tienen la clave. La firma digital es **solo posible con asimétrica**.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Certificado de Let's Encrypt en cualquier sitio
La mayoría de sitios web usan certificados gratuitos de Let's Encrypt. Cuando entrás a un blog, el navegador construye la cadena: cert del sitio → firmado por Let's Encrypt Authority → firmado por ISRG Root X1, que está en el trust store de tu sistema. Si en algún paso la firma no valida o el cert está revocado, ves la pantalla roja de "Your connection is not private".

**Por qué importa acá**: PKI en acción. Sin una root CA confiable, no podrías validar quién es el sitio. Let's Encrypt democratizó HTTPS: pasó del 50% en 2016 al 95% del tráfico web en 2024.

### Code signing de un .dmg en macOS
Bajás Spotify.dmg del sitio oficial. Antes de instalar, macOS verifica la firma digital de Spotify con un certificado emitido por Apple Developer Program. Si no está firmado o la firma no valida, ves el mensaje "Spotify can't be opened because Apple cannot check it for malicious software".

**Por qué importa acá**: firma digital protegiendo la cadena de distribución de software. La privada de Spotify nunca sale de sus servidores; cualquiera puede verificar usando la pública (embedida en el cert). Si un atacante manipula el .dmg en tránsito, la firma no valida.

### Firma de un PDF con DNI digital (Argentina)
El gobierno argentino tiene firma digital con DNI. Cuando firmás un contrato PDF, el sistema toma el hash SHA-256 del documento y lo cifra con tu clave privada (que vive en el chip del DNI). Cualquier organismo verifica con la pública certificada por la AC-Raíz Argentina. Vale como firma manuscrita ante la ley.

**Por qué importa acá**: muestra exactamente el flujo del docente: hash + firma con $K^-$ + verificación con $K^+$. Y el no repudio es legal: no podés decir "no firmé" sin denunciar robo de DNI.

## Conexiones

- Se conecta con **criptografía clave pública**: firma es la operación "espejo" del cifrado RSA.
- Sirve de base para **HTTPS, SSH, mail seguro, software updates, blockchain**.
- Relaciona con **DNS** (DNSSEC firma respuestas) y **mail** (DKIM firma headers).
- Vincula con **seguridad y ataques**: ataques a CAs (DigiNotar 2011, Comodo), spoof de certificados, downgrade attacks.
