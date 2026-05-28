---
slug: dns
title: DNS - Sistema de nombres de dominio
category: aplicacion
order: 14
diagrams: [DNSResolution]
---

## Por qué importa

Las computadoras hablan IPs (`142.250.190.46`), las personas hablan nombres (`google.com`). **DNS** es el traductor entre ambos mundos, y sin él internet sería inusable: ¿podrías recordar las IPs de 100 sitios que visitás?

Pero DNS es mucho más que un mapeo: es una **base de datos jerárquica, distribuida, con caché global**, capaz de manejar billones de consultas diarias con latencia de pocos milisegundos. Cómo lograron eso es una obra maestra de la ingeniería de protocolos.

## Intuición

Imaginá la guía telefónica. Si fuera centralizada (un solo libro en Buenos Aires), nadie en Tokio podría buscar rápido y el libro estaría obsoleto antes de imprimirse. Por eso DNS es **federado**: cada zona maneja sus nombres, todos consultan a su biblioteca local, y existen "índices maestros" en la cima.

Más aún: como la mayoría de búsquedas se repiten ("¿IP de google.com?"), todos los niveles **cachean** resultados. Así el 99% de las consultas se resuelven sin tocar los servidores raíz.

## Jerarquía de nombres

DNS organiza nombres en un **árbol invertido**:

```
                      .  (raíz, implícita)
                      |
       ___________________________________
      |        |         |         |       |
     com      org        ar       net     edu      (TLDs)
      |                  |
     google             uba
      |                  |
     www                fcen
                         |
                       www
```

Un nombre se lee **de derecha a izquierda**: `www.fcen.uba.ar.` es un FQDN (Fully Qualified Domain Name) que va de la raíz (.) bajando hasta `www`.

**Niveles:**

- **Raíz (.)**: 13 servidores raíz (lógicos), replicados en cientos de instancias anycast.
- **TLDs:** com, org, net, edu, gov, mil, info... y ccTLDs (country code): ar, br, uk, de.
- **Segundo nivel:** google.com, uba.ar, microsoft.com.
- **Subdominios:** mail.google.com, www.fcen.uba.ar.

## TLDs

- **gTLDs (genéricos):** com, org, net (originales), info, biz, name (después), .app, .dev, .ai (nuevos).
- **ccTLDs (de país):** ar, br, uk, de, jp, etc. Cada país administra el suyo.
- **sTLDs (sponsored):** edu (educación EE.UU.), gov, mil, museum.

Los TLDs son gestionados por **registros (registries)** bajo supervisión de ICANN. Quien quiera registrar `mi-empresa.com` lo hace a través de un **registrador (registrar)** acreditado.

## Tipos de registros (RR)

Cada nombre tiene asociados uno o más **resource records**. Los más usados:

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **A** | IPv4 de un host | `google.com → 142.250.190.46` |
| **AAAA** | IPv6 de un host | `google.com → 2607:f8b0:...` |
| **MX** | Mail eXchanger: servidor de correo del dominio | `google.com → smtp.google.com (prio 10)` |
| **NS** | Name Server: servidores autoritativos del dominio | `google.com → ns1.google.com` |
| **CNAME** | Canonical Name: alias hacia otro nombre | `www.empresa.com → empresa.com` |
| **SOA** | Start of Authority: metadata de la zona (admin, serial, TTLs) | una sola por zona |
| **PTR** | Reverse DNS: IP → nombre | `46.190.250.142.in-addr.arpa → google.com` |
| **TXT** | Texto libre (SPF, DKIM, verificación de propiedad) | `_acme-challenge → "abc123..."` |
| **CAA** | Certificate Authority Authorization | `empresa.com → 0 issue "letsencrypt.org"` |

**MX y prioridad:** un dominio puede tener varios MX con prioridades. El emisor de mail intenta el de menor número primero; si falla, el siguiente.

**CNAME y restricciones:** no podés tener CNAME en el ápex de la zona (`empresa.com` directo), ni mezclar CNAME con otros tipos. Soluciones modernas: ALIAS, ANAME (no estándar pero soportados por algunos DNS).

