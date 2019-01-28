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
// Promise that resolves with the Node response. This library does no processing on the
// response data.
const resp = await client.call({ action: 'block_count' })
console.log(resp.count, resp.unchecked)

// If we don't disconnect when we're done interacting with the node IPC, your program will
// hang as there is still an active connection open.
client.disconnect()
```

## API

### Client

#### constructor([path], [options]) => Client

Creates a new IPC client.

- **path**: Path to the IPC socket on the local filesystem. Defaults to `/tmp/nano`.
- **options**
  - **autoConnect**: Will automatically connect to the IPC server when attemtping a call, if disconnected. This also allows you to automatically reconnect if the server ever disconnects. Default: true.

#### connect() => Promise

Connects to the node IPC. This is required before making any IPC calls, and you must wait for the connection to be completed. The returned Promise will resolve when connected.

#### call(request) => Promise

Sends a request to the Nano node.

- **request**: The request to send to the node, which should be an object as the client will handle JSON encoding for you.

Returns a Promise, which will receive the node response as a JSON decoded object when the request is completed.

#### disconnect() => Promise

Disconnects from the IPC connection. Returns a Promise that resolves when the connection is closed.

The IPC connection is persistent in order to make requests as fast as possible, so you must manually disconnect from the IPC when your program shuts down otherwise it will hang.
