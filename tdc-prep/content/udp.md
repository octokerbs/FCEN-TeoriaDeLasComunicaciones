---
slug: udp
title: UDP - transporte sin estado
category: transporte
order: 12
diagrams: []
---

## Por qué importa

No siempre necesitás todas las garantías que da TCP. A veces el handshake, los ACKs, el ordenamiento y los timers son **overhead innecesario** que mata la latencia. Para esos casos existe **UDP**: una capa mínima sobre IP que solo agrega **puertos** y un **checksum opcional**. Nada más.

UDP es el transporte invisible detrás de muchos servicios cotidianos: DNS, NTP, streaming en vivo, juegos online, voz sobre IP. Entender cuándo conviene UDP y cuándo no es esencial para diseñar bien aplicaciones de red.

## Intuición

TCP es un envío certificado: paga más, lleva más tiempo, pero tenés garantía de entrega y orden. UDP es una postal arrojada por la ventana: rápido, barato, sin garantías. **A veces lo que querés es justamente eso**: una postal por minuto, y si una se pierde, no importa porque ya viene la siguiente.

Si una consulta DNS se pierde, la app pregunta de nuevo en un milisegundo, sin necesidad de retransmisión automática. Si un frame de video en vivo se pierde, no querés esperar: querés el frame siguiente.

## Cuándo usar UDP

UDP conviene cuando:

- **Mensajes cortos, autocontenidos:** una consulta DNS cabe en un solo paquete. ¿Para qué abrir conexión?
- **Latencia crítica:** juegos en tiempo real, voz, video conferencia. El handshake de TCP agrega RTTs que no querés.
- **Tolerancia a pérdida:** streaming, telemetría. Mejor perder un sample que detener todo para retransmitir.
- **Multicast / broadcast:** TCP es punto a punto; UDP se puede mandar a múltiples destinos.
- **Mensajes idempotentes:** si una pérdida se resuelve con un retry de aplicación, no necesitás TCP.

UDP **no** conviene cuando:

- Necesitás **fiabilidad** sin reinventarla a mano.
- Los datos son **grandes** (no caben en un paquete) y querés ordenamiento.
- El emisor produce muy rápido y el receptor lento (necesitás control de flujo).
- La red está congestionada y un protocolo bien educado debe bajar el ritmo (UDP es agresivo por defecto).

## Demultiplexación por puertos

UDP, al igual que TCP, usa **puertos** para entregar al proceso correcto. El kernel recibe un paquete UDP, mira el puerto destino, y se lo entrega al proceso que tiene un socket en ese puerto. La identificación es:

