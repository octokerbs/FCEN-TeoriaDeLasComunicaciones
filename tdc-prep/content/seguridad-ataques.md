---
slug: seguridad-ataques
title: Seguridad - ataques y defensas
category: seguridad
order: 20
diagrams: []
---

## Por qué importa

Toda la criptografía del mundo no sirve si un atacante puede saltarse el sistema por otro lado: engañar al usuario, envenenar caches, interceptar antes de que se cifre, o tumbar el servicio con tráfico basura. La seguridad de redes es una carrera continua entre **defensores** que cierran agujeros y **atacantes** que encuentran nuevos.

Conocer las **categorías de ataques** te permite pensar como atacante y diseñar defensas en profundidad. Los principios son sencillos pero hay que aplicarlos en cascada: una sola defensa nunca alcanza.

## Intuición

Pensá en la seguridad de una casa. No alcanza con una puerta blindada: si la ventana está abierta, si dejás la llave bajo la maceta, si dejás entrar a un desconocido "de la compañía de luz", todas tus medidas físicas no sirven. Lo mismo en redes: **el eslabón más débil rompe la cadena entera**.

Las defensas son **múltiples capas**, cada una atrapando lo que pasó la anterior: firewall + IDS + autenticación + cifrado + monitoreo + capacitación del usuario.

## Categorías de ataques

### Sniffing (escucha pasiva)

El atacante captura tráfico que no le corresponde. En LANs antiguas con hubs, trivial: todo el tráfico llegaba a todos. Hoy, con switches, se requiere **MAC flooding** (saturar tabla del switch) o ARP poisoning (ver abajo).

**En Wi-Fi sin encriptación**, el sniffing es trivial: cualquiera con un adaptador en modo monitor capta todos los paquetes en el aire. Por eso Wi-Fi público es peligroso para tráfico no cifrado.

**Defensa:** **encriptar todo** (HTTPS, WPA2/WPA3, VPN). Si capturan, capturan ciphertext sin valor.

### Spoofing (suplantación de identidad)

El atacante pretende ser alguien distinto.

- **IP spoofing:** mandar paquetes con IP origen falsa. Útil para DoS y para esquivar logs. Las respuestas no llegarán al atacante (las recibe la IP suplantada).
- **ARP spoofing / poisoning:** anunciar MAC falsa para una IP. Redirige tráfico al atacante en la LAN. Base de MitM en LAN.
- **DNS spoofing:** responder consultas DNS con IPs falsas. Si la víctima va a "banco.com", llega a un sitio del atacante.
- **Email spoofing:** falsificar el `From:` de un email. SMTP lo permite por diseño; SPF/DKIM/DMARC mitigan.
- **Caller ID spoofing:** muy común en telefonía.

**Defensa:** validar identidad criptográficamente (TLS, DKIM, certificados), filtros anti-spoofing en routers (BCP38).

### Hijacking (secuestro de sesión)

El atacante toma control de una sesión existente.

- **TCP hijacking:** si conoce números de secuencia, puede inyectar paquetes en una conexión. Antes era fácil porque ISN era predecible; hoy ISN aleatorios y TLS dificultan.
- **Session hijacking en web:** robar cookies de sesión (vía XSS, sniffing, malware) y usarlas para hacerse pasar por la víctima.
- **BGP hijacking:** anunciar prefijos IP que no te corresponden. Resultado: tráfico del mundo va a tu AS. Caso famoso: Pakistan Telecom anunciando los prefijos de YouTube (2008).

**Defensa:** TLS (protege sesiones), HttpOnly + Secure en cookies, RPKI (autenticación criptográfica de anuncios BGP).

### DoS (Denial of Service) y DDoS

Inhabilitar un servicio enviando tráfico masivo o explotando bugs.

- **SYN flood:** mandar muchos SYNs sin completar handshake. El server agota recursos manteniendo conexiones half-open. Defensa: **SYN cookies**, rate limiting.
- **ICMP/UDP flood:** saturar la banda.
- **Amplification (DNS, NTP, memcached):** mandar consultas con IP origen spoofeada de la víctima a servers que responden mucho más grande. Multiplica el tráfico hacia la víctima 10x-50000x.
- **Application-layer DoS:** consultas legítimas pero costosas (búsquedas complejas, generación de PDFs) para tumbar el server con poco tráfico.
- **DDoS (Distributed):** muchos atacantes (botnet) simultáneos. Difícil de bloquear por IP.

