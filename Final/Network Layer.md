
2025-07-28
**Tags:** #computer-networks 

Has the job of transmitting the recieved `segment` for computers in different networks. It's the layer where routers live. 
Wraps each `segment` into a `packet` by adding source and destination IP addresses.

The functions of the [[Network Layer]] are `logical addressing`, `routing` and `path determination`.

**Logical addressing**
The assignation of IPs. Every computer in a network has a unique ID called the IP address. The [[Network Layer]] assigns sender and recievers IP address to each segment to form an `IP Packet`. IP addresses are assigned to ensure that each data `packet` (wrapped segment) can reach the correct destination.

**Routing**
Method for moving data `packet` from source to destination and is based on the logical address format of IPV4 or IPV6 + a Mask. If we want to send a packet from 192.168.3.1 to 192.168.2.1, we actually want to send it to the 192.168.2.0/24 network. The last 1 is the device inside the network.

**Path determination**
There are a lot of ways to connect two computers. To choose the best possible path for data delivery from source to destination we use `path determination`. There are multiple protocols for this, like **OSPF** (Open Shortest Path First), **BGP** (Border Gateway Protocol), **IS-IS** (Intermediate System to Intermediate System).

The [[Network Layer]] passes the `packets` to the [[Data Link Layer]].

# References

[OSI Model Explained](https://www.youtube.com/watch?v=vv4y_uOneC0&t=105s&ab_channel=TechTerms)

