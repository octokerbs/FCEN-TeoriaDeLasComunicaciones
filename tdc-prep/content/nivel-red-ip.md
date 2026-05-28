---
slug: nivel-red-ip
title: Nivel red - IP, fragmentación, NAT, ARP, ICMP
category: red
order: 9
diagrams: [IPHeader, SubnetMask]
---

## Por qué importa

Capa 2 te conecta a tu vecino. Para hablar con cualquiera en el planeta hace falta un nivel **global**, que sepa rutear paquetes entre redes heterogéneas. Eso es **IP**: un protocolo deliberadamente simple, sin estado, sin garantías ("best effort"), que se convirtió en el lenguaje común de internet.

Entender IP es entender por qué internet escala: cada red local es independiente, los routers conectan redes hablando IP, y todo se basa en un esquema de direcciones jerárquico que permite reglas de reenvío compactas.

## Intuición

Pensá en el correo postal. Cada casa tiene una **dirección global** (país, ciudad, calle, número). El cartero local no necesita conocer todas las direcciones del mundo: solo sabe llevar el sobre al **siguiente nodo** (oficina central de su ciudad), que decide la siguiente etapa. Esa jerarquía permite agregar rutas: "todo lo que dice 'Buenos Aires' va por esta avenida".

IP funciona igual: las direcciones tienen una parte de **red** y una de **host**, y los routers solo guardan rutas a redes, no a hosts individuales.

## Internetworking

**Internet** es una red de redes. Cada red individual tiene sus propias reglas de capa 2 (Ethernet, Wi-Fi, PPP, fibra óptica). IP **unifica** este zoo: cualquier nodo puede mandar un paquete IP a cualquier otro, sin importar qué tecnologías intermedias haya.

Los **routers** son las máquinas que pegan redes distintas. Cada router tiene interfaces en al menos dos redes y decide a cuál mandar cada paquete según su tabla de ruteo.

## Datagramas vs circuitos virtuales

Hay dos paradigmas para mover paquetes:

- **Datagramas (sin conexión):** cada paquete viaja independiente, puede tomar rutas distintas, llegar fuera de orden o perderse. **IP es así.** Simple, resiliente, pero sin garantías.
- **Circuitos virtuales (CV):** se establece una "ruta" antes de mandar; todos los paquetes siguen el mismo camino y llegan en orden. Más complejo, requiere estado en routers. **ATM, MPLS, X.25** son ejemplos.

Internet eligió datagramas: hace los routers más simples y la red más robusta frente a fallas. La fiabilidad la pone TCP en los extremos.

## Header IPv4

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version|  IHL  |Type of Service|          Total Length         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Identification        |Flags|      Fragment Offset    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Time to Live |    Protocol   |         Header Checksum       |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source Address                          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination Address                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options                    |    Padding    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

Campos clave:

- **Version:** 4 (IPv4) o 6 (IPv6).
- **IHL:** longitud del header en palabras de 32 bits. Mínimo 5 (20 bytes).
- **Total Length:** longitud total del paquete (header + datos), max 65535 bytes.
- **Identification, Flags, Fragment Offset:** controlan fragmentación.
- **TTL:** Time To Live. Decrementado por cada router. Si llega a 0, el paquete se descarta y se manda ICMP "Time Exceeded".
- **Protocol:** indica el siguiente nivel (TCP=6, UDP=17, ICMP=1).
- **Checksum:** del header solamente. Recalculado en cada salto (porque TTL cambia).
- **Source / Destination Address:** las IPs de origen y destino.

## Diagrama

{{diagram: IPHeader}}

El diagrama desglosa visualmente los campos del header IPv4. Resaltá especialmente TTL (que cambia en cada salto), las flags MF/DF y el offset (que permiten reensamblar fragmentos).

## Fragmentación

Cada enlace tiene una **MTU** máxima. Si un paquete IP es mayor, **el router fragmenta**: divide en pedazos que quepan, cada uno con su propio header IP. Solo el **destino final** reensambla.

Campos involucrados:

