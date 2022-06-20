const UniReward = require("../../uniReward")
const Transaction = require("../../transaction")
const controllerUniRewardDB = require("../database/controllerUniRewardDB");
const controllerWalletDB = require("../database/controllerWalletDB");
const controllerUserDB = require("../database/controllerUserDB");
const controllerUniPointDB = require("../database/controllerUniPointDB");

module.exports = {
    async createUniReward(pendingUniRewards, newBlockHash) {

        var arrayOfUniRewards = []
        var arrayUniPoints = []
        for (var i = 0; i < pendingUniRewards.length; i++) {
            var userWalletDeleted = await controllerUserDB.isUserDeleted(pendingUniRewards[i].WalletId)
            if (!userWalletDeleted) {
                pendingUniRewards[i].id = await controllerUniRewardDB.getLastUniRewardIndex()
                arrayOfUniRewards.push(await controllerUniRewardDB.createUniReward(pendingUniRewards[i], newBlockHash))


                //Prove that UniReward is really created for the creation of UniPoints

                if (!arrayOfUniRewards.includes(false)) {
                    console.log("Creating new UniPoints")
                    for (var j = 0; j < pendingUniRewards[i].cost; j++) {


                        var jsonObj = {
                            timestamp: new Date(),
                            UniRewardId: pendingUniRewards[i].id,
                            WalletId: pendingUniRewards[i].WalletId

                        }
                        arrayUniPoints.push(jsonObj)
                    }
                }
            }
        }

        return await controllerUniPointDB.createPoints(arrayUniPoints)

    },
    async createUniRewardObject(res, req, pendingUniRewards, arrayPoints) {
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

                        if (uniReward.proveNotNullObject() != true) {

                            pendingUniRewards.push(uniReward)
                            var idsWallets = [userFromId, userFromId]

                            let isDeletedWallet1 = await controllerWalletDB.obtainDeleteField(userFromId, 1)
                            let isDeletedWallet2 = await controllerWalletDB.obtainDeleteField(userToId, 1)
                            let concept = "Giving UniPoints referrer to UniReward: " + uniReward.nameUR

                            if (!isDeletedWallet1 && !isDeletedWallet2) {

                                let newTransac = new Transaction(systemAddress, systemAddress, uniReward.cost, uniReward.id, "U", idsWallets, concept)

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
                                    console.log("Can't do the creation - Reason: Something go wrong during the sign of transaction")
                                    res.send("Can't do the creation - Reason: Something go wrong during the sign of transaction")
                                }
                            } else {

                                console.log("Can't do the payment - Reason: Not exist destiny or sender wallet")
                                res.send("Can't do the payment - Reason: Not exist destiny or sender wallet")

                            }
                        } else {

                            console.log("Reward not created - UniReward corrupted during the creation of object")
                            res.send("Reward not created - UniReward corrupted during the creation of object")

                        }
                    } else {
                        console.log("Reward not created - Reason: Instructor can't give to itselft UniPoints")
                        res.send("Reward not created - Reason: Instructor can't give to itselft UniPoints")
                    }

                } else {
                    if (uniRewardReciverAddress == null) {
                        console.log("Reward not created - Reason: User of course dosen't exist")
                        res.send("Reward not created - Reason: User of course dosen't exist")
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