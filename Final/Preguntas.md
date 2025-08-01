
# ¿Cómo se minimiza/maximiza la entropía? ¿Qué pasa si varío la forma de medirla?

La entropia se minimiza cuando los simbolos que emite la funte tienen probabilidades de emision dispareja. Alcanza el minimo cuando un simbolo tiene probabilidad de 1 y el resto de 0.

La entropia viene dada en la nueva unidad de medida. Si medimos en bits, viene dada en bits. Si la medimos en unidades de orden r, viene dada en unidades de orden r.

# Cuando se realiza una extensión de una fuente de información, la entropía de la nueva fuente es H(s^n) = n \* H(S). Explique con un ejemplo el concepto de extensión de una fuente.
Supongamos que la fuente $S = \{s_{1}, s_{2}, s_3\}$ tiene las siguientes probabilidades de emision. $P(s_1) = 1/2$ y $P(s_{2})= P(s_{3})= 1/4$.
Ahora tomemos a la fuente $S^2$. Teniendo en cuenta la composición de $S$, la fuente $S^2$ tiene las siguientes probabilidades de aparicion de simbolos:
$P(s_{1}s_{1})$ = 1/4
$P(s_{1}s_{2})$ = 1/8
$P(s_{1}s_{3})$ = 1/8
$P(s_{2}s_{1})$ = 1/8
$P(s_{2}s_{2})$ =1/16
$P(s_{2}s_{3})$ =1/16
$P(s_{3}s_{1})$ =1/8
$P(s_{3}s_{2})$ =1/16
$P(s_{3}s_{3})$ =1/16

$H(S^{2})= 3\frac{bits}{simbolo}$ 

Fuente: 8 símbolos equiprobables (Ej.: A, B, C, D, E, F, G, H)  
Todos tienen la **misma probabilidad**: P=1/8
La entropia es H = 3 bits/simbolo

Significa que, en promedio, cada simbolo contiene 3 bits de informacion.  Eso significa que no podemos representar los simbolos con menos de 3 bits por simbolo en promedio, sin perder informacion.

Ejemplo de codificacion:

| Símbolo | Código |
| ------- | ------ |
| A       | 000    |
| B       | 001    |
| C       | 010    |
| D       | 011    |
| E       | 100    |
| F       | 101    |
| G       | 110    |
| H       | 111    |
Este es un codigo de longitud fija, optimo cuando los simbolos son equiprobables.


Si los simbolos de la fuente no son equiprobables, usamos un codigo de longitud variable.

**Huffman asigna codigos mas cortos a los simbolos mas probables**

| Símbolo | Código |
| ------- | ------ |
| A       | 0      |
| B       | 10     |
| C       | 110    |
| D       | 111    |

El promedio de bits por simbolo es igual a la entropia.

La **entropía** es el **mínimo teórico** de bits necesarios por símbolo.

¡Nunca podemos codificar con menos bits por símbolo (en promedio) que la entropía sin perder información!

# ¿Qué es un código y cómo se caracteriza?

Es el conjunto de simbolos de un alfabeto, generalmente en binario para su facil transmision a traves de canales fisicos (señales). Usamos una funcion para convertir simbolos del alfabeto de salida (Abecedario) a uno de llegada (Binario).

Un código se caracteriza como: 
- no singular: todas sus palabras son diferentes 
- unívoco: si su extensión de orden n es no-singular para cualquier valor finito n. 
- instantáneo: las palabras pueden ser decodificadas sin conocer los símbolos precedentes (condición: no existe palabra que sea prefijo de otra).
# ¿Qué es la longitud media de un código? ¿Cómo se relaciona con la entropía?

Es un estimado de cuantos bits son necesarios por simbolo para representar mensajes codificados. Se suman la probabilidad de la ocurrencia de un simbolo por su longitud en bits.

**Entropia**: En promedio cada simbolo tiene tantos bits de informacion.
**Longitud media de un codigo**: Es el promedio de bits por simbolo codificado. Lo que realmente **cuesta transmitir** los datos.

Un codigo es **optimo** $\Longleftrightarrow$ $H(S) = L$ donde $L$ es la longitud media de un codigo 

Recordemos que la entropia es el minimo teorico de bits promedio necesarios por simbolo sin perdida de informacion. 

