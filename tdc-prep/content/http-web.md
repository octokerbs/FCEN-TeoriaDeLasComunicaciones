---
slug: http-web
title: HTTP y la Web
category: aplicacion
order: 15
diagrams: []
---

## Por qué importa

HTTP es **el** protocolo que sostiene la web. Cada vez que cargás una página, llamás una API, hacés clic en un enlace, ves un video en YouTube, hay HTTP por detrás. Diseñado a principios de los 90, simple, basado en texto, sin estado: esos principios lo hicieron infinitamente extensible y permitieron que la web creciera de un puñado de páginas a un universo de aplicaciones.

Entender HTTP es entender cómo funcionan los navegadores, las APIs REST, los sitios modernos. Es la base para temas como caching, seguridad web, CDNs, y el rendimiento percibido por usuarios.

## Intuición

Pensá en HTTP como un sistema de **pedidos por correo**:

- Vos mandás una carta: "quiero el catálogo de productos" (GET /productos).
- El proveedor responde con el catálogo o "no tengo" (200, 404).
- Cada carta es independiente: el proveedor no recuerda tu última carta a menos que vos se lo recuerdes (cookies).

Esa simplicidad **stateless** es lo que hace a HTTP escalar: cualquier servidor puede responder a cualquier solicitud sin saber el historial.

## Cliente-servidor

HTTP es asimétrico:

- **Cliente:** el navegador o cualquier app que inicia conexiones. Manda **requests**.
- **Servidor:** escucha en un puerto (80 por defecto, 443 con TLS) y responde. Manda **responses**.

Un cliente puede hacer cientos de requests para cargar una sola página (HTML, CSS, JS, imágenes, fuentes, API calls). Los servidores son muchos: web servers (Nginx, Apache), application servers (Node.js, Python), CDNs.

## URLs y objetos

Una URL identifica un recurso:

```
https://www.empresa.com:8080/productos/123?destacar=true#detalle
└─┬─┘   └────────┬───────┘ └┬┘ └─────┬────┘ └──────┬───┘ └──┬──┘
  ↓             ↓            ↓        ↓             ↓        ↓
esquema        host        puerto    path         query   fragment
```

- **Esquema:** `http`, `https`, `ftp`, `ws`. Define el protocolo.
- **Host:** dominio o IP del servidor.
- **Puerto:** opcional, default según esquema (80 HTTP, 443 HTTPS).
- **Path:** identifica el recurso en el servidor.
- **Query string:** parámetros adicionales en formato `clave=valor&clave2=valor2`.
- **Fragment:** después de `#`, solo del lado del cliente (no se manda al server).

Un **recurso** o **objeto** es lo identificado por una URL: una página HTML, una imagen, un JSON, etc.

## Formato de un request

```
GET /productos/123 HTTP/1.1
Host: www.empresa.com
User-Agent: Mozilla/5.0
Accept: text/html,application/xhtml+xml
Accept-Language: es-AR,es;q=0.9
Cookie: sessionid=abc123
Connection: keep-alive

<body opcional, para POST/PUT>
```

Estructura:

- **Línea de request:** método, path, versión HTTP.
- **Headers:** clave-valor, uno por línea. Terminan con línea en blanco.
- **Body:** opcional, datos en POST, PUT, PATCH.

## Métodos HTTP

| Método | Idempotente | Cacheable | Cuerpo | Propósito |
|--------|-------------|-----------|--------|-----------|
| **GET** | Sí | Sí | No | Pedir un recurso. Solo lectura. |
| **POST** | No | A veces | Sí | Crear / enviar datos. Acciones que cambian estado. |
| **PUT** | Sí | No | Sí | Reemplazar un recurso. |
| **DELETE** | Sí | No | No | Borrar un recurso. |
| **HEAD** | Sí | Sí | No | Como GET pero sin body. Útil para metadata. |
| **OPTIONS** | Sí | No | No | Pregunta qué métodos soporta el server (CORS preflight). |
| **PATCH** | No | No | Sí | Modificación parcial. |

**Idempotente** significa que mandar la misma request muchas veces tiene el mismo efecto que mandarla una. POST no es idempotente (cada POST crea un recurso nuevo); GET, PUT, DELETE sí lo son (sus efectos no se acumulan).

## Códigos de respuesta

Tres dígitos, primer dígito = familia:

### 1xx - Informativos

