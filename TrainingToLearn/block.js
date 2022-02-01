const SHA256 = require('crypto-js/sha256')

class Block {
    constructor(index, timestamp, transaction, hashPrev) {
        this.index = index;
        this.hash = "";
        this.timestamp = timestamp;
        this.transactionIds = transaction;
        this.hashPrev = hashPrev;
    }
    calculateHash() {
        return SHA256(this.index + this.timestamp + +JSON.stringify(this.transactionIds) + this.hashPrev).toString();
    }
}
module.exports = Block