**Defensa:** rate limiting, scrubbing centers (Cloudflare, Akamai), anycast, capacidad excedente, mitigaciones específicas por tipo.

### ARP poisoning (detalle)

```
LAN normal:
- Host A (192.168.1.10, MAC A) quiere hablar con Gateway (192.168.1.1, MAC G).
- A manda ARP "¿quién tiene 192.168.1.1?".
- G responde "yo, MAC G".
- A guarda en cache: 192.168.1.1 → MAC G.

Atacante (Eve, MAC E):
- Manda ARP reply falso a A: "yo tengo 192.168.1.1, mi MAC es E".
- Manda ARP reply falso al Gateway: "yo tengo 192.168.1.10, mi MAC es E".
- Ahora todo tráfico A↔Gateway pasa por Eve. MitM total.
```

Eve puede ahora:

- Leer todo el tráfico en claro (HTTP, DNS).
- Inyectar contenido.
- Hacer SSL stripping (degradar HTTPS a HTTP si el sitio no usa HSTS).

**Defensa:** ARP estático para gateways críticos, DAI (Dynamic ARP Inspection) en switches gestionados, port security.

### Replay attacks

Reenviar mensajes válidos capturados previamente para producir el mismo efecto.

- Ejemplo: capturar el "abrí la puerta" cifrado de un control remoto y reenviarlo después.
- Online banking: capturar request de transferencia y replicarlo.

**Defensa:** **nonces** (números únicos por mensaje), timestamps, números de secuencia, contexto criptográfico.

### Ingeniería social

Atacar al **humano**, no al sistema. Hacer que el usuario entregue credenciales, ejecute malware o autorice una acción dañina.

- **Phishing:** mail falso que dirige a sitio falso para capturar password.
- **Spear phishing:** phishing dirigido, con info personal para que sea creíble.
- **Pretexting:** llamadas falsas haciéndose pasar por IT/soporte/banco.
- **Baiting:** USB "olvidado" con malware. La víctima lo conecta.

**Defensa:** capacitación, MFA (multi-factor), procedimientos formales para acciones sensibles, simulacros de phishing.

## Firewalls

Dispositivo (físico o software) que filtra tráfico según reglas. La primera línea de defensa de red.

### Stateless (sin estado)

Examina cada paquete independientemente, sin memoria de conexiones. Reglas típicas:

- "Permite TCP destino puerto 80 desde cualquier origen".
- "Bloquea ICMP entrante".
- "Solo permite tráfico desde 192.168.0.0/16".

**Pro:** rápido, simple.
**Contra:** no entiende sesiones. Por ejemplo, para permitir respuestas a conexiones salientes, tiene que abrir reglas estáticas demasiado amplias (típicamente "permite TCP entrante con flag ACK").

### Stateful (con estado)

Rastrea **conexiones activas** y aplica reglas según el estado.

- Cuando un host interno inicia una conexión TCP saliente, el firewall lo registra.
- El tráfico de respuesta para esa conexión específica se permite automáticamente.
- Cuando la conexión se cierra, la regla expira.

**Pro:** más seguro, reglas más finas. Reconoce ataques que requieren contexto (ej: ACK sin SYN previo).
**Contra:** consume memoria por conexión; bajo DoS la tabla de estado se puede saturar.

La mayoría de firewalls modernos son stateful (Linux iptables/nftables, BSD pf, Cisco ASA, fortinet, etc.).

### Application-layer gateways (proxies)

Operan en capa 7. Entienden HTTP, SMTP, etc. Pueden:

- Inspeccionar URLs, headers, body.
- Bloquear contenido (malware, sitios prohibidos).
- Auditar y registrar interacciones.
- Hacer "SSL inspection" (descifran y vuelven a cifrar, con certificado propio: muy invasivo).

**WAF (Web Application Firewall):** caso especial de application gateway para web. Detecta SQL injection, XSS, CSRF, etc.

**Email gateways:** filtran spam, malware en adjuntos, DLP (Data Loss Prevention).

### IDS / IPS