$$(\textcolor{#a5c8f4}{\text{IP destino}},\ \textcolor{#a5c8f4}{\text{puerto destino}})$$

Notá que **no incluye la fuente**, a diferencia de TCP. Esto hace que un solo socket UDP pueda recibir de múltiples clientes (típico en servidores DNS). En TCP, cada cliente tiene su propio socket porque la tupla incluye origen.

**Rangos de puertos:**

- **0-1023:** well-known (DNS=53, NTP=123, DHCP=67/68, SNMP=161).
- **1024-49151:** registered.
- **49152-65535:** dinámicos / efímeros (los que asigna el sistema a clientes).

## Segmento UDP

Header de **8 bytes** y listo. Mucho más simple que TCP (mínimo 20 bytes).

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Source Port           |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Length             |           Checksum            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         Data...                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

Campos:

- **Source Port:** opcional (puede ser 0 si no esperás respuesta).
- **Destination Port:** obligatorio.
- **Length:** longitud del datagrama UDP completo (header + datos), en bytes.
- **Checksum:** opcional en IPv4, obligatorio en IPv6. Cubre header + datos + **pseudo-header**.

## Pseudo-header en el checksum

El checksum UDP no se calcula solo sobre el segmento: incluye un **pseudo-header** con datos de IP:

```
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source IP Address                       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination IP Address                     |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Zeros     | Protocol (17) |        UDP Length             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Por qué:** detectar errores donde un router corrompe la IP destino. Si el destino verifica el checksum y las IPs originales no calzan con las que recibió, descarta. Es una violación leve del principio de capas (UDP "mira" IP) pero protege contra entregas mal direccionadas.

TCP también usa pseudo-header por la misma razón.

## Casos de uso típicos

### DNS query

```
Cliente: paquete UDP con la pregunta "¿IP de google.com?" → server:53
Server:  paquete UDP con la respuesta "142.250.x.y" → cliente
```

Una consulta y una respuesta. Si se pierde la query, el cliente reintenta. **TCP sería overkill**: 3 paquetes solo de handshake, otros 4 para cerrar, total 7-8 paquetes en lugar de 2. DNS sí cae a TCP si la respuesta no cabe en 512 bytes (zonas grandes, DNSSEC).

### Streaming de video en vivo

Cada frame es un paquete UDP. Si llega tarde, descartar; el frame siguiente ya es más relevante. Protocolos como RTP corren sobre UDP. La aplicación maneja jitter (buffer pequeño), pérdidas (interpolación), y se permite saltarse muestras.

### Juegos online

Un FPS manda 60 estados/segundo. Si un paquete se pierde, no importa: el siguiente (16 ms después) ya tiene el estado actualizado. **TCP introduciría head-of-line blocking**: si un paquete viejo se retransmite, los nuevos esperan hasta que llegue, aunque ya sean irrelevantes.

### NTP / SNTP

Sincronización horaria: el protocolo manda un paquete pidiendo timestamps, el server responde. Si se pierde, reintentás. Latencia mínima crítica para precisión.

### DHCP

Inicial cuando el host **no tiene IP**: cómo abriría TCP sin IP? UDP broadcast inicial, fiabilidad por reintentos.

### SNMP

Polling de monitoreo. Si una respuesta no llega, la próxima vuelta de polling. Bajo overhead, simple.

### QUIC (excepción notable)

Google diseñó QUIC encima de UDP **para reemplazar TCP+TLS** en HTTP/3. Resuelve sus propias fiabilidades arriba. La razón: UDP cruza middleboxes (NATs, firewalls) más libremente que protocolos nuevos a nivel transporte, y al estar en user-space, evolutiona más rápido que TCP (que vive en el kernel).

## Casos clave / Ejemplos

**Ejemplo 1: DNS comparado con TCP.** Resolver `example.com`:

- **UDP:** cliente manda 1 paquete (~50 bytes), server responde 1 paquete (~100 bytes). Total: 2 paquetes, 1 RTT.
- **TCP:** handshake (3 paquetes), query (1), response (1), cierre (4). Total: 9 paquetes, 3 RTTs. **El handshake duplica el tiempo de respuesta del DNS.**

**Ejemplo 2: streaming.** Video a 30 fps, cada frame de 50 KB:

- **UDP/RTP:** 30 paquetes/seg (o varios por frame si fragmentás). Pérdida del 1% = un frame degradado, imperceptible.
- **TCP:** ante pérdida, retransmite. Mientras se retransmite, los frames nuevos quedan en buffer del kernel, generando "buffer bloat" y stuttering.

**Ejemplo 3: DHCP discover.** El cliente no tiene IP. Manda broadcast UDP a 255.255.255.255 desde 0.0.0.0:68 hacia 255.255.255.255:67. **Imposible con TCP** porque TCP es punto a punto.

## Errores frecuentes

- Pensar que UDP es "TCP pero malo". Son **distintas herramientas para distintos problemas**. Comparar es como decir que una bicicleta es "un auto malo".
- Olvidar implementar fiabilidad en aplicación cuando se necesita. UDP no avisa de pérdidas; tu app debe inferirlas (por timeout, secuencias).
- Suponer que UDP no se fragmenta. Sí: si el paquete UDP supera la MTU, IP fragmenta. Ahí perdés una "ventaja" de UDP (1 paquete por mensaje) si tu mensaje es grande.
- Pensar que el checksum UDP es opcional siempre. En IPv6 es **obligatorio**.
- Olvidar el pseudo-header al calcular checksum manualmente. Es un error clásico en parciales.
- Suponer que UDP no consume recursos. El kernel mantiene cola de paquetes por socket; si se llena, **se descartan** silenciosamente.

## Pregunta-trampa típica

> "¿Por qué DNS usa UDP si las pérdidas son posibles?"

Porque las consultas DNS son **pequeñas, frecuentes y sin estado**, y el RTT es lo que más importa. Si se pierde una consulta, el cliente reintenta a los pocos ms. Si DNS usara TCP, agregaría 1-2 RTTs adicionales **a cada consulta**, lo que para un navegador que resuelve 30 dominios al cargar una página es inaceptable. Para respuestas grandes (DNSSEC, zone transfers), DNS sí cae a TCP.

> "Si UDP no tiene fiabilidad, ¿cómo se asegura una app real con UDP?"

La aplicación implementa lo que necesita: número de secuencia, ACKs, timeouts, **pero solo para lo que necesita**. RTP, QUIC, HTTP/3, GameNet, etc., son ejemplos. Es **flexibilidad**: no te obligo a pagar lo que no usás.

> "¿UDP tiene control de congestión?"

No por sí mismo. Una app UDP puede inundar la red. Por eso TCP "se porta bien" y UDP puede "abusar". Los buenos protocolos UDP (QUIC, WebRTC) **implementan su propio control de congestión** voluntariamente para coexistir con TCP en internet.

## Énfasis del docente (Righetti)

UDP recibe poca atención propia en las diapos — el docente lo trata como contraste de TCP. Aun así estos puntos suelen aparecer.

- **Slogan que Righetti repite**: *"UDP = Servicio **sin conexión**"*. Subraya las dos palabras. Lo opone a TCP "orientado a conexión, full-duplex, confiable".

- **Función mínima que destaca**: *"Multiplexación mediante puertos"*. Subraya que UDP **solo agrega esto** sobre IP. Si la pregunta es "¿qué le aporta UDP a IP?", la respuesta es: demultiplexación por puerto + (opcional) checksum sobre datos + pseudo-header.

- **Ejemplo canónico que pone**: *"Transporte UDP + Aplicación RTP"*. Real-Time Transport Protocol sobre UDP es el caso de uso emblemático para él: streaming, VoIP, videoconferencia. La razón siempre la misma: **no podemos esperar retransmisiones cuando llega tarde no sirve**.

- **Pseudo-header en checksum**: lo pregunta para distinguir UDP de protocolos más triviales. El checksum cubre header UDP + datos + un **pseudo-header IP** (src IP, dst IP, protocol, length). El pseudo-header **no se transmite**, se reconstruye en el receptor. Sirve para detectar paquetes IP entregados al protocolo equivocado.

- **DNS sobre UDP** es la primera asociación que hace en clase. La pregunta clásica: *"¿por qué DNS usa UDP?"*. Respuesta esperada: consulta-respuesta corta, una sola transacción, el costo de un 3-way handshake TCP sería mayor que la consulta misma. **DNS sobre TCP** existe para transferencia de zona y respuestas grandes (>512 bytes).

- **Tráfico egoísta**: ojo con esto. La frase del docente *"UDP no tiene control de congestión"* se conecta directamente con su teórica de congestión. **En el oral, si decís que UDP es libre sin mencionar que es responsabilidad del programador no saturar la red, te lo va a marcar**. Las apps que usan UDP en serio (QUIC, WebRTC) implementan su propio control TCP-friendly.

- **Encuadre que no menciona pero asume**: UDP es la base de protocolos donde la aplicación reconstruye la confiabilidad si la necesita (QUIC, RTP, DNS) o donde directamente no se necesita. No es "TCP roto"; es la decisión consciente de no pagar el overhead.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Llamada de Zoom de Buenos Aires a Tokio
Hacés una videollamada con un colega en Tokio. RTT real ~250 ms. La voz va por UDP/RTP. Cada paquete lleva 20-40 ms de audio. Si uno se pierde en el camino, **NO** se retransmite — sería inútil porque cuando llegara ya pasó el momento de reproducirlo. Zoom interpola con el frame siguiente y nadie se entera. Si fuera por TCP, escucharías "freezes" cuando hay pérdidas.

**Por qué importa acá**: muestra exactamente por qué UDP existe. La frase del docente: "no podemos esperar retransmisiones cuando llega tarde no sirve". Voz en tiempo real es el caso canónico.

### Abrir cualquier sitio web (DNS antes del HTTP)
Antes de cargar mercadolibre.com, tu PC manda paquete UDP al puerto 53 de tu DNS server (8.8.8.8 o el del ISP). Solo 50 bytes de pregunta, 100 bytes de respuesta, 1 RTT. Si fuera TCP serían 9 paquetes y 3 RTTs antes siquiera de poder pedir HTML. Por eso DNS sobre UDP es invisible pero crítico — pasa decenas de veces al cargar una sola página.

**Por qué importa acá**: DNS es el ejemplo canónico de Righetti. Latencia crítica, mensajes cortos, retry idempotente — UDP gana en todos los criterios.

### Fortnite/CS desde tu PC
En CS:GO el servidor manda 64 estados/seg del juego. Cada estado es ~1 KB UDP. Si uno se pierde en una mala señal, el próximo viene 16 ms después con el estado actualizado — no necesitás el viejo. Si fuera TCP habría head-of-line blocking: cuando se retransmite el paquete viejo, los nuevos esperan en el buffer aunque ya no sirvan. Resultado: "rubber-banding".

**Por qué importa acá**: para juegos en tiempo real, retransmitir es peor que perder. UDP permite "skipping forward". TCP es robusto pero introduce delays inaceptables para gameplay.

## Conexiones

- Se conecta con **TCP** por contraste: ambas son capa transporte, soluciones opuestas al mismo problema.
- Sirve como base de **DNS** (tema siguiente práctico) y muchos protocolos de aplicación.
- Relaciona con **congestión** porque UDP, sin control, puede colapsar la red. La buena ciudadanía es responsabilidad del programador.
- Vincula con **NAT**: UDP es más difícil para NAT (no hay "conexión" estable), requiere hole punching y técnicas como STUN.
