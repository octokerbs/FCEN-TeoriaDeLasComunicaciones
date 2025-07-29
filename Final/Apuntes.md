
# Fundamentos

2 tipos de comunciacion. Entre capas de un mismo host (layer-to-layer communication) y entre la misma capa de dos hosts (peer-layer communication).

![[Pasted image 20250724110446.png]]

Se puede pensar al modelo OSI como un *decorator*. Desde la aplicacion enviamos informacion a la capa inferior, envuelve los datos con informacion extra y la envia a la capa de abajo, asi sucesivamente hasta la ultima capa. Preserva el contenido original mientras que le agrega cabeceras.

Cada capa solo se comunica con par en el otro extremo.

Las capas inferiores (Network, Link y Physical) no son end-to-end. Esperan que la informacion se envie y entienda por *nodos intermedios*. Este nodo intermedio pasara el mensaje al nodo final. **node-to-node**.

*Nodos intermedios*: `switches`, `hubs`, `routers` , etc. 

La primera capa que se comunica `end-to-end` es la capa de transporte.

# Teoria de la informacion

Cualquier mensaje, sin importar el canal, está en riesgo de una entrega incorrecta por culpa del ruido.
 
La semantica del mensaje es irrelevante para su transmision. Si nos importan los simbolos que se usan.

Teoremas de Shannon: 
1. Codificacion para una fuente sin ruido.
2. Codificacion para un canal ruidoso.

$$
I(E) = log \frac{1}{P(E)}
$$
$I$: La informacion que nos provee el suceso $E$.
$E$: Suceso que puede presentarse con probabilidad $P$.

Mientras mas probablididad hay de que se presente el suceso $E$, menos informacion nos brinda tal suceso. Si la probabilidad de que aparezca es es baja, la informacion recibida sera alta.

Si la probabilidad de que aparezca un simbolo es $s_{i}$ entonces la esperanza de una fuente $S$ se calcula como 
$$
\sum\limits_{s_{i}\in S}P(s_i)I(s_i)
$$
Si el suceso $E$ se mide en bits, entonces la informacion que provee es 0 o 1.

La entropia mide la cantidad de informacion que contiene una fuente $S$
$$
H(S) = - \sum\limits_{i=1}^{n}p(x_i).log_2(p(x_i))
$$
Alta entropia -> Cada simbolo es dificil de predecir.
Baja entropia -> Algunos simbolos son mucho mas probables que otros, o siempre se emite el mismo simbolo.

Ejemplo de la moneda:
$$
p(cara) = 0.5
$$
$$
p(cruz) = 0.5
$$
$$
H(S) = - 0.5 * log_{2}(0.5) - 0.5 * log_{2}(0.5) = -0.5 * (-1) - 0.5 * (-1) = 1bit
$$

La entropia es alta porque los resultados pueden variar sin ningun indicador. No sabemos si va a salir cara o cruz. Las probabilidades de eventos para la fuente son equiprobables.

Ejemplo de la moneda cargada:

$$
p(cara) = 0.99
$$
$$
p(cruz) = 0.01
$$
$$
H(S) = - 0.99 * log_{2}(0.99) - 0.01 * log_{2}(0.01) = -0.99 * (-0.0145) - 0.01 * (-6.644) = 0.08bit
$$
La entropia es baja porque casi siempre va a salir cara. Lo sabemos, eesta en su probabilidad.

## Codificacion

Contamos con un alfabeto fuente $\sum$.
Un *codigo* es un conjunto de simbolos del alfabeto fuente a un alfabeto codigo $X$.
Se quiere representar eficientemente la informacion eliminando la redundancia.

codigo bloque $C: \sum\limits \rightarrow X*$ que asigna a cada simbolo del alfabeto $\sum\limits$ una secuencia fija de simbolos de $X$.

$C1 : \{s1, s2, s3, s4\} → \{0, 1\}∗$
$C1(s1) = 0$ 
$C1(s2) = 11$ 
$C1(s3) = 01$ 
$C1(s4) = 101$

