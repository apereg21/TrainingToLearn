/*
 *Imports
 */
const Block = require('../block');
const Wallet = require('../wallet');
const Transaction = require('../transaction');
const UniReward = require('../uniReward');
const SmartContract = require('../smartContract');
var express = require('express');
const controllerDB = require('../controllers/controllerDatabase');


/*
 *Configuration zone
 */
var router = express.Router();
var pendingTransactions = [];
var pendingUniRewards = [];
var pendingIdsTransactions = [];
var arrayPoints = [];
var smartContractList = [];
var validBlockchain = true
var areObjectsCreated = false
var periodicFunct = setInterval(() => createBlock(), 5000);


/*
 * Default Route
 */

router.get('/', (req) => {

    res.send('Hey!')

});


router.get('/getAllUsersList', async function (req, res) {
    var usersList = await controllerDB.getAllUsers()
    res.send(usersList)

});

router.get('/getUsersName/:id', async function (req, res) {
    var userName = await controllerDB.getUsername(parseInt((req.params.id).replace(':', '')))
    res.send(userName)
});

router.get('/getUserRole/:id', async function (req, res) {
    var user = await controllerDB.getUserData(parseInt((req.params.id).replace(':', '')))
    res.send(user.typeUser)
});

router.get('/getUserID/:username', async function (req, res) {
    var userId = await controllerDB.getUserID((req.params.username).replace(':', ''))
    res.send("" + userId)
});

router.post('/loginUser', async function (req, res) {
    var isUsernameExist = proveKey('username', 'string', req.body)
    var isPasswordExist = proveKey('password', 'string', req.body)
    if (isUsernameExist && isPasswordExist) {
        var userId = await controllerDB.obtainUserId(req.body.username, req.body.password)
        if (userId != null) {
            res.send("" + userId)
        } else {
            res.send("Can't login - Reason: Don't exist an user with this password or username")
        }

    } else {
        res.send("Can't login - Reason: Not correct parameters")
    }
});

router.get('/getAllRewardsList/:id/:purch', async function (req, res) {
    console.log(parseInt((req.params.id).replace(':', '')))

    var rewardsList = await controllerDB.getAllRewards((req.params.id).replace(':', ''), (req.params.purch).replace(':', ''))
    res.send(rewardsList)

});

router.get('/getAllSmartContractsUser/:id/', async function (req, res) {
    console.log(parseInt((req.params.id).replace(':', '')))

    var smartContractsList = await controllerDB.getAllSmartContractsUser(parseInt((req.params.id).replace(':', '')))
    console.log("This is smartContracts: " + smartContractsList)
    console.log(smartContractsList.length)
    smartContractsList.length != 0 ? res.send(smartContractsList) : res.send(null)
});

router.get('/getSpecificUser/:id', async function (req, res) {

    console.log(parseInt((req.params.id).replace(':', '')))

    var userData = await controllerDB.getUserData(parseInt((req.params.id).replace(':', '')))

    res.send(userData)

});

router.post('/getSpecificUserID', async function (req, res) {

    var userID = await controllerDB.getSpecificUserID(req.body.username, req.body.password)

    if (userID != null) {
        res.send("" + userID)
    } else {
        res.send(null)
    }

});

router.get('/getSpecificWallet/:id', async function (req, res) {

    console.log(req.params.id + " is an " + typeof req.params.id)
    console.log(parseInt((req.params.id).replace(':', '')))

    var walletData = await controllerDB.getUserWalletData(parseInt((req.params.id).replace(':', '')))

    res.send(walletData)

});

/*
 * Routes Creation Object
 */

