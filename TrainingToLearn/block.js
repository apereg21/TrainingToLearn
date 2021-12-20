const SHA256 = require('crypto-js/sha256')

class Block {
    constructor(index, timestamp, unireward, data, hashPrev) {
        this.index = index;
        this.hash = "";
        this.timestamp = timestamp;
        this.uniReward = unireward;
        this.data = data;
        this.hashPrev = hashPrev;
    }
    calculateHash() {
        return SHA256(this.index + this.timestamp + JSON.stringify(this.unireward) + JSON.stringify(this.data) + this.hashPrev).toString();
    }
}
module.exports = Block