*codigo no singular* $\Longleftrightarrow$  Cada simbolo del alfabeto se asigna a una secuencia de bits diferente y no vacia.

*codigo unequivocamente decodificable* $\Longleftrightarrow$ Ninguna codificacion de un simbolo admite otra codificacion. El ejemplo de arriba es unequivocamente decodificable.  Si existiese un simbolo $s_5$ con codificacion $C1(s_5)$ = 1 entonces $C1(s_3)$ = 01 = $C1(s_1)C1(s_5)$, entonces no lo seria.

*codigo instantaneo* $\Longleftrightarrow$ Se pueden decodificar los simbolos sin necesidad conocer los siguientes. No hay prefijos en los codigos. El ejemplo de arriba no es instantaneo porque de $s3$ podemos obtener s1 o s3. (El codigo de s1 es prefijo del codigo de s3).

*codigo instantaneo* $\Longrightarrow$ *codigo unequivocamente decodificable*

*Longitud media de un codigo*
$$
L(C) = \sum\limits_{s \in S}|C(s)| . P(s)
$$
Se le llama *codificador optimo* al codigo de menor longitud para una misma fuente.

Usamos la probabilidad de que aparezca un simbolo para asignarle un codigo. Mientras mas probable sea, mas chico tiene que ser su codigo para que se tenga que transmitir menos informacion.

*Eficiencia de un codigo*
$$
\eta = \frac{H(S)}{L(C)} \leq 1
$$
$H(S)$: Cantidad minima teorica de bits promedio que necesitas por simbolo para representar la informacion sin perder nada.
$L(C)$: Longitud media del codigo que se esta usando.
$\eta$: Cuan cercano estamos al ideal.

Se asignan las palabras mas cortas a los simbolos mas probables. Para una codificacion optima se puede usar la *codificacion de Huffman*. Se arma un arbol de prioridades teniendo en cuenta la frecuencia de aparicion de cada simbolo en un mensaje.

Si $\eta$ = 1 entonces se dice que el codigo es optimo. Si $\eta$ < 1 entonces se estan usando mas bits de los necesarios. 

Se dice que una codificacion es sin perdida de informacion si:
$$H(S) \leq L(C)$$
Esto nos dice que no se puede comprimir una fuente por debajo de su entropia **sin perder informacion**. Si la longitud promedio es menor a la entropia entonces algo hicimos mal, en algun lado se pierde info.

|Concepto|Fórmula|Significado|
|---|---|---|
|Entropía mínima teórica|H(S)H(S)|Límite inferior de compresión|
|Longitud promedio del código|L(C)L(C)|Lo que realmente ocupa tu código|
|Eficiencia del código|η=H(S)L(C)\eta = \frac{H(S)}{L(C)}|Qué tan bueno es tu código|
|Teorema de codificación sin pérdida|H(S)≤L(C)H(S) \leq L(C)|No puedes superar el límite sin perder info|

## Medios de transmision reales

Los medios de transmision sufren de *ruido*. Cuando el mensaje es codificado a L bits, debe pasar a una codificacion de canal donde se le agrega redundancia pasando a tener una palabra de N bits. La redundancia puede ayudar a combatir el ruido. Si se quiere enviar un *1*, se envian 100 *1*s para combatir el ruido.

Del otro lado un codificador recibe el codigo de N bits y lo decodifica para volver a tener el mensaje de L bits. Luego se decodifica el codigo para obtener el mensaje original.

*Problemas de transmision*
1. `Atenuacion`: La intensidad de la señal disminuye con la distancia. La intensidad debe ser suficiente para ser detectada y mayor al ruido para que se reciba sin errores.
2. `Distorision de retardo`: La velocidad de propagacion varia con la frecuencia. Los diferentes componentes frecuenciales llegan al receptor en distintos instantes. Se produce desplazamiento de fase entre ellas.
3. `Ruido`: Señales adicionales entre el `transmisor` y el `receptor`. Hay ruido termico por la agitacion termica de los electrones. Hay ruido por intermodulacion por falta de linealidad en el canal, la diferencia de frecuencias. Ruido por diafonia cuando la señal de una linea interfiere con otra. Ruido impulsivo por impulsos electromagneticos irregulares, externos.