## Consulta DNS

### Recursiva vs iterativa

- **Recursiva:** el cliente pide la respuesta final a un servidor; ese servidor hace todo el trabajo. Típicamente entre un host y su **resolver** (DNS de su ISP, 8.8.8.8, 1.1.1.1).
- **Iterativa:** un servidor pregunta a varios niveles, recibiendo en cada paso "yo no sé, pero pregúntale a éste". Típicamente entre el resolver y los servidores autoritativos.

```
Cliente                 Resolver (8.8.8.8)         Root        TLD (com)        Auth (google.com)
  |                          |                       |             |                    |
  |---- www.google.com? --->  |                       |             |                    |
  |   (recursivo)             |                       |             |                    |
  |                           |--- www.google.com? -->|             |                    |
  |                           |                       |             |                    |
  |                           |<- pregunte a .com NS -|             |                    |
  |                           |                                     |                    |
  |                           |---- www.google.com? --------------->|                    |
  |                           |                                     |                    |
  |                           |<- pregunte a google.com NS -------- |                    |
  |                           |                                                          |
  |                           |---- www.google.com? -------------------------------------|
  |                           |                                                          |
  |                           |<-------------------- 142.250.190.46 -------------------- |
  |                           |                                                          |
  |<---- 142.250.190.46 ----  |
```

El cliente solo ve una pregunta y una respuesta. El resolver hizo 3 consultas iterativas y devolvió el resultado.

## Diagrama

{{diagram: DNSResolution}}

El diagrama representa la cadena de consultas, desde el cliente al resolver, al root, al TLD y al autoritativo del dominio.

## Caché

Cada respuesta DNS lleva un **TTL** (time to live) en segundos. Mientras no expire, **el resolver puede responder desde caché** sin volver a consultar. TTLs típicos:

- Registros estables (A de un sitio establecido): 1-24 horas.
- Registros que cambian frecuentemente (CDN, balanceadores): 30-300 segundos.
- Antes de una migración: bajar TTLs días antes para que la transición sea rápida.

**Caché multinivel:**

- **Browser cache:** segundos a minutos.
- **OS resolver cache:** segundos a horas.
- **ISP resolver cache:** hasta el TTL.

Por eso un cambio de DNS tarda **horas o días** en propagarse globalmente: cada caché tiene que expirar.

## Respuestas autoritativas vs no-autoritativas

- **Autoritativa:** la responde un servidor **autoritativo** para esa zona (configurado como NS oficial). Es la fuente de verdad.
- **No-autoritativa:** la responde un resolver desde su caché, repitiendo lo que vio antes. Es lo que casi siempre obtenés.

En `dig`, la flag `aa` indica autoritativa.

## UDP vs TCP

DNS usa principalmente **UDP puerto 53** porque:

- Las consultas son cortas (cabe pregunta + respuesta).
- Latencia mínima (sin handshake).
- Si se pierde, retry rápido.

DNS usa **TCP puerto 53** cuando:

- Respuesta > 512 bytes (DNSSEC, muchos registros).
- **Zone transfer (AXFR / IXFR):** sincronización entre secundarios. Volumen grande, conviene fiabilidad.

DNS sobre TLS (DoT) y DNS sobre HTTPS (DoH) son extensiones modernas para **privacidad**: encriptan la consulta entre cliente y resolver.

## Servidores raíz

13 servidores lógicos (A a M), distribuidos globalmente con **anycast** (cientos de instancias físicas). Conocen los NS de **todos los TLDs**. Procesan billones de consultas al día.

```
A.root-servers.net    Verisign
B.root-servers.net    USC-ISI
C.root-servers.net    Cogent
D.root-servers.net    University of Maryland
E.root-servers.net    NASA
F.root-servers.net    ISC
G.root-servers.net    Defense Information Systems Agency
H.root-servers.net    US Army Research Lab
I.root-servers.net    Netnod (Suecia)
J.root-servers.net    Verisign
K.root-servers.net    RIPE NCC (Europa)
L.root-servers.net    ICANN
M.root-servers.net    WIDE Project (Japón)
```