Mientras mas se acerque la longitud media de un codigo de la fuente S a la entropia de esta, mas eficiente será considerado el código. 

# Enuncie dos conclusiones prácticas de la teoría de la información y la codificación 

- La entropia es maxima cuando los simbolos son equiprobables.
- La longitud de un codigo no puede ser menor a la entropia.

# 9. ¿Cómo aplicaría un mecanismo compresión en un texto ASCII basándose en estadística? 

Se asignan mas bits a simbolos menos probables. El codigo resulta optimo.


# 10. ¿Qué es el ancho de banda en qué afecta la capacidad de transferencia? 

El rango de frecuencias por el cual se puede transmitir una señal analógica. Esta depende del medio fisico (Aire?, Cobre?, etc). Este restringe la maxima capacidad de transferencia de datos.


Mientras mas grande sea el ancho de banda, mas bits por segundo se pueden transmitir.

# 11. Enunciar y describir el Teorema de Shannon 5

Define la cantidad máxima de datos que se pueden transmitir de forma confiable sobre un canal con ruido dado.

**B**: Ancho de banda.
**SNR**: Relacion señal-ruido.

Capacidad maxima de un canal (en bps):
$$C=B⋅log_{2}(1+SNR)$$

# 12. Enunciar y explicar el Teorema de Nyquist 5

Para reconstruir con precisión una señal analógica a partir de sus muestras digitales, la frecuencia de muestreo debe ser al menos el doble de la frecuencia más alta presente en la señal original
# 13. Para transmitir voz por canal telefónico se utilizan 8 bits mientras que para reproducir un CD se usan 16 bits ¿por qué sucede esto? 

Porque 8 bits son suficientes para entender la voz humana y mas eficiente. 16 bits es mucho pero se obtiene una alta calidad. Para tener mejor calidad (CD), se necesitan el doble de muestras por segundo.

CD tiene mas calidad (doble de muestreo) pero ocupa mas espacio (se guarda en un cd).

# 14. Describir métodos de control de errores en capa 1

La capa física no implementa mecanismos de control de errores como detección o corrección, pero puede utilizar técnicas como codificación de línea, repetición de bits, o modulación robusta para **reducir la probabilidad de error**

# 15. ¿Cómo es el proceso de conversión de las señales analógicas a digitales? 5 

Se usa algun sensor de vibraciones, luz, señales, etc tantas veces por segundo para muestrear  lo recibido y "parsearlo" en unos o ceros. Este proceso se realiza mediante un codec, el cual muestrea al doble del ancho de banda obteniendo un tren de pulsos de amplitud variable y determina el valor en N bits de la señal digital.

# 16. ¿Para qué sirve un MODEM? ¿En qué se diferencia de un conversor analógico-digital? 5

Convierte señales digitales a analógicas y viceversa. A diferencia de un codec, el modem toma señales ya codificadas. El codec toma señales del mundo real.

# 17. ¿Cómo se multiplexan las señales en un canal troncal? 5 

Existen dos formasa de multiplexar las señales. **TDM** y **FDM**. TDM es mas simple porque se puede asignar externamente mientras que FDM requiere de circuitos analogicos. 

**TDM** (Time Division Multiplexing): A cada evento se le asigna un tiempo de uso del canal entero. Como una ruleta. Primero a vos, despues a vos, despues a vos, etc. Es como cuando se hace el context switch en un procesador.

**FDM** (Frequency Division Multiplexing):  Se asigna una frecuencia a cada evento, es un ancho de banda fraccionado pero todos ocurrena  la vez. 

# 18. ¿Qué es el troughput? ¿Cuál es el limitante de esta medida? 5 

Tiene en principio dos interpretaciones: Bandwith (cantidad de datos que el canal permite enviar por unidad de tiempo) y end-to-end (cantidad de datos enviados que llegan efectivamente al receptor por unidad de tiempo). El limitante es siempre en última instancia el ancho de banda.

# 19. ¿Qué tipos de onda se pueden pasar por un canal de trasmisión (cuadradas, senoidales,…)? 5 

Solo las senoidales. Las ondas cuadradas no existen en el mundo real.

