const db = require('../../models')
const SHA256 = require('crypto-js/sha256')
const { Op } = require("sequelize");

module.exports = {

    async getLastTransactionId() {
        return db.Transactions
            .count()
            .then((result) => {
                console.log("LastBlock in blockchain found it: " + result)
                return result + 1
            })
            .catch((error) => console.log("Error: " + error));
    },
    async createTransaction(transaction) {
        if (transaction.typeT == "M") {
            return db.Transactions.create({
                fromAddress: transaction.fromAddress,
                toAddress: transaction.toAddress,
                money: transaction.amount,
                typeTransaction: transaction.typeT,
                concept: transaction.concept,
                signatureFrom: transaction.signatureFrom,
                signatureTo: transaction.signatureTo,
                idWalletFrom: transaction.idWalletFrom,
                idWalletTo: transaction.idWalletTo,
                uniPointIds: transaction.uniPointIds,
                UniRewardId: transaction.UniRewardId
            }).then((result) => {
                console.log("Transaction Created")
                return result.id
            }).catch((val) => { console.log(val) });
        } else {
            return db.Transactions.create({
                fromAddress: transaction.fromAddress,
                toAddress: transaction.toAddress,
                money: transaction.amount,
                typeTransaction: transaction.typeT,
                concept: transaction.concept,
                signatureFrom: transaction.signatureFrom,
                signatureTo: transaction.signatureTo,
                UniRewardId: transaction.UniRewardId,
                idWalletFrom: transaction.idWalletFrom,
                idWalletTo: transaction.idWalletTo,
                uniPointIds: transaction.uniPointIds
            }).then((result) => {
                console.log("Transaction Created")
                return result.id
            }).catch((val) => { console.log(val) });
        }

    },
    async isExistTransaction(idT) {
        return db.Transactions.findOne({
            where: {
                id: idT
            }
        }).then((result) => {
            if (result != null) {
                return true
            } else {
                return false
            }
        })

    },
    async updateTransactionHash(pendingTransactionId, hashBlock) {
        return db.Transactions.findOne({
            where: {
                id: pendingTransactionId
            }
        }).then((result) => {
            if (result != null) {
                return db.Transactions.update({
                    hash: SHA256(pendingTransactionId + hashBlock).toString()
                }, {
                    where: {
                        id: pendingTransactionId
                    }
                }).then(() => {
                    console.log(SHA256(pendingTransactionId + hashBlock).toString())
                    return result
                })
            } else {
                return null
            }
        })
    },

    async getUserWalletTransaction(idWallet) {
        return db.Transactions.findAll({
            where: {
                [Op.or]: [{ idWalletFrom: idWallet }, { idWalletTo: idWallet }]
            }
        }).then((result) => {
            if (result != null) {
                console.log("Transactions find asociated to concrete Wallet")
                return result
            } else {
                console.log("No Transactions find asociated to concrete Wallet")
                return null
            }
        }).catch((val) => { console.log(val) })
    },

    async getConcreteTransaction(id) {
        return db.Transactions.findOne({
            where: {
                id: id
            }
        }).then((result) => {
            if (result != null) {
                console.log("Transaction find")
                return result
            } else {
                console.log("No Transactions find")
                return null
            }
        }).catch((val) => { console.log(val) })
    }
}