$C$: Velocidad teorica maxima de transmision en bits
$B$: Ancho de banda en Hertz (Hz = Veces / Segundo)
$N$: Ruido a traves del canal.
$BER$: Tasa de error en Hz.
$SNR$: Relacion señal-ruido. Definida como $SNR = 10^{\frac{dB}{10}}$ = $\frac{potencia-señal}{potencia-ruido}$. Mientras mas relacion señal ruido, mas potencia hay sobre el ruido lo que implica una mejor transmision de la informacion. Caso contrario, mala transmision.

## Capacidad del canal de Shannon

Si se aumenta el ancho de banda $B$ y la potencia de señal $S$, aumenta la velocidad de transmision $C$. Sin embargo, el aumento de ancho de banda aumenta el ruido *N* y un aumento de la potencia de señal $S$ aumenta el ruido intermodulacion. Por lo tanto, aumentar $B$ o $S$ no necesariamente es una solucion para mejorar la velocidad de transmision.

La capacidad de un canal, $C_{max}$  se mide como
$$
C_{max} = B * log_{2}(1 + SNR)
$$
# Nivel Fisico

Tenemos una fuente de informacion que emite simbolos. Esto compone un *mensaje*. El *mensaje* se pasa a un *transmisor*. El *transmisor* produce una señal que pasa un *canal* fisico. El *canal* tiene diferentes propiedades que pueden cambiar su nivel de *ruido*. No existe un canal ideal. La *señal* es recibida por un *receptor* que le entrega el mensaje *decodificado* al *destinatario*.

![[Pasted image 20250724155953.png]]
`Señales analogicas`: Señales continuas. Con evolucion continua en el tiempo e infinitos valores.
`Señales digitales`: Señales discretizadas. Cantidad finita de valores que puede tomar la funcion. 

Cuando grabamos el audio de la voz humana, pasamos de señal analogica a señal digital. Discretizamos la funcion continua. Hay perdida de informacion al discretizar. Tambien hay ruido en el canal (el aire) que afecta la percepcion de la señal continua por parte del sensor. 

`Ancho de banda`: Distancia entre la frecuencia minima y la frecuencia maxima que se puede transmitir por un canal determinado. Es el margen frecuencial en el que se puede usar el canal sin que se deteriore la fidelidad de la informacion.

Las transmisiones fisicas son *node-to-node* (next-hop) y no *end-to-end*. 

**Multiplexacion**: Hacer que una misma linea telefonica lleve diferentes comunicaciones *a la vez*. Se usan dos tecnologias para hacerlo.
1. **TDM**: Los usuarios toman turnos donde obtienen el ancho de banda completo por un periodo de tiempo acotado. Es como el round-robin para procesos en sistemas operativos. Le das el procesador entero al proceso actual. Se hacen los trabajos de manera concurrente.
2. **FDM**: Se divide el espectro de frecuencia en canales de ancho de banda acotado. Son exclusivos. Es como darle un CPU *debil* a cada proceso. No es tan bueno como el CPU *potente* exclusivo en TDM pero sirve. Se hacen los trabajos de manera paralela.

FDM requiere circuiteria analogica complicada. TDM puede manejarse con electronica digital. Se usa mas TDM.

Multiplexacion de longitud de onda: Una version de *FDM* que usa colores para separar las señales en el canal.

![[Pasted image 20250724161405.png]]

**VC** (Circuitos virtuales): Orientado a conexion. Se establece una ruta predeterminada para todos los paquetes.
**Datagramas**: Sin conexion. A nivel transporte puede ser orientado a conexion (TCP) o no orientado a conexion (UDP). En Datagramas cada paquete puede tomar una ruta diferente

Mientras mas bits existan por simbolo, mayor sera el BER (Bit Error Rate)


# Nivel de Enlace

Asumimos que el nivel fisico funciona correctamente. 

Separamos los *frames* en un tren de bits. Los *frames* pueden tener 
1. *largo fijo*
2. *largo especificado en el header* 
3. *delimitadores de frame*

