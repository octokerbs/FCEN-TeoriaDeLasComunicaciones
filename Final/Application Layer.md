
2025-07-28
**Tags:** #computer-networks 

Used by network applications. Applications that use the internet. All network applications are dependant on `application layer protocols`.


**1 - TELNET** (Teletype Network)  
Used for terminal emulation.  It allows Telnet clients to access the resources of the Telnet server. Used for file managment on the internet. 

Default Port: 23

```bash
telnet [\\RemoteServer]  
```


**2 - FTP** (File Transfer Protocol)
Used for file transfer between two computers. 

Default Port: 20 (data) and 21 (control).

```bash
ftp machinename
```


**3 - TFTP** (Trivial File Transfer Protocol)
It's a technology for transferring files between network devices and is a simplified version of FTP.

Default Port: 69

```bash
tftp [ options... ] [host [port]] [-c command]
```


**4 - NFS** (Network File System)
It allows remote hosts to mount file systems over a network and interact with those file systems as though they are mounted locally.

Default Port: 2049

```bash
service nfs start
```


**5 - SMTP** (Simple Mail Transfer Protocol)
SMTP moves your email on and across networks. It works closely with something called the Mail Transfer Agent (MTA) to send your communication to the right computer and email inbox

Default Port: 25

```bash
MAIL FROM:<mail@abc.com?
```


**6 - LPD** (Line Printer Daemon)
It is designed for printer sharing. It is the part that receives and processes the request.

Default Port: 515

```bash
lpd [ -d ] [ -l ] [ -D DebugOutputFile]
```


**7 - X window**
Protocol for the writing of graphical user interface–based client/server applications. The idea is to allow a program, called a client, to run on one computer. The **X server** runs **on your computer**, and it **displays** windows, handles **keyboard/mouse input**, etc. The **X clients** are the **applications** (like Firefox, GIMP, xterm) that **ask** the X server to draw windows or receive input. 

Example: When you open Firefox, it sends drawing commands to the X server. The server draws the window and sends back input events.

Normally, a **server** is a big machine somewhere and **clients** are your apps. But in X, the **display server runs on your local machine**, and the **apps are the clients**.

`Think of the X server as a canvas, and the apps as painters sending commands`

Default Port: 6000 (increases by 1 for each server)

```bash
Run xdm in runlevel 5
```


**8 - SNMP** (Simple Network Managment Protocol)
Is primarily used to **gather data from networked devices** — like routers, switches, servers, sensors, and more — using a **polling mechanism**. It is a way that servers can share information about their current state, and also a channel through which an administrate can modify pre-defined values.

Default Port: 161(TCP) and 162(UDP)

```bash
snmpget -mALL -v1 -cpublic snmp_agent_Ip_address sysName.0
```


**9 - DNS** (Domain Name Server)
Every time you use a domain name, therefore, a DNS service must translate the name into the corresponding IP address.

Default Port: 53

```bash
dig dc.uba.ar
```


**10 - DHCP** (Dynamic Host Configuration Protocol) 
A network protocol that automates the assignment of IP addresses and other network configuration details to devices on a network. It gives IP addresses to hosts. There is a lot of information a DHCP server can provide to a host when the host is registering for an IP address with the DHCP server.

- You bring your laptop to a coffee shop.
- You connect to Wi-Fi.
- Behind the scenes:
    - Your laptop broadcasts a `DHCPDISCOVER`.
    - The router replies with a `DHCPOFFER` (e.g., IP `192.168.1.42`, lease 1 hour).
    - Your laptop accepts.
    - You're online with no manual setup.

Default Port: 67, 68

```bash
sudo dhclient eth0
sudo tcpdump -i eth0 port 67 or port 68 -n -vv
DHCP Discover from 08:00:27:12:34:56
DHCP Offer from 192.168.1.1
DHCP Request from 08:00:27:12:34:56
DHCP ACK from 192.168.1.1
```


**11 - HTTP/HTTPS** (Hypertext Trasnfer Protocol / Hypertext Trasnfer Protocol Secure)
A stateless protocol; used to access data from the World Wide Web. The Hypertext is the well-organized documentation system that is used to link pages in the text document. 

HTTP is based on the client-server model. It uses TCP for establishing connections.

Default Port: 80 

```bash
curl http://example.com
curl https://example.com
```


**12 - POP** (Post Office Protocol)
This is a simple protocol used by User agents for message retrieval from mail servers. It uses TCP for establishing connections. 

POP works in dual mode- __Delete mode, Keep Mode__. In Delete mode, it deletes the message from the mail server once they are downloaded to the local system. In Keep mode, it doesn't delete the message from the mail server and also facilitates the users to access the mails later from the mail server.

Default Port: 110

```bash
telnet mail.example.com 110
+OK POP3 mail server ready
USER alice@example.com
+OK User accepted
PASS mysecretpassword
+OK Logged in.
```


**13 - IRC** (Internet Relay Chat)
 It is a text-based instant messaging/chatting system. IRC is used for group or one-to-one communication. It also supports file, media, data sharing within the chat. It uses TCP or TLS for connection establishment.

Default Port: 6667

```bash
telnet irc.example.net 6667
:irc.example.net NOTICE AUTH :Welcome to the IRC server
NICK cooluser
USER cooluser 0 * :Cool User
:irc.example.net 001 cooluser :Welcome to IRC!
JOIN #linux
:cooluser!~cooluser@host JOIN #linux
PRIVMSG #linux :Hello, world!
<cooluser> Hello, world!
```


**14 - MIME** (Multipurpose Internet Mail Extension)
Designed to extend the capabilities of the existing Internet email protocol like SMTP. MIME allows non-ASCII data to be sent via SMTP. It allows users to send/receive various kinds of files over the Internet like audio, video, programs, etc. MIME is not a standalone protocol it works in collaboration with other protocols to extend their capabilities.

Default Port: 25

```http
Content-Type: multipart/mixed; boundary="boundary123"

--boundary123
Content-Type: text/plain

Hello! This is a plain text message.

--boundary123
Content-Type: image/png
Content-Disposition: attachment; filename="cat.png"
Content-Transfer-Encoding: base64

iVBORw0KGgoAAAANSUhEUgAAA...
--boundary123--
```

The [[Application Layer]] passes **raw user data or application-generated data** (e.g., text, images, files) to the [[Presentation Layer]], which then prepares it for transmission by **formatting, encrypting, or compressing it**.

# References

[OSI Model Explained](https://www.youtube.com/watch?v=vv4y_uOneC0&t=105s&ab_channel=TechTerms)
[Protocols](https://www.geeksforgeeks.org/computer-networks/protocols-application-layer/)

