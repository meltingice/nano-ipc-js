// An async queue that ensures we only send and listen for one
// request from the IPC API at a time. If we don't, then responses
// start to mix together and we can't parse them.
module.exports = class RequestQueue {
  constructor(client) {
    this.client = client;
    this.queue = [];
    this.processing = false;
  }

  push(obj) {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, obj });
      if (!this.processing) this._process();
    });
  }

  async _process() {
    this.processing = true;

    const item = this.queue.shift();

    try {
      item.resolve(await this.client._execute(item.obj));
    } catch (e) {
      item.reject(e);
    } finally {
      if (this.queue.length > 0) {
        this._process();
      } else {
        this.processing = false;
      }
    }
  }
};