- **IDS (Intrusion Detection System):** detecta y **alerta** sobre actividad sospechosa. No bloquea.
- **IPS (Intrusion Prevention System):** detecta y **bloquea** en tiempo real.

Métodos: signature-based (firmas de ataques conocidos, como antivirus), anomaly-based (modelos de comportamiento "normal").

## DMZ (Demilitarized Zone)

Arquitectura de red con tres zonas:

```
                        Firewall externo
                              |
       +-------+-----+--------+-------+-------+
       |             |                |       |
   Internet         DMZ           LAN interna |
                 (web, mail,                  |
                  DNS público)                |
```

- **Internet:** no confiable.
- **DMZ:** servidores expuestos a internet (web, mail, DNS público). Acceso desde fuera permitido a servicios específicos; sin acceso libre a la LAN interna.
- **LAN interna:** zona confiable, no expuesta directamente.

**Reglas típicas:**

- Internet → DMZ: permitido (en puertos específicos: 80, 443, 25).
- Internet → LAN: bloqueado.
- LAN → DMZ: permitido.
- LAN → Internet: permitido (saliente, controlado).
- DMZ → LAN: muy restringido (típicamente bloqueado, salvo flujos específicos).

Si un atacante compromete un server en la DMZ, **no llega automáticamente a la LAN interna**. El firewall interno lo detiene.

## Defensa en profundidad

Principio rector: **múltiples capas independientes**. Si una falla, las demás contienen el daño.

- Capa de red: firewall, segmentación, VLANs, ACLs.
- Capa de host: hardening del SO, antivirus, EDR.
- Capa de aplicación: validación de input, autenticación robusta, autorización fina.
- Capa de datos: cifrado at-rest, backups, control de acceso.
- Capa de identidad: MFA, SSO, gestión de privilegios.
- Capa humana: capacitación, políticas, simulacros.
- Monitoreo: logs centralizados, SIEM, alerting, response.

## Otros conceptos clave

### Zero Trust

Modelo donde **nadie es confiable por defecto**, ni dentro ni fuera de la red. Cada acceso requiere autenticación y autorización explícita. Concepto: "never trust, always verify". Reemplaza el paradigma de "perímetro fuerte, interior libre".

### Forward secrecy

Propiedad de un protocolo donde **comprometer la clave a largo plazo en el futuro no expone tráfico pasado**. TLS 1.3 lo requiere (vía ECDHE).

### MFA (Multi-Factor Authentication)

Combinar **algo que sabés** (password), **algo que tenés** (teléfono, token), **algo que sos** (huella, cara). Mata phishing simple porque robar password no alcanza.

### HSTS (HTTP Strict Transport Security)

Server le dice al browser "para este dominio, siempre usá HTTPS, aunque el usuario escriba HTTP". Mitiga SSL stripping en MitMs.

### Bug bounty / responsible disclosure

Empresas pagan a investigadores que reportan vulnerabilidades antes de explotarlas. Convierte enemigos en aliados.

## Casos clave / Ejemplos

**Ejemplo 1: ataque MitM con ARP poisoning + SSL stripping.**

1. Eve hace ARP poisoning en una Wi-Fi pública.
2. Tráfico HTTPS del usuario pasa por Eve.
3. Eve no puede descifrar TLS (le falta privada del banco), pero puede manipular el tráfico HTTP que algunos sitios todavía usan, o forzar downgrade de HTTPS a HTTP en sitios sin HSTS.
4. Sin HSTS, el usuario "accede" a una versión http:// y Eve lee todo en claro.

**Defensa:** HSTS estricto, conexión VPN, certificate pinning.

**Ejemplo 2: phishing exitoso.**

1. Atacante manda mail "Su cuenta de [banco] fue suspendida. Click acá para reactivar".
2. Link va a `banck-online.com` (typo deliberado).
3. La página clona perfectamente la del banco real. Usuario ingresa user/pass.
4. Atacante ya tiene credenciales. Si el banco no usa MFA, accede a la cuenta.

**Defensa:** MFA, conciencia del usuario, filtros anti-phishing, password managers (no auto-llenan en dominios falsos).

**Ejemplo 3: DDoS amplification (NTP).**

