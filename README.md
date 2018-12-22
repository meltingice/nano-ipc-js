# nano-ipc-js

A Javascript library for interacting with the experimental Nano currency node IPC.

**This code is not production ready and is merely a proof-of-concept. Use at your own risk.**

## Example

```js
const { Client } = require('nano-ipc')
const client = new Client('/tmp/nano')
await client.connect()

const resp = await client.send({ action: 'block_count' })
console.log(resp.count, resp.unchecked);
```
