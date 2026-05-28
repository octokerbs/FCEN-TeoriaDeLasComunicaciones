---
slug: modelo-osi
title: Modelo OSI y comparación con TCP/IP
category: arquitectura
order: 4
diagrams: [OSIModel]
---

## Por qué importa

Las redes son complejas. Si tuvieras que diseñar un protocolo que maneje todo (bits, errores, routing, sesiones, formato, aplicación) sería inmantenible. **OSI propone dividir el problema en capas independientes**: cada una resuelve una parte y le ofrece servicios a la de arriba. Esto es **modularidad pura**: podés cambiar el cable sin tocar HTTP, podés cambiar IP por IPv6 sin reescribir tu navegador.

Aunque OSI como protocolo concreto fracasó frente a TCP/IP, su **modelo conceptual** es la lingua franca de las redes: cuando alguien dice "capa 7" o "switch de capa 2", está hablando de OSI.

## Intuición

Pensá en mandar una carta internacional:

1. Vos escribís el contenido (capa de aplicación).
2. Lo metés en un sobre con remitente y destinatario (sesión + presentación).
3. El correo nacional lo lleva al avión (transporte).
4. La aerolínea decide la ruta entre países (red).
5. Cada avión vuela entre dos aeropuertos específicos (enlace).
6. El avión es un objeto físico moviéndose por el aire (físico).

Cada actor solo entiende su capa: el piloto no lee tu carta, vos no sabés a qué altura vuela el avión. Eso es **abstracción por capas**.

## Las 7 capas de OSI

| # | Capa | Función | PDU |
|---|------|---------|-----|
| 7 | Aplicación | Servicios al usuario final (HTTP, SMTP, DNS) | Mensaje / Datos |
| 6 | Presentación | Formato, encriptación, compresión (TLS, JPEG) | Datos |
| 5 | Sesión | Diálogo entre apps, sincronización (RPC, NetBIOS) | Datos |
| 4 | Transporte | Comunicación host-a-host, fiabilidad (TCP, UDP) | Segmento / Datagrama |
| 3 | Red | Direccionamiento global, ruteo entre redes (IP, ICMP) | Paquete / Datagrama |
| 2 | Enlace | Comunicación nodo-a-nodo, control errores (Ethernet, PPP) | Frame |
| 1 | Físico | Transmisión de bits por el medio (cables, radio, fibra) | Bit |

**Truco mnemotécnico (de abajo arriba):** "**F**ísico **E**nlace **R**ed **T**ransporte **S**esión **P**resentación **A**plicación" → "**F**eliz **E**n **R**ed, **T**odos **S**aben **P**roducir **A**rte".

## Diagrama

{{diagram: OSIModel}}

El diagrama muestra las 7 capas como pila. La comunicación es **vertical** dentro de un host (cada capa habla con la inmediatamente superior/inferior) y **lógicamente horizontal** entre hosts (cada capa "conversa" con su par en el otro extremo, aunque físicamente solo viaja por la capa 1).

## Funciones de cada capa, en detalle

**Capa 1 - Física.** Define voltajes, conectores, modulación, codificación de línea. RS-232, 100BASE-TX, fibra. La unidad es el **bit**.

**Capa 2 - Enlace de datos.** Agrupa bits en **frames**, detecta errores (CRC), controla el flujo entre nodos vecinos, gestiona acceso al medio compartido (MAC sub-layer). Ejemplos: Ethernet, Wi-Fi (802.11), PPP, HDLC. Aquí viven las **direcciones MAC**.

**Capa 3 - Red.** Direccionamiento **global** (IP), ruteo (RIP, OSPF, BGP), fragmentación. Mueve **paquetes** entre redes distintas. Aquí están los **routers**.

**Capa 4 - Transporte.** Comunicación **host-a-host** (end-to-end), demultiplexa por **puertos** hacia procesos. TCP da fiabilidad, ventana, control de congestión. UDP solo demultiplexa.

**Capa 5 - Sesión.** Inicia, mantiene y cierra sesiones lógicas entre apps. Checkpoints, recuperación. En la práctica, fagocitada por TCP/TLS.

**Capa 6 - Presentación.** Traduce formatos: ASCII/EBCDIC, big/little endian, JSON, XML. Aquí van **encriptación** y **compresión**.

**Capa 7 - Aplicación.** Protocolos de aplicación: HTTP, FTP, SMTP, DNS, SSH. Lo que ve el usuario (o el programador) directamente.

## Encapsulamiento

A medida que los datos bajan por la pila, **cada capa agrega su propio header** (y a veces trailer). Al subir en el receptor, cada capa retira el suyo.

