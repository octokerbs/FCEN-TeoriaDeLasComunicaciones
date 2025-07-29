
2025-07-28
**Tags:** #computer-networks 

Controls the reliability of communications through segmentation, flow control, error control, connection and connection-less transmision.

**ONLY THE TRANSPORT LAYER DOES SEGMANTATION, THE REST OF THE LAYERS JUST ENCAPSULATES THIS SEGMENT**

**Segmentation**
Data recieved from the [[Session Layer]] is divided into small data units called **segments**. Each segment contains a **Source** and a **Destination** **PORT** number and a **Sequence** number. 

- **PORT Number** helps to direct each segment to the correct application. 
- **SEQUENCE Number** helps to reassemble the original segment in the correct order form.

**Flow Control**
[[Transport Layer]] controls the amount of data transmited to a level that the reciever can process. If we have a server that can transmit data at 100mbps but our phone can process data at just 10mbps then the [[Transport Layer]] will tell the server to slow down the data transmission rate up to 10mbps so that no data gets lost.

**Error Control**
If some data unit doesn't arrive to destination, the [[Transport Layer]] uses automatic repeat request schemes to retransmit the lost or corrupted data. Checksum is added to each data segment by the [[Transport Layer]] to find out erroneous recieved corrupted segment.

**Protocols**

**1 - TCP** (Transmision Control Protocol)
It's a connection oriented transmission. It stablishes a connection and checks if segments were sent correctly. Lost data will be retransmited. Used for information integrity like web pages, email, etc.

**2 - UDP** (User Datagram Protocol)
It's a connection-less transmission. Faster than **TCP**, doesn't provide any feedback. Lost data will not be retransmited. Used for real time services like music (if you lost packets, the movie is still playing at lower quality, it doesn't restart), videogames (if you lost packets, the server still runs, entities just update to the latest state).

The [[Transport Layer]] passess the data `segments` to the [[Network Layer]].
# References

[OSI Model Explained](https://www.youtube.com/watch?v=vv4y_uOneC0&t=105s&ab_channel=TechTerms)

