# Messenger System Design

Source: [MESSENGER___2K.pdf](<../../Scalar java backend contents/MESSENGER___2K.pdf>) (6 pages)

The source sketches a client/load-balancer/application-server architecture for a read/write-heavy messenger. It names message and conversation operations, multiple application servers, and Redis as a global key-value cache. The diagrams are handwritten and some labels are hard to read; this note separates the visible sketch from a coherent study design.

## 1. Clarify requirements first

Before designing storage or APIs, ask:

- Is messaging one-to-one, group, or both?
- Do users need message history, read receipts, delivery state, or typing indicators?
- Must online delivery be real-time? What should happen when a recipient is offline?
- What message ordering is required: per conversation or globally?
- What are the expected concurrent users, message rate, retention period, and attachment sizes?
- How should retries behave when a client cannot tell whether a send succeeded?

The title includes “2K,” but the scan does not make clear whether that is a capacity target or another note label. Do not treat it as a defined throughput or user requirement without checking the original assignment.

## 2. Source architecture sketch

```text
Clients
   -> Load balancer
   -> Application-server instances
        -> durable message/conversation storage
        -> Redis (global key-value cache, as noted in source)
```

The load balancer distributes requests across instances. Application instances should be replaceable; a user's conversation history should not depend solely on one server's local memory. Redis can accelerate hot metadata or recent messages, but the source does not establish that it is the durable message store.

The source calls the workload read/write heavy and names operations for sending messages, retrieving a user's conversations, and getting messages for a conversation.

## 3. Core entities

A relational starting point could be:

```text
User(user_id, display_name, ...)
Conversation(conversation_id, created_at, ...)
Participant(conversation_id, user_id, joined_at, role, ...)
Message(message_id, conversation_id, sender_id, body, created_at, sequence)
UserConversationState(user_id, conversation_id, last_read_sequence, muted, ...)
```

- `Participant` is the membership relation between users and conversations.
- `Message` belongs to one conversation and one sender.
- `UserConversationState` stores state that is specific to one participant's view of a conversation, such as a read cursor.

The exact fields and storage model depend on product requirements. For example, delivery/read state may be stored per message and recipient, or represented more compactly as per-user cursors.

## 4. API operations

The source's operation labels can be expressed conceptually as:

```text
sendMessage(conversationId, clientMessageId, body)
getConversations(userId, cursor, pageSize)
getMessages(conversationId, beforeSequence, pageSize)
```

These are illustrative interfaces, not source-prescribed endpoint names. For each operation, check authentication and conversation membership. Use pagination for conversation lists and message history rather than returning an unbounded result.

### Sending a message

1. Authenticate the sender and verify they belong to the conversation.
2. Validate message size/type and enforce any content rules.
3. Assign a stable message identifier and a per-conversation ordering value if required.
4. Persist the message durably.
5. Update or publish the conversation's latest-message state.
6. Notify online participants or enqueue delivery work.
7. Return an acknowledgement containing the stable message ID/order.

Persist before reporting durable success if the product promises a message will survive a server crash after acknowledgement. The exact guarantee should be stated in the design.

## 5. Ordering, retries, and duplicates

### Ordering

If messages must appear in order within a conversation, define who assigns that order. A per-conversation sequence, database ordering key, or partitioned log can provide an ordering point. Concurrent sends still need a deterministic rule; wall-clock timestamps alone can tie or drift across machines.

Global ordering across all conversations is usually unnecessary and much more expensive. State the smallest ordering guarantee that satisfies the product.

### Idempotency

A client may retry after a timeout even when the server already stored the message. Give the client a unique `clientMessageId` and enforce uniqueness scoped to the sender or conversation. On retry, return the existing result rather than creating a duplicate message.

### Pagination

Use a stable cursor such as the last-seen sequence or `(created_at, message_id)` ordering key. Offset pagination can become inefficient and unstable as new messages arrive.

## 6. Online and offline delivery

History retrieval and live delivery are separate concerns:

- **History:** retrieve durable messages from storage using a conversation cursor.
- **Live delivery:** push or notify connected clients after a message is persisted.
- **Offline users:** retain the message and let clients fetch it on reconnect; optional push notifications should not be treated as the durable message itself.

WebSockets or another long-lived connection can support server push, but require connection ownership, heartbeat, reconnect, and backpressure handling. The source does not specify a real-time transport, so this is an implementation option, not a recovered source requirement.

If sending a message must reliably trigger an event, consider committing the message and an outbox record together, then publishing the event asynchronously. Consumers should be idempotent because delivery may repeat.

## 7. Storage, partitions, and cache

### Partitioning

Partitioning message history by `conversation_id` makes it natural to fetch one conversation's messages in order. A very active conversation can become a hot partition, so measure skew and plan for high-volume conversations.

For a distributed store, choose a compound key/partition strategy based on both grouping and growth. A time bucket can limit partition size, but requires clients to query the relevant buckets.

### Redis and cache

Useful cache candidates may include:

- Conversation summaries or recent-message previews.
- Recently accessed metadata.
- Short-lived presence or connection state, if the product defines its consistency.

The durable message record should remain in persistent storage if messages must survive cache loss. Define cache expiration/invalidation on message write and behavior when Redis is unavailable. Cache misses should fall back to the source of truth.

## 8. Scaling and operations

- Scale stateless application instances behind a load balancer.
- Monitor request rate, message persistence latency, storage throughput, queue depth, cache hit rate, and active connections.
- Limit payload size, concurrent connections, and per-user send rates.
- Use bounded retries and timeouts for storage, cache, and notification dependencies.
- Plan retention, indexing, backups, and recovery for durable message history.
- Protect APIs with authentication and membership-based authorization.

The source's load balancer and multiple-server sketch addresses horizontal request handling; it does not by itself solve ordering, storage partitioning, delivery guarantees, or hot conversations.

## Quick self-check

1. Which message/conversation operations are named in the source?
2. Why should message history remain durable even when recent messages are cached?
3. How can a client retry avoid creating duplicate messages?
4. Why is per-conversation ordering a more useful requirement than global ordering?
5. What is the difference between history retrieval and online delivery?
6. How could a conversation-based partition key help and hurt?
7. Why is a cache miss or Redis outage not necessarily a message-loss event?

## Source page guide

- [Page 1](<../../Scalar java backend contents/MESSENGER___2K.pdf#page=1>): client/load-balancer/server sketch, message/conversation operations, read/write workload, and Redis note.
- [Pages 2–6](<../../Scalar java backend contents/MESSENGER___2K.pdf#page=2>): additional handwritten data, API, and scaling diagrams; exact labels are difficult to recover, so consult these pages before treating the proposed design as the original specification.

The entity fields, idempotency strategy, ordering mechanism, push-delivery flow, and operational checklist above are supplementary design guidance. The source scan does not specify them fully.
