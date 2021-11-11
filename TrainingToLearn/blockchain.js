const Block = require('./block')
class Blockchain {
    constructor() {
        this.chain = [];
    }
    setChain(chainImport) {
        this.chain = chainImport
    }

    getChain() {
        return this.chain
    }

    lastIndex() {
        return this.chain.length
    }
    getLastBlock() {
        return this.chain[this.chain.length - 1]
    }
    addBlock(newBlock) {
        if (this.lastIndex < 1) {
            newBlock.hashPrev = "0"
        } else {
            newBlock.hashPrev = this.getLastBlock().hash
        }
        newBlock.hash = newBlock.calcularHash()
        this.chain.push(newBlock)
    }
    isBlockchainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash != currentBlock.calcularHash()) {
                return false;
            }

            if (currentBlock.hashPrev != previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}


module.exports = Blockchain