- **100 Continue:** "seguí mandando el body" (usado con `Expect: 100-continue`).
- **101 Switching Protocols:** cambio de protocolo (WebSocket upgrade).

### 2xx - Éxito

- **200 OK:** todo bien, respuesta en el body.
- **201 Created:** recurso creado (típico tras POST).
- **204 No Content:** OK pero sin body. Típico de DELETE.
- **206 Partial Content:** respuesta parcial (Range requests, descargas con reanudación).

### 3xx - Redirección

- **301 Moved Permanently:** el recurso cambió de URL. Caché el redireccionamiento.
- **302 Found:** redirección temporal.
- **304 Not Modified:** "no cambió desde la última vez", usar caché del cliente.
- **307 Temporary Redirect / 308 Permanent Redirect:** como 301/302 pero preservando método.

### 4xx - Error del cliente

- **400 Bad Request:** request malformada.
- **401 Unauthorized:** falta autenticación (el cliente debe loguearse).
- **403 Forbidden:** autenticado pero sin permisos.
- **404 Not Found:** recurso no existe.
- **405 Method Not Allowed:** el recurso existe pero no acepta ese método.
- **409 Conflict:** estado actual incompatible con la operación.
- **429 Too Many Requests:** rate limiting.

### 5xx - Error del servidor

- **500 Internal Server Error:** falló del lado server, sin más detalles.
- **502 Bad Gateway:** un proxy intermedio recibió respuesta inválida del backend.
- **503 Service Unavailable:** servidor sobrecargado o en mantenimiento.
- **504 Gateway Timeout:** un proxy no recibió respuesta a tiempo del backend.

## Formato de una respuesta

```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 1234
Cache-Control: max-age=3600
Set-Cookie: sessionid=abc123; HttpOnly

<html>...</html>
```

Estructura paralela a la request: línea de estado, headers, body.

## Conexiones persistentes (HTTP/1.0 vs 1.1)

### HTTP/1.0 (1996)

**Una conexión TCP por request.** Pedís imagen.png, abrís TCP, pedís, recibís, cerrás. Pedís otra imagen, otra TCP. **Muy ineficiente**: cada conexión paga handshake (1 RTT) y slow start.

### HTTP/1.1 (1997)

**Keep-alive (persistente) por default.** La misma conexión TCP se reutiliza para múltiples requests. Solo un handshake por host. Header `Connection: keep-alive` (implícito).

### Pipelining (HTTP/1.1)

Mandar varias requests sin esperar respuesta. El server responde en orden. **Problema: head-of-line blocking**: si la primera respuesta tarda, las demás esperan. Por eso pipelining se usó poco en la práctica.

### HTTP/2 (2015)

**Multiplexación de streams** en una conexión. Múltiples requests/responses concurrentes sin HoL en HTTP layer (sigue habiendo en TCP layer). Binary framing, header compression (HPACK), server push.

### HTTP/3 (2022)

Sobre **QUIC** (que está sobre UDP). Elimina HoL de TCP, multiplexa streams independientes, handshake más rápido (0-RTT en reconexiones). Adoptado masivamente.

## Cookies

HTTP es **stateless**: ¿cómo recordar que el usuario está logueado? **Cookies**: el servidor manda un header `Set-Cookie` con datos, el cliente lo guarda y lo manda en cada request al mismo dominio.

```
Server: Set-Cookie: sessionid=abc123; Domain=empresa.com; Path=/; Expires=...; Secure; HttpOnly; SameSite=Strict
Cliente: Cookie: sessionid=abc123
```

Atributos importantes:

- **Domain, Path:** alcance.
- **Expires / Max-Age:** persistencia.
- **Secure:** solo en HTTPS.
- **HttpOnly:** no accesible desde JavaScript (protege contra XSS robando cookies).
- **SameSite:** Strict / Lax / None. Controla envío en cross-site requests (protege contra CSRF).

## RTT y performance

Cada carga de página implica muchos RTTs:

- DNS: 1 RTT.
- TCP handshake: 1 RTT.
- TLS handshake: 1-2 RTTs.
- Primera request: 1 RTT.
- Recursos secundarios (CSS, JS, imágenes): más RTTs (paralelizados).

**Ejemplo:** página con 30 recursos, RTT = 100 ms.

- HTTP/1.0: 30 conexiones x 4 RTTs cada una = 12 segundos.
- HTTP/1.1 keep-alive: 1 conexión, 30 requests secuenciales = 3 segundos (más, si pipelining off).
- HTTP/2 multiplexado: ~1 segundo, todo concurrente.
- HTTP/3 con 0-RTT reconnect: subsegundo.

