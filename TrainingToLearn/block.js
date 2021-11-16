const SHA256 = require('crypto-js/sha256')

class Block {
    constructor(index, timestamp, logroPin, data, hashPrev) {
        this.index = index;
        this.hash = this.calcularHash();
        this.timestamp = timestamp;
        this.logroPin = logroPin;
        this.data = data;
        this.hashPrev = hashPrev;
    }
    calcularHash() {
        return SHA256(this.index + this.timestamp + JSON.stringify(this.logroPin) + JSON.stringify(this.data) + this.hashPrev).toString();
    }
}
module.exports = Block