router.post('/createNewReward', async function (req, res) {
    if (validBlockchain) {
        var isNameURExist = proveKey('nameUR', 'string', req.body)
        var isDescriptionURExist = proveKey('descriptionUR', 'string', req.body)
        var isImageURExist = proveKey('imageUR', 'string', req.body)
        var isCostRewardExist = proveKey('costReward', 'number', req.body)
        var isUsernameExist = proveKey('username', 'string', req.body)
        var isPasswordExist = proveKey('password', 'string', req.body)
        var isUserCourseExist = proveKey('usernameCourse', 'string', req.body)

        if (isNameURExist && isDescriptionURExist && isImageURExist && isUsernameExist && isPasswordExist && isCostRewardExist && isUserCourseExist) {

            let idUserInstructor = await controllerDB.obtainUserId(req.body.username, req.body.password)
            let userInstructoDeleted = await controllerDB.isUserDeleted(idUserInstructor)
            let isUserDelete = await controllerDB.isUserDeleted(idUserInstructor)

            if (idUserInstructor != null && !isUserDelete && req.body.costReward > 0 && !userInstructoDeleted) {

                let userType = await controllerDB.obtainUserType(idUserInstructor)

                if (userType == "I") {

                    let systemAddress = await controllerDB.findUserAddress("System")
                    let uniRewardReciverAddress = await controllerDB.findUserAddress(req.body.usernameCourse)

                    if (systemAddress != null && uniRewardReciverAddress != null) {

                        let userFromId = await controllerDB.findUserAddressID(systemAddress)
                        let userToId = await controllerDB.findUserAddressID(uniRewardReciverAddress)
                        if (idUserInstructor != userToId) {

                            let uniReward = new UniReward(req.body, userToId)
                            uniReward.getAndSetLastId()
                            var alreadyExistURId = false
                            var lastIdUniReward = await controllerDB.getLastUniRewardIndex()
                            if (uniReward.proveNotNullObject() != true) {

                                for (var i = 0; i < pendingUniRewards.length; i++) {
                                    if (pendingUniRewards[i].id == lastIdUniReward) {
                                        alreadyExistURId = true
                                    }
                                }

                                if (alreadyExistURId) {
                                    uniReward.id = (pendingUniRewards[pendingUniRewards.length - 1].id) + 1
                                }
                                console.log("=================uniReward.id======================")
                                console.log(uniReward.id)
                                console.log("==================================================")
                                addPendingUniReward(uniReward)
                                var idsWallets = [userFromId, userFromId]

                                let isDeletedWallet1 = await controllerDB.obtainDeleteField(userFromId, 1)
                                let isDeletedWallet2 = await controllerDB.obtainDeleteField(userToId, 1)
                                let concept = "Giving UniPoints referrer to UniReward: " + uniReward.nameUR

                                if (!isDeletedWallet1 && !isDeletedWallet2) {

                                    let newTransac = new Transaction(systemAddress, systemAddress, uniReward.cost, uniReward.id, "U", idsWallets, concept)
                                    newTransac.getAndSetLastTransactionId()
                                    var lastIdTrans = await controllerDB.getLastTransactionId()
                                    var alreadyExistTransId = false

                                    for (var j = 0; j < pendingTransactions.length; j++) {
                                        if (pendingTransactions[j].id == lastIdTrans) {
                                            alreadyExistTransId = true
                                        }
                                    }
                                    if (alreadyExistTransId) {
                                        newTransac.id = pendingTransactions[pendingTransactions.length - 1].id + 1
                                    }

                                    let userWalletId = await controllerDB.obtainWalletId(userFromId)

                                    var lastIdUniPoint = await controllerDB.getLastIdUP()
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
                                    var privateKeyFrom = await controllerDB.obtainPrivateKeyId(userFromId)
                                    newTransac.signTransaction(privateKeyFrom, 0)
                                    var privateKeyTo = await controllerDB.obtainPrivateKeyId(userFromId)
                                    newTransac.signTransaction(privateKeyTo, 1)

                                    console.log("=================signatureTo======================")
                                    console.log(privateKeyTo + "  " + newTransac.signatureTo)
                                    console.log("==================================================")

                                    if (newTransac.isValid(0)) {

                                        addPendingTransaction(newTransac)

                                        addPendingIds(newTransac.id)

                                        sleep(2000)
                                        console.log("OK - Reward will be created")
                                        res.send("OK - Reward will be created")

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

        } else {

            console.log("Reward not created - Reason: Incorrect params, someone of the params are not correct")
            res.send("Reward not created - Reason: Incorrect params, someone of the params are not correct")

        }
    } else {

        console.log("Reward not created - Reason: Blockchain isn't valid")
        res.send("Reward not created - Reason: Blockchain isn't valid")

    }
});

router.post('/createNewTransaction', async function (req, res) {
    if (validBlockchain) {

        var isFromAddressNameExist = proveKey('fromAddressUN', 'string', req.body)
        var isToAddresNameExist = proveKey('toAddressUN', 'string', req.body)
        var isTypeTransactionExist = proveKey('typeT', 'string', req.body)
        var isPasswordFromExist = proveKey('passwordFrom', 'string', req.body)
        var isConceptExist = proveKey('concept', 'string', req.body)
        var isMoneyExist = proveKey('moneyTo', 'number', req.body)

        if (isFromAddressNameExist && isToAddresNameExist && isTypeTransactionExist && isPasswordFromExist && isConceptExist && isMoneyExist) {

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
                        var isUniRewardId = proveKey('uniRewardId', 'string', req.body)
                        if (userFromId != userToId && isUniRewardId) {

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

                                        addPendingTransaction(newTransac)
                                        addPendingIds(transactionObjId)
                                        res.send("OK - Delivery complete")
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
        } else {

            console.log("Can't finish the Transaction - Reason: Not correct parameters")
            res.send("Can't finish the Transaction - Reason: Not correct paramaters")

        }
    } else {

        console.log("Transaction not created - Reason: Blockchain isn't valid")
        res.send("Transaction not created - Reason: Blockchain isn't valid")

    }
});

router.post('/createNewUser', async function (req, res) {
    if (validBlockchain) {

        let isNameExist = proveKey('name', 'string', req.body)
        let isUserNameExist = proveKey('username', 'string', req.body)
        let isFullSurnameExist = proveKey('fullSurname', 'string', req.body)
        let isPasswordExist = proveKey('password', 'string', req.body)
        let isRoleExist = proveKey('typeUser', 'string', req.body)

        if (isNameExist && isUserNameExist && isFullSurnameExist && isPasswordExist && isRoleExist) {

            let userAlreadyCreated = await controllerDB.isUserCreated(req.body.username)

            if (userAlreadyCreated == false) {

                if (req.body.typeUser == "N" || req.body.typeUser == "I") {

                    await controllerDB.createUser(req.body)
                    console.log("OK - User created")
                    const ownerId = await controllerDB.obtainUserId(req.body.username, req.body.password)
                    const hasWallet = await controllerDB.userHasWallet(ownerId)

                    if (!hasWallet) {

                        const newWallet = new Wallet(ownerId)
                        controllerDB.createWallet(newWallet)
                        console.log("OK - Wallet Created")
                        res.send("OK - Acount created")

                    } else {
                        console.log("Wallet dont created - Reason: User has a Wallet already")
                        res.send("Wallet dont created - Reason: User has a Wallet already")
                    }

                } else {
                    console.log("User not created dont created - Reason: User role invalid")
                    res.send("User not created dont created - Reason: User role invalid")
                }

            } else {
                console.log("Acount dont created - Reason: Username already is used")
                res.send("Acount dont created - Reason: Username already is used")
            }
        } else {
            console.log("User dont created - Reason: The data of parameters isn't correct")
            res.send("User dont created - Reason: The data of parameters isn't correct")
        }
    } else {
        console.log("User dont created - Reason: The blockchain isn't valid")
        res.send("User dont created - Reason: The blockchain isn't valid")
    }
});

/*
 * Modify Routes
 */

router.post('/changeUserData', async function (req, res) {

    let isUserNameExist = proveKey('username', 'string', req.body)
    let isPasswordExist = proveKey('password', 'string', req.body)
    let isChangesExist = proveKey('changes', 'object', req.body)

    if (isUserNameExist && isPasswordExist && isChangesExist) {

        const userID = await controllerDB.obtainUserId(req.body.username, req.body.password)

        if (userID != null) {

            let counterErrors = 0

            for (let i = 0; i < req.body.changes.length; i++) {

                switch (req.body.changes[i]) {
                    case "p":
                        if (proveKey('passwordN', 'string', req.body) == false) {
                            counterErrors++
                        }
                        break;
                    case "u":
                        if (proveKey('usernameN', 'string', req.body) == false) {
                            counterErrors++
                        }
                        break;
                    case "f":
                        if (proveKey('fullSurnameN', 'string', req.body) == false) {
                            counterErrors++
                        }
                        break;
                    case "n":
                        if (proveKey('nameN', 'string', req.body) == false) {
                            counterErrors++
                        }
                        break;
                    default:
                        counterErrors++
                }
            }

            if (counterErrors == 0) {

                let userModify = await controllerDB.modifyUserData(req.body.nameN, req.body.fullSurnameN, req.body.usernameN, req.body.passwordN, userID)

                if (userModify == true) {
                    console.log("User data changed")
                    res.send("User data changed")
                } else {
                    console.log("User data not chaged - Reason: Username Already Exists")
                    res.send("User data not chaged - Reason: Username Already Exists")
                }

            } else {
                console.log("User not modify - Reason: Parameters are not corrects")
                res.send("User not modify - Reason: Parameters are not corrects")
            }
        } else {
            console.log("User data dont change - Reason: Username or password ins't correct")
            res.send("User data dont change - Reason: Username or password ins't correct")
        }
    } else {
        console.log("User not modify - Reason: Parameters not corrects")
        res.send("User not modify - Reason: Parameters not corrects")
    }
});

router.post('/deleteUser', async function (req, res) {

    let isUserIdExist = proveKey('id', 'number', req.body)

    if (isUserIdExist) {

        const user = await controllerDB.getUserData(req.body.id)

        if (user != null && !user.deleted) {

            const deletedUser = user.deleted
            const idWallet = user.id
            const deletedWallet = await controllerDB.obtainDeleteField(idWallet, 1)

            if ((!deletedUser) && ((!deletedWallet) || deletedWallet != null)) {
                controllerDB.deleteUser(user.id)
                console.log("OK - " + user.username + "'s data eliminated")
                res.send(user.username)
            } else {
                console.log(user.username + "'s data can't be eliminated - Reason: Exist but is Deleted")
                res.send(user.username + "'s data can't be eliminated - Reason: Exist but is Deleted")
            }
        } else {
            if (user == null) {
                console.log(user.username + "'s data can't be eliminated - Reason: User Not Exist")
                res.send(user.username + "'s data can't be eliminated - Reason: User Not Exist")
            } else {
                console.log(user.username + "'s data can't be eliminated - Reason: Already deleted")
                res.send(user.username + "'s data can't be eliminated - Reason: Already deleted")
            }
        }
    } else {
        console.log(user.username + " can't be deleted - Reason: Not correct parammeters")
        res.send(user.username + " can't be deleted - Reason: Not correct parammeters")
    }
});

function addPendingTransaction(transaction) {
    pendingTransactions.push(transaction)
}

function addPendingUniReward(unireward) {
    pendingUniRewards.push(unireward)
}

function addPendingIds(id) {
    pendingIdsTransactions.push(id)
}

function proveKey(nameKey, variableType, reqJson) {

    var objJson = Object(reqJson)
    let isKeyExist = objJson.hasOwnProperty(nameKey)
    console.log("Prove the key: " + nameKey)
    console.log("Is this key in json request body? " + isKeyExist)

    if (isKeyExist) {

        console.log("Is this key with the correct type? " + isKeyExist)
        console.log(typeof reqJson[nameKey] + " = " + variableType)

        if (typeof reqJson[nameKey] == variableType) {

            if (typeof reqJson[nameKey] == 'string') {

                var isCorrect = proveNormalString(reqJson[nameKey], nameKey)

                if (reqJson[nameKey].length > 0 && isCorrect == true) {
                    console.log("Correct Type - Can continue\n")
                    return true
                } else {

                    if (reqJson[nameKey].length <= 0) {
                        console.log("Incorrect Type - Reason: Length of " + nameKey + "\n")
                        return false
                    } else {
                        console.log("Incorrect Type - Reason: The structure of string, ins't correct\n")
                        return false
                    }
                }
            } else {

                if (typeof reqJson[nameKey] == 'number') {

                    if (reqJson[nameKey] >= 0) {
                        console.log("Correct Type - Can continue\n")
                        return true
                    } else {
                        console.log("Incorrect Type - Reason: The structure of number, ins't correct. Positive values\n")
                        return false
                    }
                } else {
                    console.log("Correct Type - Can continue\n")
                    return true
                }
            }
        } else {
            console.log("Incorrect Type - Reason: Not correct type for key: " + nameKey + " \n")
            return false
        }
    } else {
        console.log("Incorrect Type - Reason: Not exist key\n")
        return false
    }
}

async function createBlock() {

    console.log("Time has passed, time for block creation. ¿There are pending transactions?")
    var validBlockchain = await isValidBlockchain()

    if (pendingTransactions.length > 0 && validBlockchain) {

        console.log("YES, there are pending Transactions")
        let lastIndex = await controllerDB.getLastBlockIndex()

        if (lastIndex == 0) {

            var genesisBlock = new Block(lastIndex, new Date(), [], "0")
            genesisBlock.hash = genesisBlock.calculateHash()
            await controllerDB.createBlock(genesisBlock)
            lastIndex++
        }

        let prevHash = await controllerDB.getHashLastBlock(lastIndex - 1)

        let newBlock = new Block(lastIndex, new Date(), pendingIdsTransactions, prevHash)
        newBlock.hash = newBlock.calculateHash()
        await controllerDB.createBlock(newBlock)

        if (pendingUniRewards.length > 0) {
            var arrayOfUniRewards = []
            for (var i = 0; i < pendingUniRewards.length; i++) {
                var userWalletDeleted = await controllerDB.isUserDeleted(pendingUniRewards[i].WalletId)
                if (!userWalletDeleted) {
                    arrayOfUniRewards.push(await controllerDB.createUniReward(pendingUniRewards[i], newBlock.hash))
                }
            }
            if (!arrayOfUniRewards.includes(false)) {
                await controllerDB.createPoints(arrayPoints)
            }
        }


        for (var i = 0; i < pendingTransactions.length; i++) {
            console.log("=====================================================")
            console.log(pendingTransactions)
            console.log("=====================================================")
            var isExistTransaction = await controllerDB.isExistTransaction(pendingIdsTransactions[i])
            var userFrom, userTo, transaction
            userFrom = await controllerDB.getUserData(pendingTransactions[i].idWalletFrom)
            userTo = await controllerDB.getUserData(pendingTransactions[i].idWalletTo)
            if (!isExistTransaction) {
                //Transaction not already created
                if (userFrom != null && userTo != null) {
                    var transactionObjId = await controllerDB.createTransaction(pendingTransactions[i])

                    transaction = await controllerDB.updateTransactionHash(transactionObjId, newBlock.hash)
                    userFrom = await controllerDB.getUserData(transaction.idWalletFrom)
                    userTo = await controllerDB.getUserData(transaction.idWalletTo)

                    await controllerDB.paymentToSystem(userFrom.id, transaction.uniPointIds, transaction.id)
                    await controllerDB.updateHashUniReward(pendingIdsTransactions[i], transaction.UniRewardId, newBlock.hash)

                    var uniReward = await controllerDB.getUniReward(transaction.UniRewardId)
                    var addressTo = await controllerDB.getUserWalletAddress(uniReward.WalletId)

                    var sContract = new SmartContract(transaction.fromAddress, addressTo, transaction.uniPointIds, transaction.UniRewardId)
                    await controllerDB.createSmartContract(sContract)

                }
            } else {
                //Transaction already created
                if (userFrom != null && userTo != null) {
                    transaction = await controllerDB.updateTransactionHash(pendingIdsTransactions[i], newBlock.hash)
                    userFrom = await controllerDB.getUserData(transaction.idWalletFrom)
                    userTo = await controllerDB.getUserData(transaction.idWalletTo)
                    if (transaction.typeTransaction == "U") {
                        await controllerDB.updateHashUniReward(transaction.id, transaction.UniRewardId, newBlock.hash)
                    }

                }
            }
            await controllerDB.updateHashUniPoint(transaction.id, transaction.UniRewardId, newBlock.hash)
            await controllerDB.updateTransactionIds(userFrom.id, transaction.id)
            await controllerDB.updateTransactionIds(userTo.id, transaction.id)
        }

        arrayPoints.splice(0, arrayPoints.length)
        pendingUniRewards.splice(0, pendingUniRewards.length)
        pendingTransactions.splice(0, pendingTransactions.length)
        pendingIdsTransactions.splice(0, pendingIdsTransactions.length)


    } else {

        if (validBlockchain == false) {
            validBlockchain = false
            console.log("Error - Blockchain ins't correct")
        } else {
            console.log("NO, there aren't pending Transactions")
        }
    }


    if (validBlockchain) {
        smartContractList = await controllerDB.getAllNotTerminatedSC()
        for (var i = 0; i < smartContractList.length; i++) {
            var sContract = new SmartContract(smartContractList[i].walletIdObserver, smartContractList[i].walletIdDemander, smartContractList[i].condition, smartContractList[i].UniRewardId)
            console.log("Im the Smart Contract: \n" + sContract)
            sContract.setDeliveredUniPoints(smartContractList[i].deliveredUniPoints)
            if (sContract.state != 1) {
                console.log(sContract)
                sContract.proveCompleteContract()
                if (sContract.proveCompleteContract()) {

                    var userFromId = await controllerDB.findUserAddressID(sContract.walletIdObserver)
                    var userToId = await controllerDB.findUserAddressID(sContract.walletIdDemander)
                    var userFromDeleted = await controllerDB.isUserDeleted(userFromId)
                    var userToDeleted = await controllerDB.isUserDeleted(userToId)
                    var idsWallets = [userFromId, userToId]

                    if (userFromId != null && userToId != null && userFromDeleted != true && userToDeleted != true) {

                        let uniRewardPurchase = await controllerDB.getPurchaseField(sContract.UniRewardId)

                        if (!uniRewardPurchase && uniRewardPurchase != null) {

                            let lastNewIndex = await controllerDB.getLastBlockIndex()
                            let prevNewHash = await controllerDB.getHashLastBlock(lastNewIndex - 1)

                            let nameTo = await controllerDB.getUserWalletName(userToId)
                            let nameUniReward = await controllerDB.getUniRewardName(sContract.UniRewardId)
                            let concept = "Giving to " + nameTo + " the UniReward: " + nameUniReward
                            let newTransac = new Transaction(sContract.walletIdObserver, sContract.walletIdDemander, sContract.condition.length, sContract.UniRewardId, "U", idsWallets, concept)

                            var idsToChange = await controllerDB.getPointsToChange(userToId, sContract.condition.length, sContract.UniRewardId)
                            newTransac.setUniPointIds(idsToChange)

                            var privateKey = await controllerDB.obtainPrivateKeyId(userFromId)
                            newTransac.signTransaction(privateKey, 0)
                            var privateKey2 = await controllerDB.obtainPrivateKeyId(userToId)
                            newTransac.signTransaction(privateKey2, 1)

                            let transactionObjId = await controllerDB.createTransaction(newTransac)

                            console.log("=================================================================")
                            let newBlockSC = new Block(lastNewIndex, new Date(), [transactionObjId], prevNewHash)
                            newBlockSC.hash = newBlockSC.calculateHash()
                            await controllerDB.createBlock(newBlockSC)
                            console.log("=================================================================")

                            await controllerDB.updateTransactionHash(transactionObjId, newBlockSC.hash)
                            await controllerDB.updateHashUniPoint(transactionObjId, sContract.UniRewardId, newBlockSC.hash)
                            await controllerDB.updateHashUniReward(transactionObjId, sContract.UniRewardId, newBlockSC.hash)

                            sContract.endSmartContract(idsWallets, transactionObjId, idsToChange)
                            smartContractList.splice(i, 1)
                            console.log("OK - Transaction created")

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
                    var userFromId = await controllerDB.findUserAddressID(sContract.walletIdObserver)
                    var userToId = await controllerDB.findUserAddressID(sContract.walletIdDemander)
                    var userFromDeleted = await controllerDB.isUserDeleted(userFromId)
                    var userToDeleted = await controllerDB.isUserDeleted(userToId)
                    var idsWallets = [userFromId, userToId]

                    console.log("User " + userFromId + " is " + userFromDeleted)
                    console.log("User " + userToId + " is " + userToDeleted)

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

async function isValidBlockchain() {

    console.log("¿Is Blockchain valid?")
    var blockchainLength = await controllerDB.getLastBlockIndex()

    if (blockchainLength > 0) {

        const genesisBlock = await controllerDB.getBlock(0)
        var genesisBlockObj = new Block(genesisBlock.index, genesisBlock.timestamp, genesisBlock.idsTransactions, "0")

        if (genesisBlock.hash != genesisBlockObj.calculateHash()) {
            console.log("NO, the blockchain isn't valid")
            return false
        }

        for (let i = 1; i < blockchainLength; i++) {

            const currentBlock = await controllerDB.getBlock(i);
            const previousBlock = await controllerDB.getBlock(i - 1);
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

function proveNormalString(string, nameKey) {
    console.log("Prove " + nameKey + " : " + string + " with regular expresion")
    if (nameKey == "password" || nameKey == "passwordFrom") {
        return true
    } else {
        var cadena = string;
        var result = !/^\s|^\d/.test(cadena);
        return result
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = router;