Optimizaciones clásicas:

- **CDN:** acerca recursos al usuario (RTT menor).
- **Caching agresivo:** evitar ir al server.
- **Bundling y minificación:** menos requests, menos bytes.
- **Compression (gzip, brotli):** transferir menos bytes.
- **HTTP/2 push, prefetch, preload:** anticipar recursos.

## Casos clave / Ejemplos

**Ejemplo 1: navegación típica.** Visitás `https://news.com`:

1. Resolución DNS de `news.com`.
2. TCP + TLS handshake.
3. GET `/` → 200 OK, HTML.
4. Parser HTML descubre 20 imágenes, 5 scripts, 3 CSS.
5. Múltiples GETs paralelos (HTTP/1.1 abre ~6 conexiones, HTTP/2 multiplexea en una).
6. Algunos retornan 304 Not Modified (cacheados).
7. Página renderizada.

**Ejemplo 2: POST de un form.**

```
POST /login HTTP/1.1
Host: empresa.com
Content-Type: application/x-www-form-urlencoded
Content-Length: 34

usuario=juan&password=secreto123
```

Server responde 302 redirect a `/dashboard` con `Set-Cookie: sessionid=...`. El navegador sigue el redirect mandando ya la cookie.

**Ejemplo 3: caché con ETag.** El cliente tiene en caché una imagen con `ETag: "abc123"`. Manda:

```
GET /logo.png HTTP/1.1
If-None-Match: "abc123"
```

Si no cambió: `304 Not Modified` (sin body, ahorra bandwidth). Si cambió: `200 OK` con la imagen nueva.

## Errores frecuentes

- Pensar que GET puede tener body. Técnicamente sí, pero no estándar; semánticamente, no.
- Confundir 401 con 403. 401 = "no estás autenticado"; 403 = "estás pero no podés".
- Usar 200 OK con `{"error": "..."}`. Es **antipatrón**: si hay error, usá código de error. Salvo APIs que mezclan, pero confunde clientes.
- Cachear POST. **No se cachea por default**; cachear es para GETs idempotentes.
- Olvidar `Content-Length` o `Transfer-Encoding: chunked`. Sin esto, el receptor no sabe dónde termina el body.
- Suponer que HTTPS es solo encriptación. Es **encriptación + autenticación + integridad**: protege contra MitM, sniffing y tampering.

## Pregunta-trampa típica

> "¿Por qué HTTP/1.1 con pipelining no se usa mucho?"

Por **head-of-line blocking**: si la primera respuesta es lenta o se pierde un paquete TCP, las demás esperan. Además, muchos proxies viejos no soportan pipelining bien. HTTP/2 lo resuelve con frames intercalados en streams independientes, pero el HoL persiste a nivel TCP (un paquete TCP perdido bloquea todos los streams). HTTP/3 sobre QUIC resuelve el HoL definitivamente.

> "Si HTTP es stateless, ¿cómo manejan las sesiones?"

Con **cookies**: el server identifica al usuario por un token guardado en el cliente, que se reenvía en cada request. El estado vive del lado server (en una sesión por ID), o totalmente del lado cliente (JWT con datos firmados).

> "¿Qué pasa si el cliente manda Host inválido?"

400 Bad Request. **Host es obligatorio en HTTP/1.1** porque un servidor puede hospedar muchos sitios (virtual hosting) y necesita saber cuál estás pidiendo.

## Énfasis del docente (Righetti)

- **HTTP opera "sin estado"**: lo recalca explícitamente. "El servidor no conserva ninguna información sobre las peticiones previas de clientes". Y subraya: "los protocolos que conservan estado son complicados", porque la historia previa (estado) debe conservarse y si el servidor/cliente se bloquea, las visiones del estado pueden ser **inconsistentes y deben ser recompuestas**.
- **Modelo de tiempo de respuesta**: presta atención a la fórmula `Total = 2*RTT + tiempo de transmisión`. Un RTT para iniciar la conexión TCP + un RTT para la petición HTTP y los primeros bytes de respuesta + tiempo de transmisión del archivo.
- **Conexiones no persistentes vs persistentes**: HTTP/1.0 usa **no persistentes** (un objeto por conexión TCP). HTTP/1.1 usa **persistentes en su modo por defecto**. Distingue:
   - **Persistentes sin entubamiento (pipelining)**: el cliente emite una nueva petición solo tras recibir la anterior. **Un RTT por cada objeto referenciado**.
   - **Persistentes con entubamiento**: por defecto en HTTP/1.1. El cliente hace su petición tan pronto encuentra un objeto referenciado. **Un solo RTT para todos los objetos referenciados**.