```
Aplicación:      [    Datos    ]
Transporte:      [TH| Datos    ]    (segmento)
Red:             [IH|TH| Datos ]    (paquete)
Enlace:          [EH|IH|TH| Datos |ET]  (frame)
Físico:          0101010101010101...    (bits)
```

Cada header agrega overhead. Por eso el "payload útil" es menor que el MTU.

## OSI vs TCP/IP

| OSI | TCP/IP |
|-----|--------|
| 7. Aplicación | 4. Aplicación (HTTP, DNS, SMTP, ...) |
| 6. Presentación | (incluida en aplicación) |
| 5. Sesión | (incluida en aplicación) |
| 4. Transporte | 3. Transporte (TCP, UDP) |
| 3. Red | 2. Internet (IP, ICMP) |
| 2. Enlace | 1. Acceso a red (Ethernet, Wi-Fi, PPP) |
| 1. Físico | (incluida en acceso a red) |

**Diferencias clave:**

- TCP/IP fusiona 5-6-7 en una sola "aplicación" y 1-2 en "acceso a red". Es más pragmático.
- OSI fue diseñado en comité antes de la implementación; TCP/IP nació de implementaciones reales (ARPANET).
- OSI distingue rigurosamente **servicios** (qué) de **protocolos** (cómo); TCP/IP es más laxo.
- En la práctica, hablamos en OSI pero implementamos TCP/IP.

## Node-to-node vs end-to-end

- **Node-to-node (capa 2):** entre dos nodos directamente conectados. El control de errores y flujo se hace **salto a salto**. Cada router termina la capa 2 y la regenera para el siguiente enlace.
- **End-to-end (capa 4):** entre los dos extremos finales de la comunicación. TCP garantiza fiabilidad end-to-end, sin importar cuántos saltos haya en el medio. Los routers intermedios no tocan la capa 4.

Este es un punto sutil pero crítico. **El "argumento end-to-end"** (Saltzer 1984) dice: las funciones que requieren conocer ambos extremos solo deben implementarse en los extremos, no en intermedios.

## Casos clave / Ejemplos

**Ejemplo 1: traceroute.** Manda paquetes con TTL creciente. Cada router que decrementa TTL a 0 responde ICMP. Esto funciona porque el TTL es de **capa 3** (red) y todos los routers lo procesan; pero los datos viajan en distintos frames de **capa 2** en cada salto.

**Ejemplo 2: navegar a una web.** El navegador (capa 7) genera HTTP. TLS (capa 6/4-en-la-práctica) lo cifra. TCP (capa 4) lo segmenta y maneja ACKs. IP (capa 3) le pone direcciones. Ethernet (capa 2) lo encapsula. El cable (capa 1) lo transmite. En el servidor, todo el proceso ocurre al revés.

**Ejemplo 3: un switch.** Trabaja en **capa 2**: lee direcciones MAC y reenvía frames. No mira IP. Por eso un switch no rutea entre redes.

## Errores frecuentes

- Pensar que cada router "sube" hasta capa 7. **No.** Un router L3 solo sube a capa 3, decide ruta, y vuelve a bajar. Un firewall stateful sí puede subir más.
- Confundir **encapsulamiento** con **conversión de protocolo**. Encapsular es envolver; convertir es cambiar el formato (ej: NAT).
- Pensar que TCP/IP no tiene capa de presentación. Existe, pero está distribuida en las aplicaciones (cada una hace su propio JSON/binario/TLS).
- Olvidar que las **MAC son de capa 2** (locales) y las **IP son de capa 3** (globales).
- Creer que el modelo OSI es un protocolo. Es un **modelo de referencia**: una forma de organizar el diseño, no una pila de protocolos implementada masivamente.

## Pregunta-trampa típica

> "Si un host está en una LAN, ¿necesita capa 3 para hablar con su vecino?"

Sí. Aunque físicamente sean dos cables del mismo switch, **IP siempre se usa** salvo en protocolos no-IP (como ARP, que es justamente capa 2/3 mezclados). ARP traduce IP a MAC para que la capa 2 sepa a quién mandar.

> "¿Por qué TLS está en capa 6 según el modelo pero en la práctica entre 4 y 7?"

Porque OSI lo categoriza por **función** (presentación = formato/cifrado), pero TLS se **implementa** como una librería sobre TCP que las aplicaciones invocan. En modelos pragmáticos se dice "capa 5/6" o simplemente "session/presentation".

## Énfasis del docente (Righetti)

- **Cita histórica obligatoria**: ISO publica en **Mayo 1983** el documento *ISO 7498: The Basic Reference Model for Open Systems Interconnection*. **Hubert Zimmermann (1980)** es la otra referencia que el docente menciona en clase. Citarlos en el oral suma.

