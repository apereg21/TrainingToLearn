const db = require('../../models')
const controllerUniRewardDB = require('./controllerUniRewardDB');
const controllerWalletDB = require('./controllerWalletDB');
module.exports = {
    async updateSignatures(signatures, uniRewardId) {
        return db.SmartContract.update({
            signatureObserver: signatures[0],
            signatureDemander: signatures[1]
        }, {
            where: {
                UniRewardId: uniRewardId
            }
        }).then((result) => {
            console.log("SmartContract found it")
            return result.deliveredUniPoints
        }).catch((val) => { console.log(val) });
    },
    async createSmartContract(sContract) {
        return db.SmartContract.create({
            walletIdObserver: sContract.walletIdObserver,
            walletIdDemander: sContract.walletIdDemander,
            signatureObserver: sContract.signatureObserver,
            signatureDemander: sContract.signatureDemander,
            state: 0,
            condition: sContract.condition,
            deliveredUniPoints: sContract.deliveredUniPoints,
            UniRewardId: sContract.UniRewardId
        }).then((result) => {
            console.log("SmartContract Created")
            return result.id
        }).catch((val) => { console.log(val) });
    },

    async updateDeliveredUP(uniPoints, uniRewardId) {
        return db.SmartContract.update({
            deliveredUniPoints: uniPoints
        }, {
            where: {
                UniRewardId: uniRewardId
            }
        }).then((result) => {
            console.log("SmartContract found it")
            return result.deliveredUniPoints
        }).catch((val) => { console.log(val) });
    },

    async updateStateSC(uniRewardId) {
        return db.SmartContract.update({
            state: true
        }, {
            where: {
                UniRewardId: uniRewardId
            }
        }).then((result) => {
            console.log("SmartContract found it")
            return result.deliveredUniPoints
        }).catch((val) => { console.log(val) });
    },
    async getAllNotTerminatedSC() {
        return db.SmartContract.findAll({
            where: {
                state: false
            }
        }).then((result) => {
            if (result != null) {
                return result
            } else {
                return []
            }
        }).catch(() => {
            console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
            return []
        });
    },
    async getAllSmartContractsUser(userId) {
        var userDemanderPublicKey = await controllerWalletDB.getUserWalletAddress(userId)
        console.log("I'm publicKey " + userDemanderPublicKey)
        if (userDemanderPublicKey != null) {
            return db.SmartContract.findAll({
                where: {
                    walletIdDemander: userDemanderPublicKey
                }
            }).then(async(result) => {
                if (result != null) {
                    var finalSmartContractsArray = []
                    for (var i = 0; i < result.length; i++) {
                        var uniReward = await controllerUniRewardDB.getUniReward(result[i].UniRewardId)
                        console.log(uniReward)
                        var sContract = {
                            nameUR: uniReward.nameUR,
                            descriptionUR: uniReward.descriptionUR,
                            uniPointLess: "Owned " + result[i].deliveredUniPoints.length + " of " + result[i].condition.length,
                            condition: result[i].condition,
                            complete: result[i].state == true ? "Yes" : "No"

                        }
                        finalSmartContractsArray.push(sContract)
                    }
                    return finalSmartContractsArray
                } else {
                    return null
                }

            }).catch(() => {
                console.log("User data don't loaded - Reason: The database isn't correct, try to restore DB")
            })
        } else {
            return null
        }

    }
}