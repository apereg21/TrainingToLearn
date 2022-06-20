const Block = require('../../block')
const SmartContract = require('../../smartContract')
const Transaction = require('../../transaction')
const controllerBlockchainDB = require('../database/controllerBlockchainDB')
const controllerUserDB = require('../database/controllerUserDB')
const controllerWalletDB = require('../database/controllerWalletDB')
const controllerUniRewardDB = require('../database/controllerUniRewardDB')
const controllerUniPointDB = require('../database/controllerUniPointDB')
const controllerTransactionsDB = require('../database/controllerTransactionsDB')
const controllerSContractDB = require('../database/controllerSContractDB')

module.exports = {
    async proveStateSC() {
        var smartContractList = await controllerSContractDB.getAllNotTerminatedSC()
        for (var i = 0; i < smartContractList.length; i++) {
            var sContract = new SmartContract(smartContractList[i].walletIdObserver, smartContractList[i].walletIdDemander, smartContractList[i].condition, smartContractList[i].UniRewardId)
            sContract.setDeliveredUniPoints(smartContractList[i].deliveredUniPoints)

            var userFromId = await controllerWalletDB.findUserAddressID(sContract.walletIdObserver)
            var userToId = await controllerWalletDB.findUserAddressID(sContract.walletIdDemander)
            var userFromDeleted = await controllerUserDB.isUserDeleted(userFromId)
            var userToDeleted = await controllerUserDB.isUserDeleted(userToId)

            var idsWallets = [userFromId, userToId]
            if (sContract.state != 1) {
                if (sContract.proveCompleteContract()) {

                    if (userFromId != null && userToId != null && userFromDeleted != true && userToDeleted != true) {

                        let uniRewardPurchase = await controllerUniRewardDB.getPurchaseField(sContract.UniRewardId)

                        if (!uniRewardPurchase && uniRewardPurchase != null) {

                            let lastNewIndex = await controllerBlockchainDB.getLastBlockIndex()
                            let prevNewHash = await controllerBlockchainDB.getHashLastBlock(lastNewIndex - 1)

                            let nameTo = await controllerWalletDB.getUserWalletName(userToId)
                            let nameUniReward = await controllerUniRewardDB.getUniRewardName(sContract.UniRewardId)
                            let concept = "Giving to " + nameTo + " the UniReward: " + nameUniReward
                            let newTransac = new Transaction(sContract.walletIdObserver, sContract.walletIdDemander, sContract.condition.length, sContract.UniRewardId, "U", idsWallets, concept)

                            var idsToChange = await controllerUniPointDB.getPointsToChange(userToId, sContract.condition.length, sContract.UniRewardId)
                            newTransac.setUniPointIds(idsToChange)

                            var privateKey = await controllerWalletDB.obtainPrivateKeyId(userFromId)
                            newTransac.signTransaction(privateKey, 0)
                            var privateKey2 = await controllerWalletDB.obtainPrivateKeyId(userToId)
                            newTransac.signTransaction(privateKey2, 1)

                            let transactionObjId = await controllerTransactionsDB.createTransaction(newTransac)

                            let newBlockSC = new Block(lastNewIndex, new Date(), [transactionObjId], prevNewHash)
                            newBlockSC.hash = newBlockSC.calculateHash()
                            await controllerBlockchainDB.createBlock(newBlockSC)

                            await controllerTransactionsDB.updateTransactionHash(transactionObjId, newBlockSC.hash)
                            await controllerUniPointDB.updateHashUniPoint(transactionObjId, sContract.UniRewardId, newBlockSC.hash)
                            await controllerUniRewardDB.updateHashUniReward(transactionObjId, sContract.UniRewardId, newBlockSC.hash)

                            sContract.endSmartContract(idsWallets, transactionObjId, idsToChange)
                            smartContractList.splice(i, 1)
                            console.log("OK - Smart Contract finalized, well done!")

                        } else {
                            console.log("UniReward already purchase or uniRewardId dosent exists. The contract is terminated")
                            sContract.terminateContract()
                            smartContractList.splice(i, 1)
                        }
                    } else {
                        console.log("One of the users dosent exists. The contract is terminated")
                        sContract.terminateContract()
                        smartContractList.splice(i, 1)
                    }
                } else {

                    console.log("The comprobation of Smart Contracts finalized")

                    if (userFromId == null || userToId == null || userFromDeleted == true || userToDeleted == true) {
                        console.log("One of the users dosent exists. The contract is terminated")
                        sContract.terminateContract()
                        smartContractList.splice(i, 1)
                    }
                }
            }
        }
    }
}