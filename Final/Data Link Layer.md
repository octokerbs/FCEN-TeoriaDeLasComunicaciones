
2025-07-28
**Tags:** #computer-networks 

Recieves data `packets` from the [[Network Layer]]. Data `packets` contain IP addresses of senders and recievers. Wraps each `packet` into a `frame` by adding `MAC addresses`, frame control and Cyclic redundancy check.

There are two kinds of addressing. *Logical addressing* and *Physical addressing*. 

**Logical Addressing**
It's done at the [[Network Layer]] where sender's and reciever's IP addresses are assigned to each data `segment` to form a data `packet`.

**Physical Addressing**
Done at the [[Data Link Layer]] where both sender's and reciever's MAC addresses are assigned to each `packet` to form a frame. A MAC address is a 12 digit alphanumeric number embedded in NIC of your computer by manufacturer.

The [[Data Link Layer]] controls how data is placed and recieved from the media using techinques like *Media Access Control* and *Error Detection*.

If we want to send a message from computer `A` to computer `B`. The computer `A` encapsulates the `IP Packet` from message `M` into a `frame` `F`. This is frame `F` is passed to the router who de-encapsulates the `packet` and encapsultaes it with a new `frame` to reach router 2. Router 2 de-encapsulates the frame `FN` and encapsulates it again with different headers to send it to the computer `B` who finally de-encapsulates it and reads the message `M`.

![[Pasted image 20250728223727.png]]

**Media Access Control**
It is possible that 2 or more devices are connected to the same media control (3 computers connected to the same medium like the WIFI network). If 2 of this 3 computers want to send data at the same time, we encounter a collision that makes both messages useless. To avoid it, we use different strategies to access the media again. Like the [[Data Link Layer]] keeping an eye for when the media is free to use (CSMA - Carrier Sense Multiple Access) 

The [[Data Link Layer]] passes the `frames` to the [[Physical Layer]].


# References

[OSI Model Explained](https://www.youtube.com/watch?v=vv4y_uOneC0&t=105s&ab_channel=TechTerms)

