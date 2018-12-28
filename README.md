# nano-ipc-js

A Javascript library for interacting with the experimental Nano currency node IPC.

The IPC client is responsible only for low-level communication and does not do any extra processing on the node response beyond JSON parsing. It has a request queue built in so that you can create multiple requests simultaneously without having to wait for previous ones to finish in your application code.

**This code is experimental and not production tested. Use at your own risk.**

## Example

```js
const { Client } = require('nano-ipc')

// Create a new Client with the default IPC path
const client = new Client()

// Connect to the IPC. This returns a Promise. If you don't wait for the connection
// to be established, you're gonna get an exception when attempting to call the IPC.
await client.connect()

// Send a request to the Nano node. This works exactly like the old RPC API. Returns a
// Promise with the Node response.
const resp = await client.call({ action: 'block_count' })
console.log(resp.count, resp.unchecked)

client.disconnect()
```

## API

### Client

#### constructor([path]) => Client

Creates a new IPC client.

- **path**: Path to the IPC socket on the local filesystem. Defaults to `/tmp/nano`.

#### call(request) => Promise

Sends a request to the Nano node.

- **request**: The request to send to the node, which should be an object as the client will handle JSON encoding for you.

Returns a Promise, which will receive the node response as a JSON decoded object when the request is completed.