# 20. ¿Por qué no puede transmitirse una onda cuadrada en un BW de 3000hz? 6 



# 21. ¿Qué relación hay entre la información de la señal y el ancho de banda? 6 

Que dependiendo de la codificacion de la informacion se puede transmitir mas o menos informacion por bit. Si la la longitud de codigo promedio es grande entonces el ancho de banda permite una cierta cantidad de bits por segundo. Si la longitud de codigo promedio es menor, se puede transmitir mas informacion por el mismo ancho de banda.

# 22. Si te tiene una onda cuadrada de 10Khz y se inyecta en un canal con BW de 15Khz ¿cómo es la señal que llega al receptor? 6 


# 23. Describa las técnicas de Spread Spectrum para transmisión de señales y sus implementaciones: Direct Sequence y Frecuence Hoping. 6 



# Capa 2: Enlace (Link) 6 
# 24. ¿Qué es una red de computadoras? 6 

Conjunto de computadoras conectadas a traves de un medio fisico que comparten un protocolo comun. La idea es que puedan comunicarse y distribuir recursos.

# 25. Describir tipos de redes: Ethernet (802.3), Wireless (802.11), Token Ring (802.5)…. 6 

**Ethernet**: Medio compartido por cable fisico. Medio de transmision es el cable coaxial de 10mbps. Distancia maxima de 500m por trama para evitar atenuacion. Puede tener 4 repetidores con un enlace total maximo de 2500m. Enlace minimo de 2.5m. Usa el protocolo CSMA (Carrier Sense Multiple Access / Collission Detection) donde todas las computadoras tienen acceso simultaneo al medio sensando si esta en uso, si se libera, se transmite. Collision detection es que, si hubo una colision durante la transmision, se vuelve a transmitir. *Exponential backoff*, se espera entre 0 y 2^k - 1 * RTT veces con k la cantidad de intentos para rentransmitir.

*Atenuacion: pérdida de intensidad de la señal a medida que se transmite a través de un cable o medio de comunicación*

**Wireless 802.11**: Medio compartido inalambrico (radio/ifrarrojo). Usa el protocolo *MACA* para colisiones (Multiple Access Collission Avoidance). El emisor envia una request con la longitud de los datos a transmitir. El receptor contesta con la mismo info y habilita la transmision. *MACAW* incorpora ACKs para cada frame, deteccion de portadora CSMA/CA y exponential backoff.

# 26. ¿Puede garantizarse el acceso al medio en tiempo acotado en WANs? ¿Con qué protocolos? 7

Ethernet, al no ser determinístico, NO puede garantizar acceso al medio para transmitir en tiempo acotado.


#  27. Describir los problemas de Nodo Oculto y Terminal Expuesta de 802.11 7

**Nodo oculto**: Dos terminales A y C fuera de rango quieren transmitir a B y, al no detectar la señal una de otra, transmiten y colisionan en B.

**Terminal Expuesta**: Terminal B en rango de A y C transmite a A, y por lo tanto, la señal es sensada a C, quedando esta bloqueada de transmitir a un Nodo D.

#  28. ¿Cómo se transmiten frames en un canal Ethernet? 7 

**Frame de tamaño fijo**: 