- **Contexto de aparición**: en los 80 coexistían múltiples redes globales (BITNET, XEROX, DECNET, ARPANET, CSNET, MILNET, UUCP, etc.). Righetti se apoya en el survey de **Quarterman & Hoskins (1986)** *Notable computer networks*. OSI nace como intento de **arquitectura única**.

- **Tres tipos de comunicación** que pide tener claros:
  - **Layer-to-layer**: entre capas adyacentes dentro de un mismo host (interface vertical).
  - **Peer-layer**: lógica horizontal — la capa N de un host con la capa N del otro (vía protocolo).
  - **Node-to-node**: nodos intermedios participan solo en capas 1-3 (físico, enlace, red).

- **¿Por qué se impuso TCP/IP a OSI?** Pregunta filosófica que a veces tira en el oral. Recomienda leer:
  - *OSI: The Internet That Wasn't*, IEEE Spectrum.
  - El docente disfruta cuando el alumno arma el argumento: TCP/IP fue **implementado primero** (BSD Sockets, UNIX free), más simple, suficiente para resolver el problema real. OSI era más elegante pero llegó tarde y demasiado formalizado.

- **Mitos urbanos** que le gusta desbancar: *"Internet no es producto de la guerra fría"*, *"no nació solo por hackers"*. Le encanta cuando los alumnos no reproducen estos clichés.

- **Anécdota histórica** que cita: Internet "nació con una falla" el **29 de octubre de 1969 en UCLA** — Leonard Kleinrock intentó enviar "LOGIN" al SRI y solo llegaron las dos primeras letras "LO" antes de que el sistema se cayera. La recomienda ver en el documental *Lo and Behold* de Werner Herzog (2016).

- **Modelo OSI vs TCP/IP**: en la práctica usamos **TCP/IP de 4 capas**, donde Sesión + Presentación + Aplicación de OSI se colapsan en una sola "Aplicación". Las diapos lo muestran lado a lado y el docente espera que en el oral expliques **por qué** TCP/IP fusiona, no solo que lo hace.

- **Encapsulamiento** (concepto eje): cada capa agrega su propio header al PDU de la capa superior. Las unidades de datos por capa: bits (física), frame (enlace), datagrama/paquete (red), segmento (transporte), mensaje (aplicación). Esto cae prácticamente en todos los finales.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Abrir google.com en el navegador
Tipeás "google.com" y le das Enter. Capa 7 (HTTP) arma el `GET /`. Capa 6/4 (TLS) lo cifra. Capa 4 (TCP) lo segmenta en pedazos de ~1460 bytes y abre conexión al puerto 443. Capa 3 (IP) le pone como destino 142.250.x.x. Capa 2 (Ethernet/Wi-Fi) lo encapsula con la MAC de tu router. Capa 1 lo manda como pulsos eléctricos por el cable o como ondas a 2.4/5 GHz.

**Por qué importa acá**: en menos de 100 ms cada paquete recorre las 7 capas dos veces (bajada en cliente, subida en servidor, vuelta). Cada capa solo entiende su header — el router de Google no abre HTTP, el switch de tu casa no mira IP.

### Diagnosticar Wi-Fi caído
La página no carga. ¿Qué capa falla? Si no tenés señal Wi-Fi, capa 1 (físico). Si tenés señal pero no IP, capa 2/3 (el DHCP falló). Si tenés IP pero `ping 8.8.8.8` no funciona, capa 3 (ruteo). Si pingea pero `curl google.com` falla, capa 7 (DNS o HTTP). Por eso los técnicos siempre debuggean "de abajo hacia arriba".

**Por qué importa acá**: la separación en capas hace que cada problema sea independiente. Podés cambiar el cable Ethernet sin reinstalar Chrome.

### Switch del laboratorio vs router de casa
El switch barato del aula de la facultad solo lee MACs (capa 2). Por eso si conectás dos subnets distintas a sus puertos, no se ven. El router de tu casa hace ambas cosas: es switch (capa 2) en la LAN interna, y router (capa 3) hacia el ISP, haciendo NAT entre tu 192.168.1.0/24 y la IP pública.

**Por qué importa acá**: las cajitas físicas no son una capa única — son combinaciones. Un "router hogareño" típico hace L1+L2+L3+L4 (NAT) + L7 (DNS forwarder).

## Conexiones

- Se conecta con **todos los demás temas**: cada protocolo del programa (TCP, IP, Ethernet, DNS, HTTP) vive en una capa específica.
- Sirve para entender por qué los **principios de diseño** son distintos en cada nivel (control de errores hop-by-hop vs end-to-end).
- Relaciona con **seguridad**: distintos ataques operan en distintas capas (ARP poisoning = 2, IP spoofing = 3, hijacking = 4, phishing = 7).
