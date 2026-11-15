# Socket Programming

Source: [SOCKET_PROGRAMMING__Start_at_9_10_PM_.pdf](<../../Scalar java backend contents/SOCKET_PROGRAMMING__Start_at_9_10_PM_.pdf>) (17 pages)

## What you will learn

- How an application uses a socket to send data through the network stack.
- How IP addresses and ports direct traffic to a host and application endpoint.
- How a TCP server and client establish and use a connection.
- How TCP and UDP differ, and why an application protocol still needs message boundaries.

## 1. Where sockets fit

Applications such as browsers and web servers need to exchange data across machines. The application uses a **socket API** exposed by the operating system; the OS and network stack handle transport and delivery details.

The source sketches the layers involved:

```text
Application protocol (for example, HTTP)
Transport protocol (TCP or UDP)
Internet/network layer (IP)
Link/physical network
```

An application chooses an appropriate transport and communicates through a socket. The socket is an abstraction and endpoint, not the physical network connection itself. The OS carries the data from the application through the layers and onto the network. See the [layer and socket diagrams on pages 1–8](<../../Scalar java backend contents/SOCKET_PROGRAMMING__Start_at_9_10_PM_.pdf#page=1>).

## 2. IP addresses, ports, and sockets

- An **IP address** identifies a host or network interface reachable through IP.
- A **port** identifies an application endpoint on that host.
- A **socket** is the operating-system/application endpoint used to communicate with a peer.

A client connects to a server's reachable IP address and listening port. For a TCP connection, the connection is distinguished by the transport protocol and the local and remote IP/port pair:

```text
(protocol, local IP, local port, remote IP, remote port)
```

Many clients can connect to the same server listening port. Each accepted connection has its own connected socket and peer endpoint, while the server's listening socket remains available for more clients.

## 3. TCP server lifecycle

A TCP server prepares a listening endpoint, then accepts clients:

1. **Create** a server socket.
2. **Bind** it to a local address and port so clients can find the service.
3. **Listen** for connection requests.
4. **Accept** a connection. This waits until a client connects.
5. **Read and write** through the connected socket to exchange bytes.
6. **Close** the connected socket when that client's session is complete.
7. Keep the listening socket open while the server should accept more clients; close it when the service stops.

```text
Server: create -> bind -> listen -> accept -> read/write -> close client
                                      |
                           listening socket remains open

Client: create -> connect to server IP:port -> read/write -> close
```

In Java, this is commonly represented by a `ServerSocket` that accepts connections and returns a connected `Socket`; the client uses a `Socket` to connect. The names and exact APIs vary across languages, but the roles are the same.

The source draws the server setup and the new socket produced for an accepted client on [pages 10–12](<../../Scalar java backend contents/SOCKET_PROGRAMMING__Start_at_9_10_PM_.pdf#page=10>).

## 4. TCP client and data exchange

A TCP client:

1. Creates a socket.
2. Connects to the server's IP address and port.
3. Sends and receives data using the connected socket.
4. Closes the connection when finished.

Both ends can send and receive over a TCP connection. The source diagrams the connection from the client's `connect` through the server's `accept`, followed by sending, receiving, and closing ([pages 13–15](<../../Scalar java backend contents/SOCKET_PROGRAMMING__Start_at_9_10_PM_.pdf#page=13>)).

### TCP is a byte stream

TCP delivers a reliable, ordered stream of bytes. It does **not** preserve the application's write boundaries. If a client writes one logical message, the server may receive it in multiple reads; several writes may also arrive together. A single `read` is not guaranteed to return a whole application message.

The application protocol must define **framing**, for example:

- a fixed-length message,
- a length prefix,
- a delimiter with appropriate escaping, or
- a structured stream format with explicit boundaries.

The sender and receiver must also agree on character encoding and message format. Handle partial reads/writes and orderly peer closure rather than assuming a single call completes an entire message.

## 5. TCP and UDP

| Property | TCP | UDP |
|---|---|---|
| Communication model | Connection-oriented byte stream | Independent datagrams |
| Ordering | Provides ordered delivery of bytes | Does not guarantee order |
| Delivery | Retransmits to provide reliable delivery while the connection remains viable | Does not guarantee delivery or retransmission |
| Message boundaries | Not preserved; the application defines framing | Each datagram is a message unit |
| Setup | Connection establishment before data exchange | No TCP-style connection setup |

With UDP, the application must handle any reliability, ordering, or retransmission requirements it needs. Datagrams can be lost, duplicated, reordered, or arrive too late, and their size is constrained by the network path.

Choose based on the application's requirements, not only on whether it is called a “client” or “server.” HTTP commonly uses TCP; other applications may choose UDP when datagram semantics and latency trade-offs fit.

## 6. Resource and error handling

A socket consumes operating-system resources and should be closed when no longer needed. Robust client/server code should also account for:

- connection failures and peer disconnects,
- timeouts for operations that might otherwise wait indefinitely,
- partial reads and writes,
- protocol-level message framing,
- limits on concurrent clients and queued work.

An open port alone does not prove that the service is healthy or that the application protocol is working.

## Quick self-check

1. What does an IP address identify, and what does a port identify?
2. Why does a server bind before listening?
3. What does `accept` return, and what happens to the listening socket?
4. In what order does a basic TCP client use its socket?
5. Why does TCP not guarantee that one `read` returns one application message?
6. Which properties does TCP provide that UDP does not guarantee?
7. What must an application using TCP define in addition to the connection?
8. Why should a server use timeouts and limits as well as closing sockets?

## Source page guide

- [Pages 1–3](<../../Scalar java backend contents/SOCKET_PROGRAMMING__Start_at_9_10_PM_.pdf#page=1>): application context, protocol layers, and network stack.
- [Pages 4–9](<../../Scalar java backend contents/SOCKET_PROGRAMMING__Start_at_9_10_PM_.pdf#page=4>): sockets as an OS/API abstraction and application endpoints.
- [Pages 10–12](<../../Scalar java backend contents/SOCKET_PROGRAMMING__Start_at_9_10_PM_.pdf#page=10>): server socket creation, binding, listening, and accepting clients.
- [Pages 13–15](<../../Scalar java backend contents/SOCKET_PROGRAMMING__Start_at_9_10_PM_.pdf#page=13>): client connection, send/receive flow, and closing sockets.
- [Pages 16–17](<../../Scalar java backend contents/SOCKET_PROGRAMMING__Start_at_9_10_PM_.pdf#page=16>): socket API overview and final connection/data-flow sketches.

The scan is handwritten and the code/API labels are not consistently legible. The page guide points to the original diagrams; use the PDF when exact handwritten labels matter.