## Casos clave / Ejemplos

**Ejemplo 1: resolución típica.** Querés visitar `www.fcen.uba.ar`:

1. Tu navegador pregunta al resolver del SO.
2. Resolver del SO pregunta al resolver del ISP (8.8.8.8).
3. ISP no tiene en caché. Pregunta a root: "¿quién maneja `ar`?".
4. Root responde: "los NS de `.ar` son nic.ar, etc."
5. ISP pregunta a `.ar` por `uba.ar`.
6. `.ar` responde: "los NS de `uba.ar` son dns.uba.ar, etc."
7. ISP pregunta a `dns.uba.ar` por `www.fcen.uba.ar`.
8. `dns.uba.ar` responde con la A de `www.fcen.uba.ar`.
9. ISP devuelve al SO al navegador. Caché en cada nivel.

**Ejemplo 2: TTL bajo en migración.** Empresa migra servidor. Una semana antes baja TTL a 60s. El día de la migración, cambia el A record. En 60s + caché de browsers, todos los usuarios apuntan al nuevo servidor.

**Ejemplo 3: MX records.** `dig MX gmail.com`:

```
gmail.com    3600    IN    MX    5  gmail-smtp-in.l.google.com.
gmail.com    3600    IN    MX    10 alt1.gmail-smtp-in.l.google.com.
gmail.com    3600    IN    MX    20 alt2.gmail-smtp-in.l.google.com.
gmail.com    3600    IN    MX    30 alt3.gmail-smtp-in.l.google.com.
gmail.com    3600    IN    MX    40 alt4.gmail-smtp-in.l.google.com.
```

Un MTA emisor intenta gmail-smtp-in (prio 5) primero, y baja en la lista si falla.

## Errores frecuentes

- Confundir nombre con IP. Un nombre puede tener múltiples IPs (round-robin DNS); una IP puede tener múltiples nombres (virtual hosts).
- Olvidar que CNAME no se puede combinar con otros tipos. `empresa.com` puede ser A o CNAME, no ambos, y no junto con MX.
- Pensar que DNS es seguro por defecto. **No es**: spoofing, cache poisoning son ataques reales. **DNSSEC** firma respuestas pero está mal adoptado.
- Suponer que el TTL controla la velocidad **del cambio**. Controla **cuánto duran las cachés**; el cambio en el autoritativo es instantáneo pero los resolvers no se enteran hasta expirar.
- Confundir resolver con autoritativo. Tu ISP corre **resolver**; los dueños del dominio corren **autoritativo**.
- Pensar que el DNS es de solo lectura para clientes. **DNS dinámico** (DDNS) permite a clientes actualizar registros (usado en DHCP + DNS, IPs cambiantes).

## Pregunta-trampa típica

> "¿Por qué DNS no consulta directamente al autoritativo sin pasar por root y TLD cada vez?"

Porque la **primera vez** no sabe quién es el autoritativo. Una vez resuelto, el resolver cachea no solo la respuesta final sino también los NS intermedios. Así, próximas consultas a otros dominios `.com` ya conocen los NS de `.com` y se ahorran preguntar al root.

> "Si cambio mi A record con TTL 1 hora, ¿en cuánto tiempo todos verán el cambio?"

En **hasta 1 hora desde el momento en que cada resolver expire su caché**. Pero algunos resolvers ignoran TTL bajo y cachean más; algunos navegadores tienen su propio caché. La realidad práctica es **horas a un día** para llegar al 99%.

> "¿DNS puede usar UDP para zone transfers grandes?"

No de forma confiable: UDP fragmentaría y perdería datos. AXFR e IXFR **usan TCP** justamente por eso. Es de los pocos casos donde DNS cae a TCP por defecto.

## Énfasis del docente (Righetti)