# 29. ¿Qué control de errores se realiza en este nivel? Diferencias con nivel 4 7 
# 30. ¿Cómo se implementa QoS en ATM? 8 
# 31. ¿Porqué se dice que Ethernet es no-determinístico y Token Ring determinístico? 8 
# 32. ¿Qué ventajas aporta una conexión de red mediante Swtiches? 8 
# 33. ¿Qué problema puede surgir al conectar una red con Switches? ¿Cómo se soluciona? 8 
# 34. Describir el algoritmo STP (spanning tree protocol) ¿en qué momentos se ejecuta? 8
#  35. ¿Qué es un circuito virtual? 8 
# 36. ¿Puede ocurrir que en un circuito virtual se entreguen paquetes desordenados? (poco importante) 8 
# 37. Describir el control de congestión en circuitos virtuales 8 
# 38. ¿Cómo se interconectan dos redes mediante múltiples enlaces Ethernet (etherchannel)? 9
#  39. ¿Qué ocurre con la performance de una red Ethernet si se aumenta la cantidad de máquinas? ¿y en una Token Ring? 9 
# 40. ¿Puede asegurarse siempre que un paquete llegó a destino? Describa el problema de los “dos ejércitos” 9 1 
# 41. ¿Cuál es el MTU de una red Ethernet? 9 
# 42. Se dice que en 802.11 el mecanismo de detección de portadora es virtual (CSMA/CA) ¿Cómo se implementa? ¿En qué se diferencia de Ethernet 802.3? 9 
# 43. Ejercicio de esquema de LAN con varios AP y un troncal, determinar velocidad de transferencia final y MACs involudcradas (ver práctica) 9 
# 44. Describir protocolos Stop & Wait vs Sliding Windows. 9 
# 45. ¿Cuáles son las soluciones para controlar la congestión de una red? 10 
# 46. ¿Cuál es el throughput de un protocolo de ventana deslizante? 10 Capa 3: Red (Network) 10 
# 47. ¿Cuáles son las dos grandes estrategias de transmisión a nivel 3? Describirlas 10 
# 48. Describir las políticas de servicio de comunicación QoS y Best Effort 11 
# 49. ¿Qué control de errores se realiza en este nivel? 11 
# 50. Describir e indicar ventajas y desventajas del algoritmo Link-State 11 
# 51. Describir e indicar ventajas y desventajas del algoritmo Distance-Vector 11 
# 52. ¿Cómo escala el algoritmo Link-State? 11 
# 53. ¿Cómo escala dentro de un sistema autónomo el protocolo OSPF? 11 
# 54. Describir como converge Distance-Vector y el problema de conteo-a-infinito. 12 
# 55. ¿Qué soluciones se proponen al problema de conteo-a-infinito en algoritmos Link-State? ¿y Distance Vector? 12 
# 56. Explique por qué se dice que Link-State realiza una inundación confiable. 12 
# 57. ¿Cómo se fragmentan los paquetes IP? ¿Qué relación tiene con el MTU? Describir los bits que se modifican y los que no al fragmentar. 12 
# 58. ¿Cómo implementa calidad de servicio IP? 12 
# 59. Describir el protocolo ARP ¿porqué se considera de nivel 3 y no de 2? 12
#  60. ¿Qué protocolo de Checksum se utiliza más frecuentemente en esta capa? 12 
# 61. Detalle el error en el siguiente razonamiento: en Packet switching se necesitan bits de control y dirección en cada paquete, lo que implica overhead, mientras que en Circuit switching solo se utiliza un Id de circuito, por lo que no existe overhead en CSw. 13 
# 62. ¿Tiene sentido el nivel 3 a nivel local? 13 
# 63. Describir el control de congestión a nivel 3 13 
# 64. Describa una red basada en conmutación de paquetes que ofrezca servicio orientado a conexión. 13 
# 65. Describir los conceptos de máscara de red IP y subnetting 13 
# 66. ¿Qué protocolos se utilizan para multicast? 13 
# 67. ¿Qué pasa con los paquetes que no llegan a destino después de mucho tiempo? 14 
# 68. ¿Porqué motivo OSPF tiene mayor complejidad computacional que RIP? 14 
# 69. Explique como accede a Internet una pc vía Wireless. ¿El router usa NAT? ¿Si no tiene IP pública? ¿Si los AP tiene IP pub., hacen NAT? 14 
# 70. Ejercicio de ruteo (ver de prácticas) 14 
# 71. ¿Cuáles son los beneficios que introdujeron los protocolos orientados a conexión y los orientados a datagramas? ¿Cuál es actualmente más popular? 14
#  72. ¿Qué beneficios aporta la conmutación de paquetes a las comunicaciones por red? 14 
# 73. ¿Cómo se comporta el tráfico de una red telefónica en comparación con el generado, por ejemplo, por conexiones http? 14 
# 74. Describa el protocolo MPLS 14 
# 75. Describa un algoritmo de ruteo externo (entre sistemas autónomos) 15 Capa 4: Transporte (Transport) 15 
# 76. Describir protocolos de nivel 4: TCP, UDP 15 
# 77. ¿Cómo se efectúa la multiplexación en TCP? 15 
# 78. ¿Cómo se establece una conexión en TCP? ¿Cómo se libera? 15 
# 79. ¿Para qué se usa UDP? ¿Qué información agrega el header? 15 
# 80. ¿Qué control de errores se realiza en este nivel? Diferencias con nivel 2 16 2
#  81. ¿Cuáles son las principales diferencias entre la implementación de un servicio orientado a conexión de capa 4 con una de capa 2? 16 
# 82. ¿Qué es, cómo se calcula y para qué se usa el número de secuencia de un mensaje TCP? 16 
# 83. ¿Para qué sirve el puntero a urgente en TCP? 16 
# 84. ¿Cuáles son las soluciones para evitar (avoidance) la congestión de una red? 16 
# 85. Describir el mecanismo de Control de Congestión de TCP 16 
# 86. Explicar los mecanismos de control de congestión de lazo abierto y cerrado (impl/expl) 17 
# 87. Describa el funcionamiento el algoritmo RED para control de congestión 17 
# 88. ¿Cómo se calcula el MSS (maximum segment size) de TCP? 17 
# 89. ¿Cómo se calcula, setea y ajusta el Timeout de retransmisión en TCP? 17 
# 90. ¿Si se realiza control de flujo a nivel 2, para qué se necesita uno a nivel 4? ¿Por qué es más complejo realizarlo en este nivel? 17 
# 91. ¿Qué es un puerto y para qué sirve a nivel 4? 17 
# 92. Usando TCP en un canal libre de errores y con gran ancho de banda ¿cuál es el máximo throughput obtenido? 17 
# 93. Diferencias conceptuales entre protocolos de nivel 2 y 4 17 
# 94. ¿Cuándo se produce una pérdida de paquetes? ¿Qué asume el soft TCP? 17 
# 95. ¿Qué particularidad tiene el checksum de TCP? 17 
# 96. ¿Cómo puede efectuarse un ataque de DoS con TCP? 18 
# 97. ¿Cómo es posible extender la ventana del receptor en TCP? 18
#  98. Explique y fundamente qué mecanismos de TCP pueden analizarse bajo la Teoría de Control 18 
# 99. ¿Qué significa que TCP se comporta de manera equitativa frente a la congestión? ¿Cómo lo hace UDP? 18 
# 100. Describir cómo se llega al estado estacionario (steady state) en TCP (Reno) 18 
# 101. Por qué se asume un comportamiento de dientes de sierra para una conexión TCP? 18 
# 102. Dada la fórmula de Mathis ét al. para la performance del estado estacionario de TCP donde p es la probabilidad de error. 18 1.1.102.1 ¿Cómo se determina? 18 1.1.102.2 ¿qué diferencia hay entre esta ecuación con la de BW de un protocolo de nivel 2 en un enlace punto a punto sin errores? 18 1.1.102.3 ¿Cuál es la relación con la performance de un protocolo de nivel de enlace? 18 Capa 7: Aplicación (Application) 18
#  103. ¿Cómo se compone un sistema de mail? 18 
# 104. Describir el protocolo SMTP-* 18 
# 105. ¿Cómo se envían datos binarios por mail? 18
#  106. ¿Cuál se considera la Base de Datos distribuida más grande del planeta? ¿Por qué? 18 
# 107. ¿Por qué DNS utiliza paquetes UDP y no TCP? 19 
# 108. Dar una ventaja de utilizar un servidor de nombres contra uno de procesos 19 Seguridad 19 
# 109. ¿Cómo se aplica seguridad en las diferentes capas? 19 
# 110. Describa el algoritmo de clave pública-privada 19
#  111. ¿Cuáles son los conceptos principales a cumplir en términos de seguridad? 19 
# 112. ¿Cómo funciona el mecanismo de firma digital? ¿Qué algoritmo se utiliza? 20 
# 113. Explique un mecanismo para implementar no-repudiación: emisor y receptor 20 
# 114. ¿Existe un sistema criptográfico perfectamente seguro? 20 
# 115. ¿En qué principio se basa un mecanismo de seguridad implementado con MD5 o SHA? 20 
# 116. ¿Qué puede considerarse obsoleto en el protocolo de email actual? 20 
# 117. ¿Porqué se dice que HTTP es un protocolo orientado a texto? 20