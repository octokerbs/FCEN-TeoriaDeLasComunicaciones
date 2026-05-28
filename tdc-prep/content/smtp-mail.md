---
slug: smtp-mail
title: SMTP y el sistema de email
category: aplicacion
order: 16
diagrams: []
---

## Por qué importa

El email es uno de los protocolos más antiguos de internet (1971) y uno de los pocos que sigue siendo **federado**: cualquiera puede correr un servidor de mail y hablar con cualquier otro. Esa apertura lo hizo universal pero también vulnerable: spam, phishing y suplantación nacieron porque el diseño original no contemplaba autenticación.

Entender SMTP, POP3, IMAP y el flujo completo de un email es clave: explica por qué el spam existe, cómo funcionan los antispam modernos, y por qué Gmail puede leer tus mails en cualquier dispositivo.

## Intuición

El sistema de email es parecido al correo postal:

- Vos escribís una carta en tu casa (UA).
- La llevás al buzón de tu oficina de correo (envío SMTP al MTA).
- Tu oficina la entrega a la oficina del destinatario (relay SMTP entre MTAs).
- El cartero la deja en el casillero del destinatario.
- El destinatario revisa su casillero cuando quiere (POP3 / IMAP).

SMTP es **push**: lo manda quien quiere mandar. POP3 e IMAP son **pull**: lo agarra quien lo quiere recibir, cuando quiere.

## Componentes: UA y MTA

- **UA (User Agent / MUA - Mail User Agent):** la aplicación con la que el usuario escribe y lee. Outlook, Thunderbird, Gmail web, Mail.app. Habla con el MTA del usuario.
- **MTA (Mail Transfer Agent):** el servidor que ruteea el mail entre dominios. Postfix, Sendmail, Exim, Exchange. Habla SMTP con otros MTAs.
- **MDA (Mail Delivery Agent):** entrega al buzón final del destinatario. Procmail, Dovecot LMTP.
- **MSA (Mail Submission Agent):** versión moderna del MTA para recibir de usuarios autenticados (puerto 587 vs 25).

## Flujo Alice → Bob

```
Alice                        Server Alice                Server Bob                Bob
(UA)                         (MTA/MSA)                    (MTA/MDA)                (UA)
  |                              |                            |                       |
  |-- SMTP (escribe y envía) ->  |                            |                       |
  |                              |                            |                       |
  |                              |-- DNS: MX para bob.com? ->.                        |
  |                              |<-- mx.bob.com -----------..                        |
  |                              |                            |                       |
  |                              |-- SMTP --------------------->                       |
  |                              |                            |                       |
  |                              |                            |- guarda en buzón Bob -|
  |                              |                            |                       |
  |                              |                            |<-- POP3/IMAP (lee)----|
  |                              |                            |--- mensaje ------> ---|
```

1. Alice compone en su UA y lo envía.
2. El UA habla SMTP con el MSA de Alice (típicamente con auth).
3. El servidor de Alice resuelve el MX de bob.com vía DNS.
4. Hace SMTP outbound al MTA de Bob (puerto 25).
5. El MTA de Bob acepta, lo entrega al buzón vía MDA.
6. Bob abre su UA y descarga vía POP3 o IMAP.

## SMTP - comandos básicos

Diálogo línea por línea, en texto. Servidor en 25, MTA-MTA, y 587 para envío autenticado de clientes.

```
S: 220 mx.gmail.com ESMTP Postfix
C: HELO mail.empresa.com
S: 250 Hello mail.empresa.com
C: MAIL FROM:<alice@empresa.com>
S: 250 OK
C: RCPT TO:<bob@gmail.com>
S: 250 OK
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: From: Alice <alice@empresa.com>
C: To: Bob <bob@gmail.com>
C: Subject: Hola
C: Date: Mon, 15 Jan 2024 10:00:00 -0300
C:
C: Hola Bob, ¿cómo andás?
C: .
S: 250 OK: queued as 12345
C: QUIT
S: 221 Bye
```

Comandos clave:

- **HELO / EHLO:** saludo. EHLO es la versión extendida (ESMTP), permite negociar STARTTLS, AUTH, etc.
- **MAIL FROM:** identifica al remitente (envelope sender). Puede ser distinto del header `From:`.
- **RCPT TO:** destinatarios. Uno o varios.
- **DATA:** comienza el cuerpo del mensaje. Termina con una línea con solo un punto.
- **QUIT:** cierra la sesión.

**Sin autenticación**, SMTP permite **falsificar el From**. Por eso nació el spam y por eso surgieron extensiones: SPF, DKIM, DMARC.

## Headers de un email

```
From: Alice <alice@empresa.com>
To: Bob <bob@gmail.com>
Cc: carolina@empresa.com
Subject: Reunión el viernes
Date: Mon, 15 Jan 2024 10:00:00 -0300
Message-ID: <abc123@empresa.com>
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----=_Part_1"

------=_Part_1
Content-Type: text/plain; charset=utf-8

Hola Bob, te paso la agenda.

------=_Part_1
Content-Type: application/pdf
Content-Disposition: attachment; filename="agenda.pdf"
Content-Transfer-Encoding: base64

JVBERi0xLjQK...
------=_Part_1--
```

Notar: los headers visibles (`From:`, `To:`) son **distintos** del envelope (`MAIL FROM`, `RCPT TO`). Spammers explotan esto.

## MIME (Multipurpose Internet Mail Extensions)

SMTP original solo soportaba ASCII. MIME permite:

- **Caracteres no-ASCII:** Latin-1, UTF-8 codificados (base64, quoted-printable).
- **Multimedia:** imágenes, audio, PDF como adjuntos.
- **Mensajes multipart:** texto + HTML + adjuntos en un solo mail.

**Content-Type:** indica el tipo MIME (`text/html`, `image/png`, `application/pdf`).

**Content-Transfer-Encoding:** cómo se codifica el binario para que pase por canales 7-bit.

- **7bit:** texto ASCII puro.
- **8bit:** texto extendido (no siempre soportado).
- **quoted-printable:** texto casi-ASCII con caracteres especiales escapados (`=E9` para é).
- **base64:** binario completo (overhead de ~33%).

## POP3 vs IMAP

Dos protocolos para que el UA descargue mails del servidor. Mismos puertos clásicos: POP3 = 110, IMAP = 143; con TLS: 995 y 993.

### POP3 (Post Office Protocol v3)

**Filosofía:** "descargar y borrar". El cliente baja todos los mails al disco local y normalmente el servidor los elimina.

```
USER alice
PASS xxx
LIST       (lista mensajes)
RETR 1     (descarga el 1)
DELE 1     (lo marca para borrar)
QUIT       (al salir, los marcados se borran)
```

**Limitación:** mal con múltiples dispositivos. Si descargás en el PC, el celu no ve nada. Servidores modernos soportan "keep on server" para mitigar.

### IMAP (Internet Message Access Protocol)

**Filosofía:** "el servidor es la fuente de verdad". El cliente sincroniza estado: lo que leíste, los flags, las carpetas, todo vive en el servidor.

- Manipulación de carpetas server-side.
- Soporta múltiples clientes simultáneos.
- Sincroniza flags (read, flagged, deleted).
- Descarga selectiva: solo headers, partes específicas de mensajes grandes.

**Ventaja:** acceso desde múltiples dispositivos con vista consistente. **Costo:** más complejo, requiere más recursos en server.

Gmail, Outlook y los proveedores modernos prefieren IMAP (o sus propios protocolos web).

## Spam y mitigaciones

Como SMTP no autentica, surgió una capa adicional para identificar mail legítimo:

- **SPF (Sender Policy Framework):** un TXT en DNS dice qué IPs pueden enviar mail por `empresa.com`. El MTA receptor verifica que la IP origen esté en la lista.
- **DKIM (DomainKeys Identified Mail):** el MTA emisor firma el mail con clave privada. La pública está en DNS (TXT). El receptor verifica.
- **DMARC:** combina SPF + DKIM y dice qué hacer si fallan (reject, quarantine, accept). Reporta abusos al dueño del dominio.
- **Listas negras (RBL):** IPs conocidas de spammers.
- **Greylisting:** rechazar temporalmente el primer intento, aceptar el segundo. Spammers raramente reintentan; MTAs legítimos sí.
- **Filtros bayesianos:** modelos estadísticos para detectar contenido típico de spam.