![[Pasted image 20250724163047.png]]
*Eficiencia de un frame*

$$
\eta_{frame} = \frac{|datos|}{|frame|}
$$
## Tipos de servicio

1. Sin conexion y sin reconocimiento: No se sabe si los datos llegan o no, simplemente se envian.
2. Sin conexion y con reconocimiento: Se envian los datos y se asegura la correcta recepcion sin errores mediante el aviso explicito (**ACK**).
3. Orientado a conexion: Se mantiene una sesion para el envio y recepcion de datos.

## Deteccion y correccion de errores

Para garantizar la confiabilidad es necesario hacer retransmisiones. Estas pueden ser *implicitas* (cuando ocurre un time-out) se asume que el dato se perdio. *excplicitas* (Existen mensajes de control para pedir la repeticion del envio).

## Stop & Wait

Se envia el frame y se espera la confirmacion de recepcion. Cada frame debe ser reconocido. Se usa un time-out para dejar de esperar un *ACK* y no esperar infinitamente. Se generean reencarnaciones. *Como distinguimos cual fram es el que no llego correctamente a destino?* El remitente puedo haber enviado 3 frames y falla el del medio, solo llegaron 2 ack. Como sabemos que fue el del medio? -> Secuenciamos los frames. Los numeramos. Con 1 bit secuenciamos 2 frames. Con 2 bits secuenciamos 4 frames. Con 3 bits secuenciamos 8 frames, etc. 

Hay un tiempo de bloqueo mientras se esperan los **ACK** -> Se deja de usar el canal. Baja la eficiencia del canal.

Existen 4 situaciones en *Stop & Wait*

1. Emisor envia `frame`. El receptor envia `ACK`. El `ACK` llega antes del `timeout`.
2. Emisor envia `frame`. El receptor envia `ACK`. El `ACK` llega despues del `timeout`.  
3. Emisor envia `frame`. El receptor no le llega. El emisor lo envia de nuevo. El receptor envia `ACK`.
4. Emisor envia `frame`. El receptor envia `ACK`. El `ACK` llega despues del timeout. El emisor asume que no llego y lo vuelve a enviar. El `ACK` del envio anterior llega justo despues. El receptor asume que el siguiente `frame` sera diferente al que acaba de confirmar. **Reencarnaciones**, Se transmitio dos veces el mismo frame.
![[Pasted image 20250724172850.png]]

Eficiencia de un protocolo = Tiempo de transmision sobre tiempo de espera para la llegada de confirmacion.

$T_{tx}(F)$ = tiempo de transmision de un frame.
$RTT(F)$ = tiempo en ida y vuelta de un frame = $2 * Delay$ 
$$
\eta_{protocolo} = \frac{T_{tx}(F)}{RTT(F)}
$$
Aumentar eficiencia del protocolo $\Longrightarrow$ esperar lo minimo posible. Disminuir el delay o aumentar el tiempo de transmision de un frame.

Tiempo de transmision de una ventana
$$
\eta_{protocolo} = \frac{T_{tx}(V)}{RTT(F)}
$$

## Sliding window

Tratamos de maximizar el uso del canal. Se envian los frames en una ventana de emision. 
$$
SWS = \frac{V_{tx} * RTT}{|Frame|} *
$$
$SWS$ es la cantidad de frames que puede tener como mucho la ventana. Cada vez que se confirma un frame del limite superior, se envia uno nuevo. Se hace una ruleta con los indices. 

Dos tipos de *ACK*s. 
1. *ACK*s acumulativos. **GoBackN**: El receptor no envia el `ACK` del frame que no llego. Descarta todos los que lleguen a partir de ese numero. Por lo tanto, el emisor debe enviar todos los frames a partir del ultimo sin `ACK`. Si el frame que no llega es el primero, es la misma situacion que `Stop & Wait` donde se envian y esperan los `ACK` de los framees de a uno.
2. *ACK*s selectivos. El receptor tiene su propia ventana de frames para confirmar cuales llegaron y cuales no, el receptor le manda al emisor el numero de frame que *no llego*

