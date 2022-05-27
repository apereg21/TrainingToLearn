const Block = require('../../block')
const controllerDB = require('../controllerDatabase')
module.exports = {
    async createBlockObject(pendingIdsTransactions) {
        let lastIndex = await controllerDB.getLastBlockIndex()

        if (lastIndex == 0) {

            var genesisBlock = new Block(lastIndex, new Date(), [], "0")
            genesisBlock.hash = genesisBlock.calculateHash()
            await controllerDB.createBlock(genesisBlock)
            lastIndex++
        }

        let prevHash = await controllerDB.getHashLastBlock(lastIndex - 1)

        let newBlock = new Block(lastIndex, new Date(), pendingIdsTransactions, prevHash)
        newBlock.hash = newBlock.calculateHash()
        return await controllerDB.createBlock(newBlock)
    },
    async isBlockchainValid() {
        var blockchainLength = await controllerDB.getLastBlockIndex()

        if (blockchainLength > 0) {

            const genesisBlock = await controllerDB.getBlock(0)
            var genesisBlockObj = new Block(genesisBlock.index, genesisBlock.timestamp, genesisBlock.idsTransactions, "0")

            //Prove that the genesis's block properties are valid
            if (genesisBlock.hash != genesisBlockObj.calculateHash()) {
                console.log("NO, the blockchain isn't valid")
                return false
            }

            //Prove that the rest of blocks properties are valid
            for (let i = 1; i < blockchainLength; i++) {

                const currentBlock = await controllerDB.getBlock(i);
                const previousBlock = await controllerDB.getBlock(i - 1);
                const blockCurrentObj = new Block(i, currentBlock.timestamp, currentBlock.idsTransactions, currentBlock.hashPrev)

                if (currentBlock.hash != blockCurrentObj.calculateHash()) {
                    console.log("NO, the blockchain isn't valid")
                    return false;
                }

                if (currentBlock.hashPrev != previousBlock.hash) {
                    console.log("NO, the blockchain isn't valid")
                    return false;
                }
            }
        }

        console.log("YES, the blockchain is valid")
        validBlockchain = true
        return true;
    }
}