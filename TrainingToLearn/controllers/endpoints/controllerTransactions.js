const Transaction = require('../../transaction');
const SmartContract = require('../../smartContract')
const controllerTransactionsDB = require('../database/controllerTransactionsDB');
const controllerWalletDB = require('../database/controllerWalletDB');
const controllerUserDB = require('../database/controllerUserDB');
const controllerUniRewardDB = require('../database/controllerUniRewardDB');
const controllerSContractDB = require('../database/controllerSContractDB');
const controllerUniPointDB = require('../database/controllerUniPointDB');

module.exports = {
    proveParametersForTransaction(isUserToDeleted, isUserFromDeleted, typeUserTo, typeUserFrom, userInstructorDeleted, userInstructorId, userToId) {
        if (isUserToDeleted == null || isUserToDeleted != false) {
            return false
        }
        if (isUserFromDeleted == null || isUserFromDeleted != false) {
            return false
        }
        if (typeUserTo == "N" && typeUserFrom == "N") {
            return false
        }
        if (userInstructorId == userToId) {
            return false
        }
        if (userInstructorDeleted == true) {
            return false
        }
        return true
    },
    //Update the field of idsUniPoints in one transaction
    async updateIdsUniPointsField(pendingTransactions) {

        for (var i = 0; i < pendingTransactions.length; i++) {
            var idsUPToInclude = await controllerUniPointDB.getAllUniPointsForTransaction(pendingTransactions[i].UniRewardId);
            if (idsUPToInclude != null) {
                pendingTransactions[i].uniPointIds = idsUPToInclude
            }

        }
    },
    async createTransaction(req, res) {
        let userToId, userToAdd, userFromId, userInstructorId, userFromAdd

        userToAdd = await controllerWalletDB.findUserAddress(req.body.toAddressUN)
        userToId = await controllerWalletDB.findUserAddressID(userToAdd)
        userFromAdd = await controllerWalletDB.findUserAddress("System")
        userFromId = await controllerWalletDB.findUserAddressID(userFromAdd)
        userInstructorId = await controllerUserDB.obtainUserId(req.body.fromAddressUN, req.body.password)


        if (userToId != null && userFromId != null && userInstructorId != null) {

            let userToData = await controllerUserDB.getUserData(userToId)
            let userFromData = await controllerUserDB.getUserData(userFromId)
            let userInstructorData = await controllerUserDB.getUserData(userInstructorId)

            let isUserToDeleted = userToData.deleted
            let isUserFromDeleted = userFromData.deleted
            let typeUserTo = userToData.typeUser
            let typeUserFrom = userInstructorData.typeUser
            let userInstructorDeleted = userInstructorData.deleted

            if (this.proveParametersForTransaction(isUserToDeleted, isUserFromDeleted, typeUserTo, typeUserFrom, userInstructorDeleted, userInstructorId, userToId)) {

                if (req.body.typeT == "M") {
                    if (userFromId != userToId) {

                        var idsWallets = [userFromId, userToId]
                        var idUniReward = await controllerUniRewardDB.getUniRewardId(req.body.uniRewardId)
                        let newTransac = new Transaction(userFromAdd, userToAdd, req.body.moneyTo, idUniReward, req.body.typeT, idsWallets, req.body.concept)

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
                                    newTransac.id = transactionObjId
                                    await controllerWalletDB.updateTransactionIds(idsWallets[0], transactionObjId)
                                    await controllerWalletDB.updateTransactionIds(idsWallets[1], transactionObjId)

                                    var response = []
                                    response.push(newTransac)
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
                            console.log(userMoneyWallet + " equals to " + req.body.moneyTo)
                            console.log("Can't do the payment - Reason: Amount of money in wallet is insuficient")
                            res.send("Can't do the payment - Reason: Amount of money in wallet is insuficient")

                        } else if (newTransac.amount <= 0) {

                            console.log("Can't do the payment - Reason: Amount of money can't be 0 cost or negative cost")
                            res.send("Can't do the payment - Reason: Amount of money can't be 0 cost or negative cost")

                        } else if (idUniReward == null) {

                            console.log("Can't do the payment - Reason: UniReward linked to the reward dosen't exist ")
                            res.send("Can't do the payment - Reason: UniReward linked to reward dosen't exist")

                        } else {

                            console.log("Can't finish the Transaction - Reason: Something gone wrong during the creation of transaction")
                            res.send("Can't finish the Transaction - Reason: Something gone wrong during the creation of transaction")

                        }

                    } else {

                        if ((userFromId == userToId)) {
                            //
                            console.log("Can't finish the Transaction - Reason: User From and User Destiny can't be the same")
                            res.send("Can't finish the Transaction - User From and User Destiny can't be the same")

                        } else if (userInstructorId == userToId) {

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

                    console.log("Can't finish the Transaction - Reason: Emisor user can't be normal user")
                    res.send("Can't finish the Transaction - Reason: Emisor user or Emisor can't be normal user")

                } else if (userInstructorId == userToId) {

                    console.log("Can't finish the Transaction - Reason: Can't give Unipoints for itself")
                    res.send("Can't finish the Transaction - Reason: Can't give Unipoints for itself")

                } else {

                    console.log("Can't finish the Transaction - Reason: Emisor user dosen't exist")
                    res.send("Can't finish the Transaction - Reason: Emisor user dosen't exist")

                }

            }
        } else {

            console.log("Some isn't correct with username or password of Instructor")
            res.send("Some isn't correct with username or password of Instructor")

        }
    },
    async obtainAndUpdateAllPendingTransactions(pendingTransactions) {
        var idsAlreadyUsed = []
        var idsAlreadyUsedTransactions = []
        for (var i = 0; i < pendingTransactions.length; i++) {
            var lastID = await controllerTransactionsDB.getLastTransactionId()
            var isExistTransaction = await controllerTransactionsDB.isExistTransaction(lastID)
            var lastIDUniR = await controllerUniRewardDB.getLastUniRewardIndex()

            if (pendingTransactions[i].id == null) {


                if (isExistTransaction) {
                    pendingTransactions[i].id = lastID + 1
                } else {
                    if (idsAlreadyUsedTransactions.includes(lastID)) {
                        pendingTransactions[i].id = lastID + 1
                    } else {
                        pendingTransactions[i].id = lastID
                    }

                }

                idsAlreadyUsedTransactions.push(lastID)
            }

            if (pendingTransactions[i].UniRewardId == null) {

                if (idsAlreadyUsed.includes(lastIDUniR)) {
                    pendingTransactions[i].UniRewardId = lastIDUniR + 1
                } else {
                    pendingTransactions[i].UniRewardId = lastIDUniR
                }

                idsAlreadyUsed.push(pendingTransactions[i].UniRewardId)
            }
        }

        return idsAlreadyUsedTransactions
    },
    async createAndUpdateTransactions(pendingTransactions, newBlockHash) {
        for (var i = 0; i < pendingTransactions.length; i++) {
            console.log("=================== Prove Transaction" + pendingTransactions[i].id + "=======================")

            var isExistTransaction = await controllerTransactionsDB.isExistTransaction(pendingTransactions[i].id)
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
                    await controllerUniRewardDB.updateHashUniReward(pendingTransactions[i].id, transaction.UniRewardId, newBlockHash)

                    var uniReward = await controllerUniRewardDB.getUniReward(transaction.UniRewardId)
                    var addressTo = await controllerWalletDB.getUserWalletAddress(uniReward.WalletId)

                    var sContract = new SmartContract(transaction.fromAddress, addressTo, transaction.uniPointIds, transaction.UniRewardId)
                    await controllerSContractDB.createSmartContract(sContract)

                }
            } else {
                //Transaction already created --> Transaction only for update fields
                if (userFrom != null && userTo != null) {
                    transaction = await controllerTransactionsDB.updateTransactionHash(pendingTransactions[i].id, newBlockHash)
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
    },
}