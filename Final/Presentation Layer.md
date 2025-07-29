
2025-07-28
**Tags:** #computer-networks 

The [[Application Layer]] sends data (characters and numbers) to the [[Presentation Layer]] and this one converts it to machine/binary format. Like from `ASCII`(American Standard Code for Information Interchange) to `EBCDIC`(**E**xtended **B**inary **C**oded **D**ecimal **I**nterchange **C**ode). Then it compresses the data to send less bytes (faster) and finally encrypts the compressed data for security.

1. `Translates` the data from `ASCII` to `EBCDIC`. e.g. A = HEX 41 in ASCII = HEX 61 in EBCDIC = 11000001
2. `Compresses` the translated data to reduce the amount of information to send. This process can be lossy or lossless.
3. `Encrypts/Decrypts` the compressed data for security. The presentation layer uses SSL Protocol (Secure Socket Layer Protocol) for encryption and decryption of data.

The [[Presentation Layer]] passes down **formatted, encoded, or encrypted application data** to the [[Session Layer]] for session management and communication.
# References

[OSI Model Explained](https://www.youtube.com/watch?v=vv4y_uOneC0&t=105s&ab_channel=TechTerms)