- Atacante manda paquete UDP a server NTP con IP origen spoofeada de víctima.
- Server NTP responde a la víctima con paquete ~200x más grande.
- 1 Mbps del atacante = 200 Mbps a la víctima.

**Defensa:** desactivar comandos NTP innecesarios (monlist), filtros en routers (BCP38), scrubbing centers.

## Errores frecuentes

- Confiar en seguridad por oscuridad ("nadie va a encontrar este puerto"). Los escáneres encuentran todo.
- Suponer que la LAN interna es segura. Insider threats y BYOD destruyen esa premisa.
- Implementar criptografía sin **gestión de claves**: si la clave está en plaintext en el código, la criptografía no sirve.
- Olvidar la **disponibilidad** como pilar de seguridad. Un servidor protegidísimo pero tumbado por DoS, en la práctica, fue vencido.
- Confundir compliance con seguridad. Cumplir un checklist no garantiza seguridad real.
- Tratar la seguridad como producto, no como proceso. Las amenazas evolucionan; las defensas también deben.

## Pregunta-trampa típica

> "Si mi sitio usa HTTPS, ¿está seguro?"

HTTPS protege **transporte** entre cliente y server. No protege contra: bugs en la aplicación (SQL injection, XSS), passwords robadas, malware en el server, ataques al cliente, DDoS, configuración insegura del TLS. Es **necesario pero no suficiente**.

> "¿Es seguro un VPN gratuito?"

Generalmente **no**. La VPN ve **todo tu tráfico no cifrado**. Si el proveedor es gratis, su modelo de negocio puede ser vender tus datos, inyectar ads, o algo peor. VPN comerciales reputados sí ayudan; gratuitos suelen ser trampa.

> "¿Por qué se sigue usando un sistema tan inseguro como SMTP en lugar de algo nuevo?"

Por **efectos de red**. Mail es federado: cambiar requiere que todos cambien al mismo tiempo, lo que es prácticamente imposible. Las extensiones (SPF, DKIM, DMARC, STARTTLS, ARC) son la realidad: parches sobre el sistema viejo. Lo mismo pasa con BGP, DNS, etc.

## Énfasis del docente (Righetti)

- **Marco conceptual obligatorio** que abre la teórica — pide enumerar las propiedades de seguridad **en este orden**:
  - **Confidencialidad**: *"los mensajes solo deben poder ser entendidos por las partes especificadas"*.
  - **Integridad** (con dos sub-propiedades: **originalidad** — el mensaje no es copia artificial repetida — y **autenticidad** — el mensaje no fue modificado).
  - **Autenticación**: probar la identidad.
  - **Autorización / control de acceso**.
  - **No repudio**.
  - **Disponibilidad**.
  Si recitás esta lista al empezar la pregunta de seguridad, ya empezó bien.

- **Encuadre por capas que cae en final**: para cada capa, un protocolo de seguridad típico.
  - Aplicación: PGP, S/MIME, SSH.
  - Transporte: **SSL/TLS**.
  - Red: **IPsec** (con sub-protocolos **AH** — Authentication Header — y **ESP** — Encapsulating Security Payload).
  - Enlace: WEP, WPA, WPA2.
  Acordate de IPsec con AH+ESP; aparece como pregunta directa.

- **Cuadro de "ataque ↔ protección"** que repite literal en clase. Listado con sus propias palabras:
  - **Sniffing** — escuchar datos para descubrir passwords. Protección: encriptación de datos.
  - **Spoofing** — hacerse pasar por otro, ej. *"adivinación de número de secuencia en TCP"*. Protección: encriptación de protocolo.
  - **Hijacking** — robar conexión post-autenticación. Protección: encriptación de protocolo.
  - **Ingeniería social** — *"aprovechar la buena voluntad de los usuarios"*. Protección: autenticación fuerte + información.
  - **Explotar bugs de software**. Protección: baterías de tests + listas **CERT**.
  - **Confianza transitiva** (suplantación IP entre hosts UNIX confiables). Protección: autenticación fuerte + filtrado de paquetes.
  - **Ataques dirigidos por datos** (ej. JavaScript maligno). Protección: firma digital + información.
  - **Caballo de Troya** (login falso con base de datos). Protección: firma digital + información.
  - **DoS** — *"mail bombing" o "ping asesino"*. Protección: *"solución?"* — el docente literalmente pone signo de pregunta en sus diapos para indicar que no hay defensa perfecta.
  - **Enrutamiento fuente** (modificar ruta de vuelta). Protección: filtrado de paquetes.
  - **Adivinación de passwords** — fuerza bruta. Protección: bloqueo tras N intentos, MFA.
  - **Mensajes de control de red** (envenenar tablas con ICMP, ARP). Protección: validar origen.