- **DNS como base de datos distribuida**: Righetti recalca que DNS "ha llegado a ser un sistema de base de datos distribuido generalizado para almacenar una variedad de información relacionada con la elección de un nombre". El énfasis no es solo "traductor de nombres" sino **sistema distribuido y escalable**.
- **El resolvedor**: usa la palabra "resolvedor" (no "resolver" en inglés). Lo describe así: "Un proceso de aplicación llama a un procedimiento de biblioteca llamado resolvedor (solicita un servicio). Le pasa el nombre como parámetro (por ejemplo `gethostbyname`)". Importante: el resolvedor manda un paquete **UDP** a un servidor DNS local.
- **RFCs 1034/1035**: cita los RFCs explícitamente. Suele preguntar dónde se define DNS.
- **Registros DNS de 5 tuplas**: Righetti los describe formalmente como tuplas `(Nombre_dominio, Tiempo_de_vida, Clase, Tipo, Valor)`. El **registro SOA** lo destaca como el que provee el nombre de la fuente primaria de información, dirección de correo del administrador, número de serie único y banderas/temporizadores.
- **Consulta recursiva vs iterativa**: las dibuja con el ejemplo `www.cs.yale.edu` recorriendo la jerarquía. Suele caer: distinguir bien que en la **recursiva** el servidor hace el trabajo por vos, en la **iterativa** te pasa la "pelota" al siguiente.
- **Respuestas autoritativas vs no autoritativas**: presta atención a diferenciarlas, no a las consultas. Una respuesta no autoritativa típicamente viene del caché de un resolvedor.
- **ICANN**: menciona que los nombres son administrados por la "Internet Corporation for Assigned Names and Numbers".
- **Herramienta práctica**: recomienda probar `dig` en `https://toolbox.googleapps.com/apps/dig/` con `www.dc.uba.ar` como ejemplo.
- **Aprox. 1500+ TLDs y 300+ ccTLDs**: da números concretos, lejos del "tres TLDs" simplista.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Tipeás "facbook.com" en lugar de facebook.com
DNS responde con NXDOMAIN (nombre no existe). Tu navegador suele mostrar una página de error o un sugeridor. Pero los **squatters** registran esos typos famosos (facbook.com, gogle.com, mercadolbire.com) y los apuntan a phishing o publicidad. Por eso ves dominios con tipo intencional en mensajes sospechosos.

**Por qué importa acá**: muestra que DNS confía en lo que tipeás. Sin validación semántica, el ataque "typosquatting" prospera. Es parte del problema más grande de DNS: no autenticidad por defecto.

### Cambiar de hosting con TTL bajo
Decidís migrar mercadolibre-ejemplo.com de DigitalOcean a AWS. Una semana antes bajás el TTL del A record de 24 horas a 60 segundos. El día D, cambias el A en el panel del registrar. Como los resolvers respetan TTL de 60s, en pocos minutos el 90% del tráfico va al nuevo servidor. Sin esa precaución previa, tendrías 24 horas de inconsistencia.

**Por qué importa acá**: ilustra cómo el TTL controla la velocidad de propagación. Es operación cotidiana en sysadmin y devops. Si lo olvidás, una migración planificada se vuelve un fin de semana de soporte.

### CDN distinto según ciudad
Cuando abrís Netflix desde Buenos Aires, tu DNS resolver pregunta por `nflxvideo.net` y recibe una IP de un servidor en San Pablo o Buenos Aires. Si lo abrís desde Madrid, recibís IP de un server europeo. Eso es **GeoDNS**: el autoritativo de Netflix devuelve A diferentes según la IP de origen de la consulta.

**Por qué importa acá**: ilustra DNS como herramienta de load balancing y CDN. Por eso Netflix tiene baja latencia en cualquier parte: el CDN sirve desde el punto más cercano, decidido en la capa DNS.

## Conexiones

- Se conecta con **UDP**: usa UDP 53 por excelencia. Caso emblemático de para qué sirve UDP.
- Sirve de base para **mail (SMTP)**: los MX records dirigen el tráfico de email.
- Relaciona con **HTTP**: el navegador resuelve DNS antes de cada solicitud (con caché).
- Vincula con **seguridad**: DNS spoofing, cache poisoning, MitM. DNSSEC busca remediar.
- Se conecta con **CDN y load balancing**: muchos sitios usan DNS para devolver IPs distintas según geografía (GeoDNS) o carga.
