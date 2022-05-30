const Block = require('../../block')
const controllerBlockchainDB = require('../database/controllerBlockchainDB')
module.exports = {
    async createBlockObject(pendingIdsTransactions) {
        let lastIndex = await controllerBlockchainDB.getLastBlockIndex()

        if (lastIndex == 0) {

            var genesisBlock = new Block(lastIndex, new Date(), [], "0")
            genesisBlock.hash = genesisBlock.calculateHash()
            await controllerBlockchainDB.createBlock(genesisBlock)
            lastIndex++
        }

        let prevHash = await controllerBlockchainDB.getHashLastBlock(lastIndex - 1)

        let newBlock = new Block(lastIndex, new Date(), pendingIdsTransactions, prevHash)
        newBlock.hash = newBlock.calculateHash()
        return await controllerBlockchainDB.createBlock(newBlock)
    },
    async isBlockchainValid() {
        var blockchainLength = await controllerBlockchainDB.getLastBlockIndex()

        if (blockchainLength > 0) {

            const genesisBlock = await controllerBlockchainDB.getBlock(0)
            var genesisBlockObj = new Block(genesisBlock.index, genesisBlock.timestamp, genesisBlock.idsTransactions, "0")

            //Prove that the genesis's block properties are valid
            if (genesisBlock.hash != genesisBlockObj.calculateHash()) {
                console.log("NO, the blockchain isn't valid")
                return false
            }

            //Prove that the rest of blocks properties are valid
            for (let i = 1; i < blockchainLength; i++) {

                const currentBlock = await controllerBlockchainDB.getBlock(i);
                const previousBlock = await controllerBlockchainDB.getBlock(i - 1);
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