- **No persistente requiere 2 RTT por objeto** y el SO debe asignar recursos por cada conexión TCP. Comentario práctico de Righetti: "los navegadores suelen abrir conexiones TCP paralelas para traer los objetos referenciados".
- **Vocabulario textual**: "Una página web consta de **objetos**. Un objeto puede ser un archivo HTML, una imagen JPEG, un applet Java, un archivo de audio, un código Javascript, etc.". Una página = archivo HTML base + objetos referenciados.
- **RFCs**: cita explícitamente `HTTP 1.0: RFC 1945` y `HTTP 1.1: RFC 2068`. Suele caer.
- **Telnet a puerto 80**: enseña a probar HTTP como cliente con `telnet www.eurecom.fr 80` + `GET /~ross/index.html HTTP/1.0`. Buena forma de demostrar que es texto ASCII.
- **Cookies con 4 componentes**: 1) línea de cabecera de cookie en la respuesta, 2) línea de cabecera de cookie en la petición, 3) archivo de cookie en el host del usuario gestionado por el navegador, 4) base de datos de respaldo en el sitio web. Suele dar el ejemplo de Susana visitando un sitio de comercio electrónico por primera vez.
- **Métodos HTTP/1.0 vs HTTP/1.1**: 1.0 tiene GET, POST, HEAD. 1.1 agrega PUT (descarga el archivo en la ruta especificada) y DELETE (borra el archivo en la URL).
- **HEAD**: definición textual: "Pide al servidor que excluya el objeto solicitado de la respuesta. El interés está en la cabecera (metadatos) de la respuesta, para validación".

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Login persistente en Mercado Libre
Te logueás en mercadolibre.com hoy. El server manda `Set-Cookie: sessionid=xyz; Max-Age=2592000; HttpOnly; Secure`. Esa cookie queda en tu navegador 30 días. Cada vez que volvés al sitio, el browser manda automáticamente el header `Cookie: sessionid=xyz` y el server te reconoce. Como `HttpOnly`, ningún script malicioso puede leerla; como `Secure`, solo va por HTTPS.

**Por qué importa acá**: ejemplo claro de cómo cookies suplen el "stateless" de HTTP. Sin cookies, tendrías que loguearte en cada página. Los atributos Secure/HttpOnly/SameSite son la defensa moderna contra XSS y CSRF.

### Twitter cargando un timeline con HTTP/2
Abrís twitter.com. El navegador necesita HTML, ~10 CSS, ~30 JS bundles, ~50 imágenes (avatares + thumbnails), ~10 APIs JSON. Con HTTP/1.1 abriría 6 conexiones en paralelo y procesaría secuencialmente, ~5 segundos. Con HTTP/2: una sola conexión TCP+TLS, todos los recursos multiplexados en streams concurrentes, ~1.5 segundos.

**Por qué importa acá**: multiplexing es el motivo por el que la web moderna es rápida. Resuelve el head-of-line blocking de HTTP/1.1. Es exactamente el contraste que recalca el docente sobre conexiones persistentes.

### Reintentar un POST que falló
Llenás un form de compra, clickeás "Pagar", la conexión se corta justo después de mandar el POST. ¿Volver a clickear o no? Si volvés a clickear, podés crear dos compras (POST no es idempotente). Por eso los e-commerce usan tokens de idempotencia: "primera vez con este token = procesar, segunda vez = devolver mismo resultado".

**Por qué importa acá**: ilustra la diferencia entre métodos idempotentes (GET, PUT, DELETE) y no idempotentes (POST). Esta distinción no es académica: define cómo diseñás APIs robustas a fallas de red.

## Conexiones

- Se conecta con **DNS** (resuelve el host antes de la conexión).
- Corre sobre **TCP** (y QUIC en HTTP/3, que está sobre UDP).
- Sirve de base para casi todas las **APIs modernas** (REST, GraphQL sobre HTTP).
- Relaciona con **TLS y seguridad** (HTTPS, certificate pinning, HSTS).
- Vincula con **caching** (caches del browser, Varnish, CDN: todos hablan HTTP).
