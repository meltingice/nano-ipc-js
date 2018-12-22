const net = require('net')
const { jspack } = require('jspack')

const PROTOCOL_ENCODING = 1
const PROTOCOL_PREAMBLE_LEAD = 'N'
const PROTOCOL_VERSION_MAJOR = 1
const PROTOCOL_VERSION_MINOR = 0
const preamble = [PROTOCOL_PREAMBLE_LEAD, PROTOCOL_ENCODING, PROTOCOL_VERSION_MAJOR, PROTOCOL_VERSION_MAJOR]
const PACKED_PREAMBLE = new Uint8Array(jspack.Pack('>cBBB', preamble))

module.exports = class Client {
  constructor(path) {
    this.path = path
    this.socket = null
    this.connected = false
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection(this.path, () => {
        console.log('Connected to IPC!')
        this.connected = true

        resolve()
      })

      this.socket.setTimeout(15000)
      this.socket.on('timeout', () => {
        console.log('Socket timed out')
        this.disconnect()
      })

      this.socket.on('data', this.onData.bind(this))
      this.socket.on('end', () => {
        this.connected = false
        console.log('Connection disconnected')
      })
    })
  }

  disconnect() {
    this.socket.end(null, null, () => {
      this.connected = false
      console.log('Disconnected from IPC')
    })
  }

  onData(data) {
    if (this.listener) this.listener(data)
  }

  send(obj) {
    if (!this.connected) {
      throw new Error('IPC connection is not open')
    }

    return new Promise((resolve, reject) => {
      let responseLength
      let response = ''
      this.listener = data => {
        let offset = 0
        if (!responseLength) {
          responseLength = data.readUInt32BE(0)
          offset = 4
        }

        response += data.toString('utf8', offset)
        if (response.length >= responseLength) {
          resolve(JSON.parse(response))
        }
      }

      const request = JSON.stringify(obj)

      this._write(PACKED_PREAMBLE)
      this._write(new Uint8Array(jspack.Pack('>I', [request.length])))
      this._write(request)
    })
  }

  _write(data) {
    if (!this.socket.write(data)) throw new Error('Socket write failed')
  }
}
