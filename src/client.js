const net = require('net');
const { jspack } = require('jspack');

const RequestQueue = require('./request_queue');

const PROTOCOL_ENCODING = 1;
const PROTOCOL_PREAMBLE_LEAD = 'N';
const preamble = [PROTOCOL_PREAMBLE_LEAD, PROTOCOL_ENCODING, 0, 0];
const PACKED_PREAMBLE = Buffer.from(jspack.Pack('>cBBB', preamble));

module.exports = class Client {
  constructor(path = '/tmp/nano', options = {}) {
    this.path = path;
    this.socket = null;
    this.connected = false;
    this.autoConnect = options.autoConnect || true;
    this.queue = new RequestQueue(this);
  }

  connect() {
    return new Promise((resolve, reject) => {
      // Make this idempotent so that we can call connect as many times as we want
      if (this.connected) return resolve();

      this.socket = net.createConnection(this.path, () => {
        console.log('Connected to IPC!');
        this.connected = true;

        resolve();
      });

      this.socket.setTimeout(30000);
      this.socket.setKeepAlive(true);

      this.socket.on('data', this.onData.bind(this));
      this.socket.on('error', e => {
        this.connected = false;
        console.error(e.message);

        if (this.autoConnect) {
          console.error('Attempting reconnect in 5 seconds...');
          setTimeout(this.connect.bind(this), 5000);
        }
      });

      this.socket.on('end', () => {
        this.connected = false;
        console.log('Connection disconnected');
      });
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.socket.end(null, null, () => {
        this.connected = false;
        resolve();
      });
    });
  }

  onData(data) {
    if (this.listener) this.listener(data);
  }

  async call(obj) {
    if (!this.connected) await this.connect();
    return this.queue.push(obj);
  }

  // This will be called by the RequestQueue. Do not call this directly.
  _execute(obj) {
    return new Promise((resolve, reject) => {
      let responseLength;
      let response = '';
      this.listener = data => {
        let offset = 0;
        if (!responseLength) {
          responseLength = data.readUInt32BE(0);
          offset = 4;
        }

        response += data.toString('utf8', offset);
        if (response.length >= responseLength) {
          resolve(JSON.parse(response));
        }
      };

      const request = JSON.stringify(obj);
      this._write(PACKED_PREAMBLE);
      this._write(Buffer.from(jspack.Pack('>I', [request.length])));
      this._write(request);
    });
  }

  _write(data) {
    if (!this.socket.write(data)) throw new Error('Socket write failed');
  }
};
