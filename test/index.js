const Client = require('../src/client')
const client = new Client('/tmp/nano')

async function start() {
  await client.connect()
  console.log(await client.send({ action: 'block_count' }))
  console.log(await client.send({ action: 'peers' }))
}

start()