El tamaño de la ventana receptora es SWS si usamos Sack y 1 si no. Esto es porque como mucho podemos 

## Delay

Tiempo que se tarda en mandar informacion de un punto a otro. 
$$
Delay = T_{tx}+ T_{prop} + T_{queue} + T_{proc}
$$
- $T_{tx}$: Tiempo de transmision. Tiempo requerido para empujar todos los bits de un paquete a el otro punto.
- $T_{prop}$: Tiempo de propagacion. Tiempo transcurrido entre el ultimo bit empujado hasta llegar al otro punto.
- $T_{queue}$: Tiempo de encolamiento. Tiempo en el que el paquete espera en un buffer hasta ser transmitido. Dependiendo de la congestion puede ser nulo o enorme.
- $T_{proc}$: Tiempo de procesamiento. Tiempo requerido para analizar el encabezado.
- $V_{tx}$: Velocidad de transmision del medio.
- $V_{prop}$: Velocidad de propagacion .

## Capacidad de volumen

Cantidad de bits que entran en el medio desde que se envia el primer bit hasta que este llega al receptor. Es decir, la cantidad de bits que entran en un canal a la vez.
$$
C_{vol} = Delay \times V_{tx}
$$
En el protocolo `end-to-end` en la capa de enlace se deberia calcular cuantos bits entran en el canal hasta recibir el primer `ACK`. Esto implica 
$$
C_{vol} = RTT \times V_{tx} = 2 \times Delay \times V_{tx}
$$
Es como que vas metiendo los bits en un tubo, como hay delay, todavia no llegaron pero podes seguir mandando. COmo que los bits se empujan. Eso hace el largon del canal y la velocidad de transmision es la catndiad que podes mandar a la vez.

## Acceso Multiples

**Medium Access Control Protocols**: Buscan maximizar, en promedio, el numero de exitos en los intentos de comunicacion y asegurar la igualdad de oportunidades entre todos los nodos competidores. (En un contexto de dispositivos disputando un medio fisico)

Un host recibe frames $\Longleftrightarrow$ esta destinado a
- Su direccion. `unicast`
- La direccion broadcast. `FF:FF:FF:FF:FF:FF`
- Direccion multicast. `suscripcion`
- Cualquier frame. `modo promiscuo`

**CSMA/CD** (Carrier sense multiple access with collision detection): Acceso multiple con sensado de portadora y deteccion de colisiones. Algoritmo de control de acceso a medios compartidos. 

Se quiere determinar si hay nodos transmitiendo. Cuando un host tiene datos para enviar, sensa el medio compartido.
1. Medio libre: El host transmite.
2. Medio ocupado: Espera a que se libere y transmite o espera a que se libere y transmite con probabilidad p.

El segundo caso del `medio ocupado` tiene mas sentido cuando tenemos multiples nodos tratando de transmitir en un mismo medio. Que cada uno transmita con una probabilidad P y vemos que no haya colision. Probabilidad p reduce el riesgo de colisiones.

La capa de enlace ofrece tres servicios:
1. Sin conexion y sin `ACK`. (CSMA)
2. Sin conexion y con `ACK`. (`end-to-end`).
3. Orientado a conexion. (`capa superior`).

## LAN (Local Area Network)

![[Pasted image 20250725124226.png]]
1. Se conectan de manera fisica. Un unico dominio de colision.
2. Se conectan a un bridge. Dos dominios de colision. En vez de un grupo de 8 son dos grupos de 4. Se reduce la probabilidad de colision.
3. Cada host se conecta a un switch y la data va a los buffers del switch.
![[Pasted image 20250725124643.png]]

En el bridge, el paquete se desarma y se vuelve a armar. Aun teniendo diferentes protocolos.

## Learning bridges. 

Los bridges aprenden en que segmento la red esta cada host. Si llega un frame, se lo mando a todos los hosts (`floodeo`) Esto garantiza que el frame llegue al receptor. De esta manera se reducen las colisiones, si llega un mensaje nuevo, como tenemos guardada la puerta por la que salio, sabemos por donde mandarlo sin floodear la red.

