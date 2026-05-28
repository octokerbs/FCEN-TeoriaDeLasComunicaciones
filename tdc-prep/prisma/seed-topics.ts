export type SeedTopic = {
  slug: string;
  name: string;
  description: string;
  order: number;
  category: string;
  iconColor: string;
};

export const topics: SeedTopic[] = [
  {
    slug: "shannon-teoria-informacion",
    name: "Teoría de la información",
    description:
      "Información I(E), entropía, fuentes, códigos óptimos y la inecuación de Kraft.",
    order: 1,
    category: "shannon",
    iconColor: "#48d6e2",
  },
  {
    slug: "shannon-canal",
    name: "Canal de Shannon",
    description:
      "Capacidad C = B·log₂(1+SNR), ruido, atenuación, BER y el límite teórico de transmisión.",
    order: 2,
    category: "shannon",
    iconColor: "#48d6e2",
  },
  {
    slug: "nivel-fisico",
    name: "Nivel físico",
    description:
      "Señales, Fourier, ancho de banda, Nyquist, modulación, conversión AD y multiplexación.",
    order: 3,
    category: "fisico",
    iconColor: "#5aa5ff",
  },
  {
    slug: "modelo-osi",
    name: "Modelo OSI y TCP/IP",
    description:
      "7 capas, funciones, encapsulamiento y la simplificación práctica del modelo TCP/IP.",
    order: 4,
    category: "osi",
    iconColor: "#3ee0a3",
  },
  {
    slug: "nivel-enlace-punto-a-punto",
    name: "Enlace · punto a punto",
    description:
      "Framing, detección de errores (CRC, Hamming), Stop & Wait, Sliding Window, capacidad de volumen.",
    order: 5,
    category: "enlace",
    iconColor: "#3ee0a3",
  },
  {
    slug: "acceso-multiple-ethernet",
    name: "Acceso múltiple · Ethernet",
    description:
      "CSMA/CD, colisiones, jam sequence, exponential backoff, MTU y performance.",
    order: 6,
    category: "enlace",
    iconColor: "#3ee0a3",
  },
  {
    slug: "switches-stp-vlan",
    name: "Switches, STP y VLANs",
    description:
      "Learning bridges, dominios de colisión y broadcast, Spanning Tree y segmentación lógica.",
    order: 7,
    category: "enlace",
    iconColor: "#3ee0a3",
  },
  {
    slug: "wifi-csmaca",
    name: "Wi-Fi · CSMA/CA",
    description:
      "Estación oculta y expuesta, DCF, RTS/CTS, MACA/MACAW y la anomalía Wi-Fi.",
    order: 8,
    category: "enlace",
    iconColor: "#3ee0a3",
  },
  {
    slug: "nivel-red-ip",
    name: "Nivel red · IP",
    description:
      "Datagrama vs circuito virtual, IPv4, fragmentación, CIDR, VLSM, ARP e ICMP.",
    order: 9,
    category: "red",
    iconColor: "#f5c64a",
  },
  {
    slug: "ruteo-interno-externo",
    name: "Ruteo interno y externo",
    description:
      "RIP (distance-vector), conteo a infinito, OSPF (link-state, Dijkstra), BGP y AS.",
    order: 10,
    category: "ruteo",
    iconColor: "#f5c64a",
  },
  {
    slug: "tcp",
    name: "TCP",
    description:
      "Orientación a conexión, 3-way handshake, segmento, ventana deslizante, máquina de estados.",
    order: 11,
    category: "transporte",
    iconColor: "#ff944d",
  },
  {
    slug: "udp",
    name: "UDP",
    description:
      "Servicio sin conexión, demultiplexación por puertos, pseudo-header y casos de uso.",
    order: 12,
    category: "transporte",
    iconColor: "#ff944d",
  },
  {
    slug: "congestion",
    name: "Congestión",
    description:
      "Control de congestión TCP (Reno), RED, FRED, AIMD, slow start y fórmula de Mathis.",
    order: 13,
    category: "transporte",
    iconColor: "#ff944d",
  },
  {
    slug: "dns",
    name: "DNS",
    description:
      "Jerarquía de nombres, registros, consulta recursiva e iterativa, caché y autoritativas.",
    order: 14,
    category: "aplicacion",
    iconColor: "#e066ff",
  },
  {
    slug: "http-web",
    name: "HTTP y la Web",
    description:
      "URLs, métodos, códigos, conexiones persistentes, pipelining y cookies.",
    order: 15,
    category: "aplicacion",
    iconColor: "#e066ff",
  },
  {
    slug: "smtp-mail",
    name: "Correo electrónico",
    description:
      "SMTP, MIME, POP3 vs IMAP y el flujo completo de un correo.",
    order: 16,
    category: "aplicacion",
    iconColor: "#e066ff",
  },
  {
    slug: "criptografia-fundamentos",
    name: "Criptografía · fundamentos",
    description:
      "Cifrado vs código, sustitución, transposición, Kerckhoff, one-time pads, DES y AES.",
    order: 17,
    category: "cripto",
    iconColor: "#ff5b6e",
  },
  {
    slug: "criptografia-clave-publica",
    name: "Clave pública · RSA",
    description:
      "Simétrica vs asimétrica, RSA paso a paso, confidencialidad, autenticación y costo.",
    order: 18,
    category: "cripto",
    iconColor: "#ff5b6e",
  },
  {
    slug: "firma-digital-pki",
    name: "Firma digital y PKI",
    description:
      "Hashes (SHA, MD5), firmado, certificados, autoridades certificantes y handshake TLS.",
    order: 19,
    category: "cripto",
    iconColor: "#ff5b6e",
  },
  {
    slug: "seguridad-ataques",
    name: "Ataques y defensas",
    description:
      "Sniffing, spoofing, hijacking, DoS, ingeniería social, firewalls y DMZ.",
    order: 20,
    category: "seguridad",
    iconColor: "#ff5b6e",
  },
];
