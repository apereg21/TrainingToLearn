const UniReward = require("../../uniReward")
const Transaction = require("../../transaction")
const controllerUniRewardDB = require("../database/controllerUniRewardDB");
const controllerWalletDB = require("../database/controllerWalletDB");
const controllerUserDB = require("../database/controllerUserDB");
const controllerTransactionDB = require("../database/controllerTransactionsDB");
const controllerUniPointDB = require("../database/controllerUniPointDB");

module.exports = {
    async createUniReward(pendingUniRewards, arrayPoints, newBlockHash) {
        var arrayOfUniRewards = []
        for (var i = 0; i < pendingUniRewards.length; i++) {
            var userWalletDeleted = await controllerUserDB.isUserDeleted(pendingUniRewards[i].WalletId)
            if (!userWalletDeleted) {
                arrayOfUniRewards.push(await controllerUniRewardDB.createUniReward(pendingUniRewards[i], newBlockHash))
            }
        }
        if (!arrayOfUniRewards.includes(false)) {
            await controllerUniPointDB.createPoints(arrayPoints)
        }
    },
    async createUniRewardObject(res, req, pendingUniRewards, arrayPoints, pendingTransactions) {
        let idUserInstructor = await controllerUserDB.obtainUserId(req.body.username, req.body.password)
        let userInstructoDeleted = await controllerUserDB.isUserDeleted(idUserInstructor)
        let isUserDelete = await controllerUserDB.isUserDeleted(idUserInstructor)

        if (idUserInstructor != null && !isUserDelete && req.body.costReward > 0 && !userInstructoDeleted) {

            let userType = await controllerUserDB.obtainUserType(idUserInstructor)

            if (userType == "I") {

                let systemAddress = await controllerWalletDB.findUserAddress("System")
                let uniRewardReciverAddress = await controllerWalletDB.findUserAddress(req.body.usernameCourse)

                if (systemAddress != null && uniRewardReciverAddress != null) {

                    let userFromId = await controllerWalletDB.findUserAddressID(systemAddress)
                    let userToId = await controllerWalletDB.findUserAddressID(uniRewardReciverAddress)
                    if (idUserInstructor != userToId) {

                        var uniReward = new UniReward(req.body, userToId)
                        uniReward.getAndSetLastId()
                        console.log("=================uniReward.id first======================")
                        console.log(uniReward.id)
                        console.log("==================================================")
                        var alreadyExistURId = false
                        var lastIdUniReward = await controllerUniRewardDB.getLastUniRewardIndex()
                        if (uniReward.proveNotNullObject() != true) {

                            for (var i = 0; i < pendingUniRewards.length; i++) {
                                if (pendingUniRewards[i].id == lastIdUniReward) {
                                    alreadyExistURId = true
                                }
                            }

                            if (alreadyExistURId) {
                                uniReward.id = (pendingUniRewards[pendingUniRewards.length - 1].id) + 1
                            }
                            console.log("=================uniReward.id second======================")
                            console.log(uniReward.id)
                            console.log("==================================================")
                            pendingUniRewards.push(uniReward)
                            var idsWallets = [userFromId, userFromId]

                            let isDeletedWallet1 = await controllerWalletDB.obtainDeleteField(userFromId, 1)
                            let isDeletedWallet2 = await controllerWalletDB.obtainDeleteField(userToId, 1)
                            let concept = "Giving UniPoints referrer to UniReward: " + uniReward.nameUR

                            if (!isDeletedWallet1 && !isDeletedWallet2) {

                                let newTransac = new Transaction(systemAddress, systemAddress, uniReward.cost, uniReward.id, "U", idsWallets, concept)
                                newTransac.getAndSetLastTransactionId()
                                var lastIdTrans = await controllerTransactionDB.getLastTransactionId()
                                var alreadyExistTransId = false

                                for (var j = 0; j < pendingTransactions.length; j++) {
                                    if (pendingTransactions[j].id == lastIdTrans) {
                                        alreadyExistTransId = true
                                    }
                                }
                                if (alreadyExistTransId) {
                                    newTransac.id = pendingTransactions[pendingTransactions.length - 1].id + 1
                                }

                                let userWalletId = await controllerWalletDB.obtainWalletId(userFromId)

                                var lastIdUniPoint = await controllerUniPointDB.getLastIdUP()
                                var arrayUniPointsIds = []
                                for (var i = 0; i < req.body.costReward; i++) {

                                    var alreadyExistUPId = false
                                    var realIdUniPoint

                                    for (var j = 0; j < arrayPoints.length; j++) {
                                        if (arrayPoints[j].id == lastIdUniPoint) {
                                            alreadyExistUPId = true
                                        }
                                    }


                                    if (alreadyExistUPId) {
                                        realIdUniPoint = arrayPoints[arrayPoints.length - 1].id + 1
                                    } else {
                                        realIdUniPoint = lastIdUniPoint
                                    }

                                    var jsonObj = {
                                        id: realIdUniPoint,
                                        timestamp: new Date(),
                                        UniRewardId: uniReward.id,
                                        WalletId: userWalletId
                                    }
                                    arrayPoints.push(jsonObj)
                                    arrayUniPointsIds.push(jsonObj.id)
                                }
                                console.log("=================arrayUniPointsIds======================")
                                console.log(arrayUniPointsIds)
                                console.log("==================================================")

                                newTransac.setUniPointIds(arrayUniPointsIds)

                                console.log("=================arrayUniPointsIds======================")
                                console.log(newTransac.uniPointIds)
                                console.log("==================================================")

                                arrayUniPointsIds.splice(0, arrayUniPointsIds.length)
                                var privateKeyFrom = await controllerWalletDB.obtainPrivateKeyId(userFromId)
                                newTransac.signTransaction(privateKeyFrom, 0)
                                var privateKeyTo = await controllerWalletDB.obtainPrivateKeyId(userFromId)
                                newTransac.signTransaction(privateKeyTo, 1)

                                console.log("=================signatureTo======================")
                                console.log(privateKeyTo + "  " + newTransac.signatureTo)
                                console.log("==================================================")

                                if (newTransac.isValid(0)) {
                                    var response = [];
                                    response.push(newTransac)
                                    console.log("================response========================")
                                    console.log(response[0].id)
                                    console.log("================================================")
                                    response.push()
                                    return response

                                } else {
                                    console.log("Can't do the payment - Reason: Something go wrong during the sign of transaction")
                                    res.send("Can't do the payment - Reason: Something go wrong during the sign of transaction")
                                }
                            } else {

                                console.log("Can't do the payment - Reason: Not exist destiny or sender wallet")
                                res.send("Can't do the payment - Reason: Not exist destiny or sender wallet")

                            }
                        } else {

                            console.log("Reward not created - UniReward hash corrupted during the creation of object")
                            res.send("Reward not created - UniReward hash corrupted during the creation of object")

                        }
                    } else {
                        console.log("Reward not created - Reason: Instructor can't give to itselft UniPoints")
                        res.send("Reward not created - Reason: Instructor can't give to itselft UniPoints")
                    }

                } else {
                    if (uniRewardReciverAddress == null) {
                        console.log("Reward not created - Reason: User for course dosen't exist")
                        res.send("Reward not created - Reason: User for course dosen't exist")
                    } else {
                        console.log("Reward not created - Reason: System User for points transation dosen't exist")
                        res.send("Reward not created - Reason: System User for points transation dosen't exist")
                    }
                }
            } else {

                console.log("Reward not created - Reason: Username without permissions")
                res.send("Reward not created - Reason: Username without permissions")

            }
        } else {

            if (req.body.costReward <= 0) {

                console.log("Reward not created - Reason: Can't create a free UniReward")
                res.send("Reward not created - Reason: Can't create a free UniReward")

            } else {

                console.log("Reward not created - Reason: Username or password isn't correct")
                res.send("Reward not created - Reason: Username or password isn't correct")

            }
        }

    }
}