- **Cita histórica que le encanta**: durante la Segunda Guerra los EE.UU. usaron **"code talkers" navajos** a ambos lados de la línea de comunicación. *"Su idioma no tiene reglas escritas, no es muy conocido y no fue documentado en libros accesibles"*. Es un ejemplo concreto de seguridad por desconocimiento que **funcionó** porque la población hablante era pequeña y conocida — un caso límite de criptografía por código.

- **Sobre DoS** es crítico ante una pregunta directa: *"no hay protección perfecta, solo mitigación"*. Mencionar rate limiting, scrubbing, CDN, anycast, capacidad excedente. Reconocer que es un **problema fundamental** de redes abiertas.

- **Firewalls** los toma en tres categorías progresivas: **stateless** (rápido, ciego) → **stateful** (mantiene tabla de conexiones, mejor) → **application gateway / proxy** (entiende protocolo de capa 7). Le gusta el ejemplo de **DMZ** con firewall de "tres patas": Internet ↔ DMZ (servidores públicos) ↔ LAN interna. Si comprometen DMZ, no llegan a la LAN.

- **IDS vs IPS** lo pregunta cortito: **IDS detecta y alerta**; **IPS detecta y bloquea**. La diferencia es estar in-line vs out-of-band.

## Ejemplos del mundo real

Tres situaciones cotidianas donde estos conceptos aparecen.

### Phishing del "banco" en tu inbox
Llega un mail "Banco Galicia: su cuenta fue suspendida, ingrese a bancogallcia.com.ar". El dominio tiene un typo casi invisible (gallcia vs galicia). Click: una página clon del banco. Si entrás user y password, los caés. Si tu banco tuviera MFA con token físico o app, el atacante todavía no podría loguearse aunque tenga la password.

**Por qué importa acá**: muestra ingeniería social — la categoría más exitosa de ataques. La defensa no es solo tecnológica; es MFA + capacitación + password managers que no autocompletan en dominios falsos.

### ARP poisoning en una cafetería
Estás en Starbucks con Wi-Fi pública. Un atacante en otra mesa corre `ettercap`. Su laptop manda ARP replies falsos: "yo soy el gateway". Tu PC actualiza la ARP cache: gateway → MAC del atacante. Todo tu tráfico HTTP no cifrado pasa por él, incluyendo cookies de sesión. Si algún sitio no usa HSTS, el atacante puede hacer SSL stripping.

**Por qué importa acá**: ejemplo concreto del ataque ARP del docente. Por eso nunca hagas homebanking en Wi-Fi pública sin VPN. HTTPS + HSTS + certificate pinning son las defensas modernas.

### SYN flood famoso (Mirai botnet 2016)
En octubre 2016, la botnet Mirai (compuesta por cámaras IP comprometidas) lanzó un DDoS contra Dyn (provider de DNS). Pico de 1.2 Tbps. Tumbó GitHub, Twitter, Netflix, Spotify, Reddit por horas en EE.UU. Era IoT explotado: cámaras con passwords default ("admin/admin") que el atacante usó como ejército.

**Por qué importa acá**: muestra DDoS amplificado por IoT vulnerable. La frase del docente "para DoS, solución?" cobra sentido: rate limiting + anycast + Cloudflare ayudan, pero no hay protección perfecta contra 100K cámaras atacándote.

## Conexiones

- Se conecta con **TODOS** los temas anteriores: cada protocolo tiene su vector de ataque.
- Relaciona con **criptografía**: las defensas son criptográficas, pero también organizacionales y humanas.
- Vincula con **firewalls, IDS/IPS** que son la infraestructura de defensa de red.
- Se conecta con **Zero Trust** que repensa la arquitectura para no depender del perímetro.
- Sirve para entender **incidentes reales**: cada brecha publicada (Equifax, SolarWinds, MOVEit) se mapea a estos patrones.
