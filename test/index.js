const Client = require('../src/client');
const client = new Client('/tmp/nano');

async function start() {
  await client.connect();

  console.log(await client.call({ action: 'block_count' }));
  console.log(await client.call({ action: 'peers' }));

  client.disconnect();
}

start();