## Casos clave / Ejemplos

**Ejemplo 1: trazabilidad de un mail.** Los headers `Received:` se van apilando a medida que el mail pasa por MTAs:

```
Received: from mx2.gmail.com (mx2.gmail.com [142.250.x.y])
        by mx1.gmail.com with ESMTP id ...
        for <bob@gmail.com>; Mon, 15 Jan 2024 10:00:05 -0300
Received: from mail.empresa.com (mail.empresa.com [200.1.1.1])
        by mx2.gmail.com with ESMTP id ...
        for <bob@gmail.com>; Mon, 15 Jan 2024 10:00:03 -0300
```

Leés de **abajo arriba**: el primer salto está último. Útil para investigar phishing o demoras.

**Ejemplo 2: spoof del From.** Spammer manda:

```
MAIL FROM:<spammer@evil.com>
RCPT TO:<vic@gmail.com>
DATA
From: support@paypal.com
Subject: Confirmá tu cuenta
...
```

El `From:` visible dice "PayPal" pero el envelope sender es spammer@evil.com. SPF detecta que evil.com no autoriza esa IP a enviar como paypal.com → mail rechazado. Por eso DMARC es importante.

**Ejemplo 3: POP3 vs IMAP en dos dispositivos.** Alice usa Gmail en PC (IMAP) y celular (IMAP). Lee un mail en el celular: el flag "leído" se sincroniza al server. En el PC, el mail aparece como leído. Con POP3 sería: descargado en celular, ya no está en el server para el PC.

## Errores frecuentes

- Confundir envelope con headers. **MAIL FROM** es el envelope; **From:** es header. Pueden no coincidir.
- Pensar que el From visible es de confianza. **No es** sin DMARC.
- Suponer que POP3 sirve para múltiples dispositivos. **No**: para eso usar IMAP.
- Mandar adjuntos sin MIME boundary correcto. Errores típicos en clientes mal escritos.
- Pensar que SMTP es seguro porque corre en 587 con auth. Auth protege a tu MSA del abuso ajeno; **no encripta el viaje** entre MTAs si no usás STARTTLS.
- Olvidar que SMTP entre MTAs casi siempre es **best effort**: el server emisor puede reintentar pero no garantiza entrega. Por eso a veces hace falta un "bounce" tardío.

## Pregunta-trampa típica

> "¿Por qué el From puede falsificarse en email?"

Porque **SMTP nació sin autenticación** y los headers son arbitrarios. Cualquiera con acceso a un MTA puede mandar mail con cualquier `From:`. Las defensas modernas (SPF, DKIM, DMARC) se aplican en el receptor, validando contra DNS, pero **no todos los dominios las publican** y no todos los receptores las verifican estrictamente.

> "¿IMAP descarga el mail al cliente?"

Puede descargar **parcialmente o por demanda**. La diferencia con POP3 es que el server **mantiene** la copia y el estado. IMAP típicamente baja headers para mostrarte la lista, y el body cuando abrís un mail. Hay modos offline donde sincroniza todo, pero conceptualmente el server es la fuente de verdad.

> "¿Cómo se evita que un mail circule eternamente entre MTAs?"

Header `Received:` se agrega en cada salto. Si un mail acumula muchísimos (>20-30), los MTAs lo descartan asumiendo loop. También hay otros límites (TTL en mailing lists, max-hops en configs).

## Énfasis del docente (Righetti)

