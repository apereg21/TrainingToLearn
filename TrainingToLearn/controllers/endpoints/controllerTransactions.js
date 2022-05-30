const Transaction = require('../../transaction');
const SmartContract = require('../../smartContract')
const controllerTransactionsDB = require('../database/controllerTransactionsDB');
const controllerWalletDB = require('../database/controllerWalletDB');
const controllerUserDB = require('../database/controllerUserDB');
const controllerUniRewardDB = require('../database/controllerUniRewardDB');
const controllerSContractDB = require('../database/controllerSContractDB');
const controllerUniPointDB = require('../database/controllerUniPointDB');

module.exports = {
    async createTransactionObject(req, res) {
        let userToId, userDestAdd, userFromId, userInstructor, userFromAdd

        userDestAdd = await controllerWalletDB.findUserAddress(req.body.toAddressUN)
        userToId = await controllerWalletDB.findUserAddressID(userDestAdd)
        userFromAdd = await controllerWalletDB.findUserAddress("System")
        userFromId = await controllerWalletDB.findUserAddressID(userFromAdd)
        userInstructor = await controllerUserDB.obtainUserId(req.body.fromAddressUN, req.body.passwordFrom)


        if (userToId != null && userFromId != null) {

            let userToData = await controllerUserDB.getUserData(userToId)
            let userFromData = await controllerUserDB.getUserData(userFromId)
            let userInstructorData = await controllerUserDB.getUserData(userInstructor)
            let isUserToDeleted = userToData.deleted
            let isUserFromDeleted = userFromData.deleted
            let typeUserTo = userToData.typeUser
            let typeUserFrom = userInstructorData.typeUser


            if ((isUserToDeleted != null && isUserToDeleted == false) && (isUserFromDeleted != null && isUserFromDeleted == false) &&
                !(typeUserTo == "N" && typeUserFrom == "N") && (userInstructor != userToId)) {

                if (req.body.typeT == "M") {
                    if (userFromId != userToId) {

                        var idsWallets = [userFromId, userToId]
                        var idUniReward = await controllerUniRewardDB.getUniRewardId(req.body.uniRewardId)
                        let newTransac = new Transaction(userFromAdd, userDestAdd, req.body.moneyTo, idUniReward, req.body.typeT, idsWallets, req.body.concept)

                        let userMoneyWallet = await controllerWalletDB.getUserMoney(userFromId, idUniReward)

                        let isDeletedWallet1 = await controllerWalletDB.obtainDeleteField(userFromId, 1)
                        let isDeletedWallet2 = await controllerWalletDB.obtainDeleteField(userToId, 1)

                        if ((userToId != null && userFromId != null) && userMoneyWallet >= req.body.moneyTo &&
                            (!isDeletedWallet1 && !isDeletedWallet2) && newTransac.amount > 0 && idUniReward != null) {

                            let userRewardRecivierId = await controllerUniRewardDB.getUserIDFromReward(req.body.uniRewardId)
                            if (userRewardRecivierId == userToId) {

                                var idsToChange = await controllerWalletDB.paymentPersonToPerson(userFromId, userToId, req.body.moneyTo, idUniReward)
                                newTransac.setUniPointIds(idsToChange)

                                var sCList = await controllerSContractDB.getAllNotTerminatedSC()
                                for (var i = 0; i < sCList.length; i++) {
                                    if (sCList[i].UniRewardId == newTransac.UniRewardId) {
                                        (sCList[i].deliveredUniPoints).push(...idsToChange)
                                        console.log("\n================================" + sCList[i].deliveredUniPoints + "\n================================")
                                        await controllerSContractDB.updateDeliveredUP(sCList[i].deliveredUniPoints, newTransac.UniRewardId)
                                    }
                                }
                                sCList.splice(0, sCList.length)

                                var privateKeyFrom = await controllerWalletDB.obtainPrivateKeyId(userFromId)
                                var privateKeyTo = await controllerWalletDB.obtainPrivateKeyId(userToId)
                                newTransac.signTransaction(privateKeyFrom, 0)
                                newTransac.signTransaction(privateKeyTo, 1)

                                if (newTransac.isValid(1)) {
                                    let transactionObjId = await controllerTransactionsDB.createTransaction(newTransac)

                                    await controllerWalletDB.updateTransactionIds(idsWallets[0], transactionObjId)
                                    await controllerWalletDB.updateTransactionIds(idsWallets[1], transactionObjId)

                                    var response = []
                                    response.push(newTransac)
                                    response.push(transactionObjId)
                                    return response

                                } else {
                                    console.log("Can't do the payment - Reason: Something go wrong during the sign of transaction")
                                    res.send("Can't do the payment - Reason: Something go wrong during the sign of transaction")
                                }
                            } else {
                                console.log("Can't do the payment - Reason: Not the correct UniReward to delivery Unipoints to user")
                                res.send("Can't do the payment - Reason: Not the correct UniReward to delivery Unipoints to user")
                            }


                        } else if (userMoneyWallet < req.body.moneyTo) {

                            console.log("Can't do the payment - Reason: Amount of money in wallet is insuficient")
                            res.send("Can't do the payment - Reason: Amount of money in wallet is insuficient")

                        } else if (newTransac.amount <= 0) {

                            console.log("Can't do the payment - Reason: Amount of money can't be 0 cost or negative cost")
                            res.send("Can't do the payment - Reason: Amount of money can't be 0 cost or negative cost")

                        } else if (idUniReward == null) {

                            console.log("Can't do the payment - Reason: UniReward linked to the reward dosen't exist ")
                            res.send("Can't do the payment - Reason: UniReward linked to reward dosen't exist")

                        } else {

                            if (isDeletedWallet1 == true || isDeletedWallet2 == true) {

                                console.log("Can't do the payment - Reason: Not exist destiny or sender wallet")
                                res.send("Can't do the payment - Reason: Not exist destiny or sender wallet")

                            } else {

                                console.log("Can't finish the Transaction - Reason: Something gone wrong during the creation of transaction")
                                res.send("Can't finish the Transaction - Reason: Something gone wrong during the creation of transaction")

                            }
                        }

                    } else {

                        if ((userFromId == userToId)) {

                            console.log("Can't finish the Transaction - Reason: User From and User Destiny can't be the same")
                            res.send("Can't finish the Transaction - User From and User Destiny can't be the same")

                        } else if (userInstructor == userDestAdd) {

                            console.log("Can't finish the Transaction - Reason: Can't give Unipoints for itself")
                            res.send("Can't finish the Transaction - Reason: Can't give Unipoints for itself")

                        } else {

                            console.log("Can't finish the Transaction - Reason: Not correct parameters")
                            res.send("Can't finish the Transaction - Reason: Not correct paramaters")

                        }
                    }
                } else {
                    console.log("Can't finish the Transaction - Reason: Not correct type of transaction")
                    res.send("Can't finish the Transaction - Reason: Not correct type of transaction")
                }
            } else {
                if (typeUserTo == "N" && typeUserFrom == "N") {

                    console.log("Can't finish the Transaction - Reason: Destiny user or Emisor can't be are normal users")
                    res.send("Can't finish the Transaction - Reason: Destiny user or Emisor can't be are normal users")

                } else if (userInstructor == userToId) {

                    console.log("Can't finish the Transaction - Reason: Can't give Unipoints for itself")
                    res.send("Can't finish the Transaction - Reason: Can't give Unipoints for itself")

                } else {

                    console.log("Can't finish the Transaction - Reason: Destiny user or Emisor user dosen't exist")
                    res.send("Can't finish the Transaction - Reason: Destiny user or Emisor user dosen't exist")

                }


            }
        } else {

            console.log("Some isn't correct in params of username or password in Transaction")
            res.send("Some isn't correct in params of username or password in Transaction")

        }
    },
    async createAndUpdateTransactions(pendingTransactions, pendingIdsTransactions, newBlockHash) {
        for (var i = 0; i < pendingTransactions.length; i++) {
            console.log("=====================================================")
            console.log(pendingTransactions[i])
            console.log("=====================================================")
            var isExistTransaction = await controllerTransactionsDB.isExistTransaction(pendingIdsTransactions[i])
            var userFrom, userTo, transaction
            userFrom = await controllerUserDB.getUserData(pendingTransactions[i].idWalletFrom)
            userTo = await controllerUserDB.getUserData(pendingTransactions[i].idWalletTo)
            if (!isExistTransaction) {
                //Transaction not already created --> Transaction for create
                if (userFrom != null && userTo != null) {
                    var transactionObjId = await controllerTransactionsDB.createTransaction(pendingTransactions[i])

                    transaction = await controllerTransactionsDB.updateTransactionHash(transactionObjId, newBlockHash)
                    userFrom = await controllerUserDB.getUserData(transaction.idWalletFrom)
                    userTo = await controllerUserDB.getUserData(transaction.idWalletTo)

                    await controllerWalletDB.paymentToSystem(userFrom.id, transaction.uniPointIds, transaction.id)
                    await controllerUniRewardDB.updateHashUniReward(pendingIdsTransactions[i], transaction.UniRewardId, newBlockHash)

                    var uniReward = await controllerUniRewardDB.getUniReward(transaction.UniRewardId)
                    var addressTo = await controllerWalletDB.getUserWalletAddress(uniReward.WalletId)

                    var sContract = new SmartContract(transaction.fromAddress, addressTo, transaction.uniPointIds, transaction.UniRewardId)
                    await controllerSContractDB.createSmartContract(sContract)

                }
            } else {
                //Transaction already created --> Transaction only for update fields
                if (userFrom != null && userTo != null) {
                    transaction = await controllerTransactionsDB.updateTransactionHash(pendingIdsTransactions[i], newBlockHash)
                    userFrom = await controllerUserDB.getUserData(transaction.idWalletFrom)
                    userTo = await controllerUserDB.getUserData(transaction.idWalletTo)
                    if (transaction.typeTransaction == "U") {
                        await controllerUniRewardDB.updateHashUniReward(transaction.id, transaction.UniRewardId, newBlockHash)
                    }

                }
            }
            await controllerUniPointDB.updateHashUniPoint(transaction.id, transaction.UniRewardId, newBlockHash)
            await controllerWalletDB.updateTransactionIds(userFrom.id, transaction.id)
            await controllerWalletDB.updateTransactionIds(userTo.id, transaction.id)
        }
    }
}