- **Identification:** valor único por paquete original. Todos los fragmentos comparten el mismo ID.
- **DF (Don't Fragment):** si está en 1, el router prefiere descartar y mandar ICMP "Fragmentation Needed" en lugar de fragmentar. Usado para **Path MTU Discovery**.
- **MF (More Fragments):** 1 en todos los fragmentos excepto el último.
- **Fragment Offset:** posición del fragmento en el paquete original, en unidades de 8 bytes.

**Ejemplo:** paquete original de 4000 bytes, MTU 1500 bytes. Header IP = 20 bytes; payload por fragmento debe ser múltiplo de 8.

- Frag 1: bytes 0-1479 (payload). Offset 0. MF=1.
- Frag 2: bytes 1480-2959. Offset 185 (= 1480/8). MF=1.
- Frag 3: bytes 2960-3979. Offset 370. MF=0 (último).

**Problemas:** si un fragmento se pierde, el destino descarta todo el paquete (timer de reensamble). Por eso muchos sistemas evitan fragmentación con PMTUD.

## Direccionamiento classful (histórico)

Las primeras IPv4 se dividían en clases por los primeros bits:

| Clase | Rango | Bits red / host | Uso |
|-------|-------|-----------------|-----|
| A | 0.0.0.0 - 127.255.255.255 | 8 / 24 | Grandes redes (16M hosts) |
| B | 128.0.0.0 - 191.255.255.255 | 16 / 16 | Medianas (65K hosts) |
| C | 192.0.0.0 - 223.255.255.255 | 24 / 8 | Chicas (256 hosts) |
| D | 224.0.0.0 - 239.255.255.255 | (multicast) | Multicast |
| E | 240.0.0.0 - 255.255.255.255 | (reservada) | Experimental |

Problema: una organización con 300 hosts necesitaba clase B (65K) y desperdiciaba miles. Solución: **CIDR**.

## CIDR (Classless Inter-Domain Routing)

Abandona las clases fijas. Cada red lleva una **máscara** de cualquier longitud (1-32). Notación: `IP / longitud`.

- **192.168.1.0/24:** los primeros 24 bits son red, los últimos 8 son host. Soporta 256 direcciones (254 utilizables).
- **10.0.0.0/8:** los primeros 8 son red. Soporta 16M direcciones.
- **172.16.0.0/12:** 12 bits de red, 20 de host. Soporta 1M.

**Máscara de subred** alternativa: 255.255.255.0 ≡ /24.

**Cálculo de red:** `IP AND máscara` = dirección de red. `IP AND NOT(máscara)` = parte de host.

**Ejemplo:** IP 192.168.1.130, /26 (máscara 255.255.255.192). Los primeros 26 bits son red. 192.168.1.128 es la red; 192.168.1.130 es un host en ella. Soporta 62 hosts.

## Diagrama

{{diagram: SubnetMask}}

El diagrama muestra cómo la máscara separa los bits de red de los bits de host. Visualizá el AND lógico aplicándose bit a bit sobre una dirección.

## VLSM (Variable Length Subnet Mask)

Permite distintas máscaras dentro de la misma red original. Útil para subnetear de forma jerárquica.

**Ejemplo:** te dan 192.168.0.0/24. Querés:

- 1 subred de 100 hosts (necesita /25, 128 direcciones)
- 2 subredes de 50 hosts (cada una /26, 64 direcciones)
- 4 subredes de 10 hosts (cada una /28, 16 direcciones)

Asignás:

- 192.168.0.0/25 (1-126 usables) → grande
- 192.168.0.128/26 (129-190) → mediana 1
- 192.168.0.192/26 (193-254) → ya no entra, hay que rehacer

(En este caso, asignás primero las más chicas o reorganizás. VLSM exige planificación cuidadosa para no fragmentar el espacio.)

## Direcciones especiales

- **Loopback:** 127.0.0.0/8 (típicamente 127.0.0.1). Tu propia máquina.
- **Broadcast de red:** la última dirección de la subred (todos los bits de host en 1). Ej: 192.168.1.255 en /24.
- **Dirección de red:** la primera dirección (todos los bits de host en 0). Ej: 192.168.1.0 en /24. No se asigna a hosts.
- **Broadcast limitado:** 255.255.255.255. Solo dentro de la propia red, no se enruta.
- **Privadas (RFC 1918):** no se enrutan en internet pública.
  - 10.0.0.0/8
  - 172.16.0.0/12
  - 192.168.0.0/16
- **APIPA / link-local:** 169.254.0.0/16. Cuando DHCP falla.

## NAT (Network Address Translation)

Permite que muchos hosts con IPs privadas compartan una IP pública. Inventado para extender la vida útil de IPv4.

**Funcionamiento (NAPT / PAT):**

```
Host interno 192.168.1.10:5000  →  NAT  →  Internet 200.1.1.1:33445
                                  ^
                          Reescribe IP origen y puerto
                          y guarda la tupla en una tabla.
```

Cuando vuelve respuesta a 200.1.1.1:33445, el NAT busca en su tabla y reescribe el destino a 192.168.1.10:5000.

**Pros:** ahorra IPs públicas, ofrece "firewall implícito" (nadie inicia conexión desde afuera).

**Contras:**

- Rompe el principio end-to-end: el host interno no es directamente alcanzable.
- Aplicaciones P2P, VoIP, juegos necesitan workarounds (STUN, UPnP, hole punching).
- Mantiene estado: si la tabla se llena o falla el NAT, se cortan las conexiones.

IPv6 elimina la necesidad de NAT al tener un espacio gigante (2^128 direcciones).

## ARP (Address Resolution Protocol)

Traduce IPs en MACs dentro de una LAN. Sin ARP, IP no podría bajar a Ethernet.

**Funcionamiento:**

```
Host A quiere mandar paquete IP a B (192.168.1.5).
1. A revisa su tabla ARP. Si tiene MAC de B, listo.
2. Si no, A manda un broadcast Ethernet:
   "¿Quién tiene 192.168.1.5? Decímelo a mi MAC."
3. B (y solo B) responde unicast con su MAC.
4. A guarda en tabla y manda el paquete.
```

**Vulnerabilidad: ARP poisoning.** Un atacante responde antes que B, anunciando que **él** tiene esa IP. Los frames van al atacante (MitM). Defensa: ARP estático para hosts críticos, DAI (Dynamic ARP Inspection) en switches.

## ICMP (Internet Control Message Protocol)

Mensajes de control y diagnóstico. **No** transporta datos de aplicación; es metadata sobre paquetes IP. Tipos importantes:

- **Echo Request / Reply (tipo 8 / 0):** la base de `ping`.
- **Destination Unreachable (tipo 3):** no se llegó. Códigos: red inalcanzable, host inalcanzable, puerto inalcanzable, fragmentación necesaria con DF=1.
- **Time Exceeded (tipo 11):** TTL llegó a 0. Base de `traceroute`.
- **Redirect (tipo 5):** "usá otro gateway".
- **Source Quench:** señal antigua de congestión (deprecada).

### Ping

Manda Echo Request a la IP destino. Si llega, devuelve Echo Reply. Mide RTT y pérdidas.

### Traceroute

Manda paquetes con TTL = 1, luego 2, luego 3, etc. Cada router que decrementa TTL a 0 responde "Time Exceeded" revelando su IP. Así se descubre la ruta salto a salto.

## Casos clave / Ejemplos

**Ejemplo 1: cálculo de subred.** ¿En qué red está 172.16.20.130/22?

- /22 = 22 bits de red, 10 de host. Máscara 255.255.252.0.
- IP en binario: 10101100.00010000.00010100.10000010
- Máscara: 11111111.11111111.11111100.00000000
- Red: 10101100.00010000.00010100.00000000 → 172.16.20.0/22.
- Broadcast: 172.16.23.255. Rango utilizable: 172.16.20.1 - 172.16.23.254.

**Ejemplo 2: ping a través de NAT.** Tu casa: 192.168.0.10. Pública del router: 200.1.1.1. Ping a 8.8.8.8: el NAT reescribe la IP origen a 200.1.1.1 (y el ID ICMP para diferenciar), guarda la tupla. Respuesta vuelve a 200.1.1.1; el NAT busca, restituye, llega a 192.168.0.10.

**Ejemplo 3: fragmentación con DF=1.** Tu paquete TCP de 1500 bytes intenta cruzar un túnel VPN con MTU 1400. Router con DF=1 lo descarta y manda ICMP "Frag Needed, MTU=1400". TCP reduce el MSS. Esto es PMTUD.

## Errores frecuentes

- Pensar que el destino fragmenta. **No**: solo routers en el camino fragmentan. El destino **reensambla**.
- Olvidar que el checksum del header se recalcula en cada salto (porque TTL cambia).
- Confundir broadcast de red (192.168.1.255 en /24) con broadcast limitado (255.255.255.255).
- Suponer que NAT es seguridad. Es **conveniencia**, no defensa robusta. Un firewall sí lo es.
- Pensar que ARP es IP. **No**: ARP usa Ethernet directamente (Ethertype 0x0806), no IP.
- Calcular cantidad de hosts utilizables incluyendo red y broadcast. **Siempre restá 2** ($2^h - 2$).

## Pregunta-trampa típica

> "¿Por qué TTL en IP y no en Ethernet?"

Porque Ethernet trabaja en redes con **topología sin loops** (gracias a STP). IP atraviesa muchas redes y un loop de ruteo (configuración mala, transitorio de OSPF) **causa paquetes circulando infinitamente**. TTL es la salvaguarda: si un paquete cruza más routers de los esperados, se mata.

> "¿Cuántos hosts soporta un /30?"

Cuatro direcciones totales ($2^2$), menos red y broadcast, **dos hosts utilizables**. Es la asignación clásica para enlaces punto a punto entre routers.

> "Si tengo dos hosts en redes distintas conectados al mismo switch, ¿se pueden ver?"

No directamente. El switch reenviaría el frame, pero el host destino vería un paquete IP **fuera de su red** y normalmente lo descartaría. Para que se hablen, alguno tiene que mandar al **gateway** (router), que está en ambas redes (o configurar IP secundaria, hacks).

## Datagramas vs Circuitos Virtuales (detalle)

Righetti contrasta cuidadosamente ambos paradigmas en clase:

**Modelo de Datagrama (Internet, IP):**

- **No** se espera un RTT para establecer una conexión: un nodo puede enviar datos tan pronto como esté listo.
- El nodo origen **no tiene por qué saber** si la red es capaz de entregar el paquete ni si el destino está listo para recibir.
- Como los paquetes se tratan independientemente, es posible **cambiar el camino** (por ejemplo, para evitar enlaces y nodos que estén fallando).
- Cada paquete lleva la dirección completa del destino: el overhead de información de control es **mucho mayor** que en el modelo orientado a conexión.

**Modelo de Circuito Virtual (X.25, Frame Relay, ATM):**

- Normalmente **debe esperarse un RTT completo** para establecer la conexión antes de poder mandar el primer paquete o celda.
- La solicitud de conexión lleva la dirección completa, pero los demás paquetes solo llevan un identificador pequeño (**VCI**, Virtual Circuit Identifier). Overhead de transmisión bajo.
- Si un switch o un enlace falla, **el circuito virtual cae** y debe establecerse uno nuevo: overhead de recuperación ante errores **alto**.
- Establecer la conexión por adelantado permite **reservar recursos** en los switches (espacio en buffers). Esto facilita ofrecer QoS.

**Tipos de circuitos virtuales:** PVC (Permanente, configurado por el administrador) y SVC (Switched, establecido por la solicitud del nodo).

Cada switch de un circuito virtual mantiene una tabla con: (puerto de entrada, VCI de entrada, puerto de salida, VCI de salida). Es una forma de **label switching** (cf. MPLS).

## Source Routing

Righetti menciona Source Routing como tercer paradigma: toda la información topológica necesaria para conmutar los paquetes la proporciona el **nodo origen**. Existen tres implementaciones:

- **Rotación:** cada switch quita su próximo destino del header y lo rota al final.
- **Stripping:** cada switch quita su entrada del header al pasar.
- **Pointer:** un puntero avanza en una lista fija de destinos.

Source Routing puede usarse en redes Datagrama (IP lo soporta como opción del header) o en CV (preselección del trayecto en el setup).

## Fragmentación: detalles del docente

Righetti subraya varios puntos específicos:

- La **unidad básica de fragmentación es 8 bytes**: el offset del fragmento se mide en unidades de 8 bytes, por eso el payload de cada fragmento (excepto el último) debe ser **múltiplo de 8**.
- Toda red debe aceptar un MTU de **al menos 68 bytes** (60 de cabecera máxima + 8 de datos mínimos).
- Los fragmentos son **datagramas autocontenidos**: heredan la cabecera del datagrama original (excepto los campos especiales MF y Fragment Offset).
- Todos los fragmentos de un mismo datagrama se identifican por el campo **Identification**.
- **IP no recupera fragmentos perdidos**: si falta uno, se descarta todo el paquete.

MTUs típicos que él menciona: Ethernet 1500 bytes, FDDI 4500 bytes.

## IPv6 (mención del docente)

Righetti señala IPv6 como evolución natural ante el agotamiento del espacio IPv4:

- Direcciones de **128 bits** (vs 32 de IPv4): $2^{128}$ vs $2^{32}$ (aprox. 4300 millones).
- Notación: `8000:0000:0000:0000:0123:4567:89AB:CDEF` (8 grupos de 4 dígitos hex separados por dos puntos).
- El **formato del header no es el mismo** que IPv4: no se puede mezclar transparentemente.
- IPv6 elimina la necesidad de NAT al tener espacio gigante.

## Énfasis del docente (Righetti)

- **Distinción tajante "Datagrama vs Circuito Virtual"**: la elige como eje conceptual para introducir IP. "Idea clave: autonomía. Los detalles de lo que pasa adentro permanecen ocultos."
- **IP como servicio "best-effort"**: enfatiza la frase "connectionless (datagram-based)". Los paquetes pueden perderse, llegar fuera de orden, tener duplicados entregados, **no tener cota para el tiempo de entrega**. Es la base sobre la que TCP debe construir confiabilidad.
- **Forwarding vs Routing**: separa explícitamente la operación de reenvío (data plane) de la construcción de tablas (control plane). Pregunta-clave que él plantea: "¿En qué caso el algoritmo de forwarding se reduce a 'si destino es mi red, mandar directo; si no, mandar al default router'?"
- **MTU mínimo y unidad de 8 bytes**: él insiste en que la **unidad básica de fragmentación es 8 bytes** y que toda red debe aceptar MTU de **al menos 68 bytes**.
- **Tabla de protocolos del header IP**: en sus diapositivas marca los valores específicos: ICMP=1, IGMP=2, IP-en-IP=4, TCP=6, EGP=8, UDP=17, OSPF=89, IGRP=88.
- **Ejemplo UBA**: usa la red **157.92/16** de UBA ("máscara de red de 16 bits, equivalente a Clase B") como ejemplo recurrente de subnetting jerárquico.
- **DiffServ/ECN en el header IP**: él marca específicamente que el campo "Type of Service" se usa hoy como **DiffServ** (Differentiated Services) y **ECN** (Explicit Congestion Notification): "Calidad de Servicio / Control Explícito de Congestión". Conexión importante con el tema de congestión.
- **Vocabulario que él usa**: "se inunda la red", "label switching" (para CV), "PVC vs SVC", "best-effort", "VCI" (Virtual Circuit Identifier), "Tabla de Forwarding vs Tabla de Routing".

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Conectarte a un Wi-Fi nuevo
Llegás a un café, te conectás al Wi-Fi "Cafe-Guest". DHCP te asigna 192.168.1.42 y gateway 192.168.1.1. Cuando abrís un sitio web, tu PC manda **broadcast ARP**: "¿Quién es 192.168.1.1?". El router responde con su MAC. Tu PC arma un frame con MAC destino = router, IP destino = la del servidor web. El paquete cruza el router que decrementa TTL.

**Por qué importa acá**: ARP es el pegamento invisible entre IP y Ethernet. Sin él, IP no podría entregar paquetes en una LAN. Pasa cada vez que te conectás a una red nueva.

### Fragmentación con VPN corporativa
Te conectás por VPN a la oficina. Tu MTU local es 1500 (Ethernet), pero la VPN agrega su header y reduce la MTU efectiva a 1420. Si tu app manda un paquete de 1500 con DF=1, el router VPN lo descarta y manda ICMP "Frag Needed, MTU=1420". TCP recibe la pista, baja el MSS, y todo sigue. Sin PMTUD verías "internet rota" sin saber por qué.

**Por qué importa acá**: muestra fragmentación + ICMP + DF trabajando juntos en una situación que pasa todos los días. Si un firewall bloquea ICMP, PMTUD falla y se queman conexiones (problema clásico).

### Tu casa con NAT
En casa tenés 4 dispositivos (PC, laptop, iPhone, smart TV) todos con IPs 192.168.x.x. El router del ISP te dio una sola IP pública (180.x.x.x). Cuando los 4 abren Netflix, el NAT mapea cada conexión con un puerto distinto: 180.x.x.x:33445 → PC, 180.x.x.x:33446 → iPhone, etc. Netflix solo ve una IP pública con muchos puertos.

**Por qué importa acá**: NAT es la razón por la que IPv4 sigue funcionando con 4300 millones de direcciones para 30 mil millones de dispositivos. Y por la que tus dispositivos del hogar no son alcanzables desde afuera (problema para hosting casero, ventaja para seguridad implícita).

## Conexiones

- Se conecta con **enlace** porque ARP es el pegamento IP↔Ethernet.
- Sirve de base para **ruteo** (RIP, OSPF, BGP), que llena las tablas de los routers.
- Relaciona con **TCP** porque IP entrega paquetes pero TCP necesita asumir las pérdidas, reordenamientos y duplicados que IP no maneja.
- Vincula con **seguridad** porque IP no tiene autenticación: spoofing, hijacking y muchos ataques explotan esa ingenuidad.
