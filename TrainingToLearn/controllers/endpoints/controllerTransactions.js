const Transaction = require('../../transaction');
const controllerDB = require('../controllerDatabase');

module.exports ={
    async createTransaction(req, res){
        let userToId, userDestAdd, userFromId, userInstructor, userFromAdd

            userDestAdd = await controllerDB.findUserAddress(req.body.toAddressUN)
            userToId = await controllerDB.findUserAddressID(userDestAdd)
            userFromAdd = await controllerDB.findUserAddress("System")
            userFromId = await controllerDB.findUserAddressID(userFromAdd)
            userInstructor = await controllerDB.obtainUserId(req.body.fromAddressUN, req.body.passwordFrom)


            if (userToId != null && userFromId != null) {

                let userToData = await controllerDB.getUserData(userToId)
                let userFromData = await controllerDB.getUserData(userFromId)
                let userInstructorData = await controllerDB.getUserData(userInstructor)
                let isUserToDeleted = userToData.deleted
                let isUserFromDeleted = userFromData.deleted
                let typeUserTo = userToData.typeUser
                let typeUserFrom = userInstructorData.typeUser


                if ((isUserToDeleted != null && isUserToDeleted == false) && (isUserFromDeleted != null && isUserFromDeleted == false) &&
                    !(typeUserTo == "N" && typeUserFrom == "N") && (userInstructor != userToId)) {

                    if (req.body.typeT == "M") {
                        if (userFromId != userToId) {

                            var idsWallets = [userFromId, userToId]
                            var idUniReward = await controllerDB.getUniRewardId(req.body.uniRewardId)
                            let newTransac = new Transaction(userFromAdd, userDestAdd, req.body.moneyTo, idUniReward, req.body.typeT, idsWallets, req.body.concept)

                            let userMoneyWallet = await controllerDB.getUserMoney(userFromId, idUniReward)

                            let isDeletedWallet1 = await controllerDB.obtainDeleteField(userFromId, 1)
                            let isDeletedWallet2 = await controllerDB.obtainDeleteField(userToId, 1)

                            if ((userToId != null && userFromId != null) && userMoneyWallet >= req.body.moneyTo &&
                                (!isDeletedWallet1 && !isDeletedWallet2) && newTransac.amount > 0 && idUniReward != null) {

                                let userRewardRecivierId = await controllerDB.getUserIDFromReward(req.body.uniRewardId)
                                if (userRewardRecivierId == userToId) {

                                    var idsToChange = await controllerDB.paymentPersonToPerson(userFromId, userToId, req.body.moneyTo, idUniReward)
                                    newTransac.setUniPointIds(idsToChange)

                                    var sCList = await controllerDB.getAllNotTerminatedSC()
                                    for (var i = 0; i < sCList.length; i++) {
                                        if (sCList[i].UniRewardId == newTransac.UniRewardId) {
                                            (sCList[i].deliveredUniPoints).push(...idsToChange)
                                            console.log("\n================================" + sCList[i].deliveredUniPoints + "\n================================")
                                            await controllerDB.updateDeliveredUP(sCList[i].deliveredUniPoints, newTransac.UniRewardId)
                                        }
                                    }
                                    sCList.splice(0, sCList.length)

                                    var privateKeyFrom = await controllerDB.obtainPrivateKeyId(userFromId)
                                    var privateKeyTo = await controllerDB.obtainPrivateKeyId(userToId)
                                    newTransac.signTransaction(privateKeyFrom, 0)
                                    newTransac.signTransaction(privateKeyTo, 1)

                                    if (newTransac.isValid(1)) {
                                        let transactionObjId = await controllerDB.createTransaction(newTransac)

                                        await controllerDB.updateTransactionIds(idsWallets[0], transactionObjId)
                                        await controllerDB.updateTransactionIds(idsWallets[1], transactionObjId)

                                        var response =[]
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
    }
}