Relacionan direcciones MAC con interfaces. (puertos del bridge). 

*Si un host nunca emite un paquete, nunca sabremos donde esta*. Se aprende de donde vino el paquete y de quien. Pero no sabemos necesariamente cual fue el camino correcto del floodeo.

*Learning bridges* funciona $\Longleftrightarrow$ NO hay ciclos en la red.

![[Pasted image 20250725125843.png]]

- El host de la LAN 1 emite un frame en su segmento de red.
- Los dos bridges, B1 y B2, lo reciben y aprenden que el nodo esta en la interfaz inferior.
- Los dos bridges reenvian el frame a la interfaz superior.
- B1 recibe una copia del frame por la interfaz superior.
- B2 recibe una copia del frame por la interfaz inferior.
- Ambos aprenden que el host esta een el nodo superior, actualizando sus valores para el host.
- etc
- etc

Se generan loops infinitos. Para solucionarlo usamos *Spanning tree protocol*. Se construye una topologia logica sin ciclos para redes ethernet.

Se propaga informacion acerca de la topologia de la red de manera periodica. Los switches mantienen una foto del estao del sistema.

Cada switch decide si bloquea algun puerto para evitar los ciclos, en el caso superior podriamos cortar la conexion entre el host y B1. Que B2 le mande por el coso superior el mensaje.

1. Se elige un switch como root.
2. Cada switch aprende las distancias a root de todos sus vecinos.
3. Cada switch determina cual es la interfaz mas cercana al root.
4. Por cada LAN se elige una unica interfaz de un switch como designada, que tenga la distancia minima a root entre las posibles.

## Bridge Protocol Data Units

- ID del switch
- ID del root
- Distancia entre el switch y el root

Se cambia si y solo si: Se encuentra un BPDU con menor ID que root (nuevo root?) o  se identificaun BPDU con ID de root igual pero a menor distancia o el ID de root y la distancia son las mismas pero el ID del switch es menor.

## Interfaces

- Root Port: Puerto con menor distancia al root. Uno por switch,
- Designated Port: Puerto con menor distancia al root dentro de los switches conectadas a una lan.
- Blocked port: el resto de puertos que se inhabiitan para no generar ciclos.

# Nivel de Red: Ruteo

Como llegar desde una red a otra? 

*Ruteo interno* (Internal gateway protocol): Ruteo dentro de un sistema autonomo.
*Ruteo externo* (External gateway protocol): Ruteo entre distintos sistemas autonomos.

- Forwarding: Seleccionamos una puerto de salida en base a la direccion de destino y las tablas de ruteo.
- Routing: Proceso en el cual se construyen y actualizan las tablas de routeo.

Existen dos tipos de routeos, el estatico (configuracion manual) y el dinamico (configuracion automatica).

## Protocolos de routeo interno

**RIP** (Routing Information Protocol): Vector de distancias donde usamos *hops* para contarlas. A cuantos saltos estoy de x host? Cada nodo mantiene una tabla para todos los nodos. Los nodos se actualizan solo con respecto a sus vecinos. Se usa Bellman-Ford.

**OSPF** (Open Shortest Path First): Estado de enlaces. Se envia a toda la red informacion acerca de los vecinos (1984). Todos los nodos conocen todos los valores. Cada nodo descubre a sus vecinos y conoce sus direcciones de red. Mide el costo para cada uno de sus vecinos. Se construye un paquete con lo que acaba de aprender. See envia el paquete a los demas nodos. Se calcula la ruta mas corta a todos los nodos. Usando Dijkstra. 

Se inunda la red con info sobre los enlaces directamente conectados.


# Nivel de red: IP

Conmutacion sin conexion: Es como enviar una carta. Se envia la data asi nomas. Hay mas overhead porque cada paquete (datagrama) tiene mas datos de envio.
Conmutacion con conexion: Es como una llamada telefonica. Primero se establece la conexion (ambos endpoints estan de acuerdo con la llamada) y luego se envia la informacion. Cada switch mantiene una tabla de virtual circuits para routear los paquetes.


