const db = require('../../models')
module.exports = {
    async getBlock(indexNumber) {
        return db.Blockchain.findOne({
            where: {
                index: indexNumber
            }
        }).then(result => {
            return result
        }).catch((error) => console.log("Error: " + error));
    },
    async getLastBlockIndex() {
        return db.Blockchain
            .count()
            .then((result) => {
                console.log("LastBlock in blockchain found it: " + result)
                return result
            })
            .catch((error) => console.log("Error: " + error));
    },
    async createBlock(req) {
        return db.Blockchain.create({
            index: req.index,
            timestamp: Date.now(),
            idsTransactions: req.transactionIds,
            hash: req.hash,
            hashPrev: req.hashPrev
        }).then((result) => {
            console.log("The index of last creation is: " + result.index)
            return result.index
        }).catch((error) => console.log("Error: " + error));
    },
    async getHashLastBlock(lastIndex) {
        console.log("Last index is: " + lastIndex)
        if (lastIndex >= 0 && lastIndex != null && typeof lastIndex == 'number') {
            return db.Blockchain.findOne({
                where: {
                    index: lastIndex
                }
            }).then(result => {
                if (!result) {
                    console.log("Not found HashLastBlock")
                } else {
                    console.log("Found HashLastBlock")
                    return result.hash
                }

            })
        } else {
            console.log("Error in getHashLastBlock WrongLastIndexBlock")
        }

    },
    async obtainDataField(index) {
        return db.Blockchain.findOne({
            where: {
                index: index
            }
        }).then((result) => {
            console.log(result.data)
            return result.data
        })
    },
}