- **Tres componentes principales del correo electrónico**: 1) **Agentes de usuario** (también llamados "lector de correo": Outlook, Thunderbird), 2) **Servidores de correo** (con buzón de entrada y cola de mensajes de salida), 3) **Protocolo SMTP** entre servidores. Importante: Righetti distingue "buzón" (entrada) y "cola de mensajes" (salida) en el mismo server.
- **RFC 2821** para SMTP, **RFC 822** para el formato de los mensajes de correo. **MIME** está en RFC 2045 y 2056. Suele caer.
- **Las tres fases de la transferencia SMTP**: 1) "Acuerdo" (saludo - HELO), 2) Transferencia de mensajes, 3) Cierre. Interacción comando/respuesta donde **los comandos son texto ASCII** y la respuesta es **código de status + frase**.
- **Restricción clave**: "Los mensajes deben codificarse con caracteres de siete bits en ASCII". Por eso existe MIME (para no-ASCII y binarios).
- **Ejemplo Alicia→Roberto**: paso a paso con `crepes.fr` y `hamburger.edu` (ejemplo recurrente del docente). Comandos HELO, MAIL FROM, RCPT TO, DATA, QUIT, con códigos 250 (OK), 354 (Enter mail), 221 (closing connection).
- **MIME tiene siete tipos definidos** (RFC 2045), cada uno con uno o más subtipos. Tipo y subtipo se separan con barra: `Content-Type: video/mpeg`.
- **Cabeceras MIME clave**: `MIME-Version`, `Content-Transfer-Encoding` (ej: base64), `Content-Type` (ej: image/jpeg). Righetti suele dar el ejemplo de Alicia mandando "imagen de un delicioso crepe" como datos base64.
- **Puerto 25 SMTP**: Righetti lo subraya como el "puerto recomendado y usualmente utilizado". El puerto 587 (MSA) es más moderno.
- **POP3 vs IMAP en la transferencia y entrega**: Righetti los presenta como protocolos de acceso/lectura al buzón, no de envío. SMTP es el de envío y relay.
- **Formato del mensaje (RFC 822)**: cabecera + línea en blanco + cuerpo. La cabecera tiene Para:, De:, Asunto:. El cuerpo es **solo caracteres ASCII**.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Mandar un email desde Gmail a Outlook
Componés un mail desde gmail.com a alguien@hotmail.com. Tu navegador habla con los servers de Google (no SMTP, sino su propio protocolo web). Los MTAs de Google consultan los MX de hotmail.com vía DNS, encuentran `outlook-com.olc.protection.outlook.com`, y abren SMTP en el puerto 25 hacia ahí. STARTTLS encripta el viaje. Microsoft lo acepta, lo guarda en el buzón. Tu amigo lo lee por IMAP desde su iPhone.

**Por qué importa acá**: muestra el flujo completo Alice→Bob del docente. SMTP entre MTAs sigue siendo federado: Google y Microsoft se entienden por un protocolo de 1982.

### Phishing de "PayPal" en tu inbox
Llega un mail con `From: support@paypal.com` pidiéndote actualizar la cuenta. Mirás los headers (`Received:`) y descubrís que el primer salto fue desde una IP de Rusia, no de PayPal. El envelope `MAIL FROM` dice spammer@evil.ru. Si PayPal publicó SPF/DKIM/DMARC correctamente, Gmail debería haberlo marcado como spam — pero algunos pasan los filtros.

**Por qué importa acá**: el From puede falsificarse porque SMTP nació sin auth. SPF/DKIM/DMARC son la corrección moderna, pero requieren que el dominio víctima los publique y que el receptor los valide.

### MX records de tu empresa
Configurás un servidor de mail para tu PyME. En el DNS de empresa.com.ar agregás MX con prioridad: `mx1.empresa.com.ar` con prio 10, `mx2.empresa.com.ar` con prio 20 (backup). Cuando alguien manda mail, los MTAs intentan mx1 primero; si está caído, caen a mx2. Si ambos fallan, encolan y reintentan cada minuto durante 4-5 días.

**Por qué importa acá**: muestra cómo MX records + DNS + SMTP convergen en operación real. El sistema email es **best effort** con reintentos persistentes — por eso un mail nunca se "pierde", aunque puede demorar.

## Conexiones

- Se conecta con **DNS** porque los MX records son la base del ruteo de mail.
- Relaciona con **TCP** porque SMTP, POP3, IMAP corren sobre TCP (necesitan fiabilidad).
- Vincula con **seguridad y criptografía**: TLS (STARTTLS) cifra el transporte; DKIM firma con criptografía asimétrica; PGP/S/MIME cifran el contenido end-to-end.
- Se conecta con **firma digital y PKI**: DKIM usa pares clave-pública/privada y publica la pública en DNS, similar conceptualmente a certificados X.509.
