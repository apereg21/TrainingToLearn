/*
 *Imports
 */
const Block = require('../block');
const Wallet = require('../wallet');
const Transaction = require('../transaction');
const UniReward = require('../uniReward');
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
var periodicFunct = setInterval(() => createBlock(), 10000);
var valid = true

/*
 * Default Route
 */

router.get('/', (req) => {

    res.send('Hey!')

});


router.get('/getAllUsersList', async function(req, res) {
    var usersList = await controllerDB.getAllUsers()
    res.send(usersList)

});

router.get('/getUsersName/:id', async function(req, res) {
    var userName = await controllerDB.getUsername(parseInt((req.params.id).replace(':', '')))
    res.send(userName)
});

router.get('/getUserRole/:id', async function(req, res) {
    var user = await controllerDB.getUserData(parseInt((req.params.id).replace(':', '')))
    res.send(user.typeUser)
});

router.get('/getUserID/:username', async function(req, res) {
    var userId = await controllerDB.getUserID((req.params.username).replace(':', ''))
    res.send("" + userId)
});

router.post('/loginUser', async function(req, res) {
    var isUsernameExist = proveKey('username', 'string', req.body)
    var isPasswordExist = proveKey('password', 'string', req.body)
    if (isUsernameExist && isPasswordExist) {
        var userId = await controllerDB.obtainUserId(req.body.username, req.body.password)
        if (userId != null) {
            res.send("" + userId)
        } else {
            res.send("No login - Reason: Don't exist an user with this password or username")
        }

    } else {
        res.send("No login - Reason: Not correct parameters")
    }
});

router.get('/getAllRewardsList/:id/:purch', async function(req, res) {
    console.log(parseInt((req.params.id).replace(':', '')))

    var rewardsList = await controllerDB.getAllRewards((req.params.id).replace(':', ''), (req.params.purch).replace(':', ''))
    res.send(rewardsList)

});

router.get('/getSpecificUser/:id', async function(req, res) {

    console.log(parseInt((req.params.id).replace(':', '')))

    var userData = await controllerDB.getUserData(parseInt((req.params.id).replace(':', '')))

    res.send(userData)

});

router.post('/getSpecificUserID', async function(req, res) {

    var userID = await controllerDB.getSpecificUserID(req.body.username, req.body.password)

    if (userID != null) {
        res.send("" + userID)
    } else {
        res.send(null)
    }

});

router.get('/getSpecificWallet/:id', async function(req, res) {

    console.log(req.params.id + " is an " + typeof req.params.id)
    console.log(parseInt((req.params.id).replace(':', '')))

    var walletData = await controllerDB.getUserWalletData(parseInt((req.params.id).replace(':', '')))

    res.send(walletData)

});

/*
 * Routes Creation Object
 */

router.post('/createNewReward', async function(req, res) {
    if (valid && pendingTransactions.length == 0) {
        var isNameURExist = proveKey('nameUR', 'string', req.body)
        var isDescriptionURExist = proveKey('descriptionUR', 'string', req.body)
        var isImageURExist = proveKey('imageUR', 'string', req.body)
        var isCostRewardExist = proveKey('costReward', 'number', req.body)
        var isUsernameExist = proveKey('username', 'string', req.body)
        var isPasswordExist = proveKey('password', 'string', req.body)
        var isUserCourseExist = proveKey('usernameCourse', 'string', req.body)

        if (isNameURExist && isDescriptionURExist && isImageURExist && isUsernameExist && isPasswordExist && isCostRewardExist && isUserCourseExist) {

            let idUserInstructor = await controllerDB.obtainUserId(req.body.username, req.body.password)
            let isUserDelete = await controllerDB.isUserDeleted(idUserInstructor)
                //One place to do funtions with Smart Contracts
            if (idUserInstructor != null && !isUserDelete && req.body.costReward > 0) {

                let userType = await controllerDB.obtainUserType(idUserInstructor)

                if (userType == "I") {

                    let systemId = await controllerDB.findUserAddress("System")
                    let uniRewardReciverId = await controllerDB.findUserAddress(req.body.usernameCourse)

                    if (systemId != null && uniRewardReciverId != null) {

                        let userFromId = await controllerDB.findUserAddressID(systemId)
                        let userToId = await controllerDB.findUserAddressID(uniRewardReciverId)
                        if (idUserInstructor != userToId) {
                            let uniReward = new UniReward(req.body, userToId)

                            if (uniReward.proveNotNullObject() != true) {
                                addPendingUniReward(uniReward)
                                var idsWallets = [userFromId, userToId]

                                let isDeletedWallet1 = await controllerDB.obtainDeleteField(userFromId, 1)
                                let isDeletedWallet2 = await controllerDB.obtainDeleteField(userToId, 1)
                                let concept = "Giving UniPoints referrer to UniReward: " + uniReward.nameUR

                                if (!isDeletedWallet1 && !isDeletedWallet2) {

                                    let newTransac = new Transaction(systemId, systemId, uniReward.cost, await uniReward.getLastIndex(), "U", idsWallets, concept)
                                    let userWalletId = await controllerDB.obtainWalletId(userFromId)

                                    for (var i = 0; i < req.body.costReward; i++) {
                                        var jsonObj = {
                                            id: await controllerDB.getLastIdUP() + i,
                                            timestamp: new Date(),
                                            UniRewardId: await uniReward.getLastIndex(),
                                            WalletId: userWalletId
                                        }
                                        arrayPoints.push(jsonObj)
                                    }
                                    newTransac.setUniPointIds(arrayPoints, 0)
                                    var privateKey = await controllerDB.obtainPrivateKeyId(userFromId)
                                    newTransac.signTransaction(privateKey, 0)

                                    if (newTransac.isValid(0)) {

                                        addPendingTransaction(newTransac)
                                        addPendingIds(await controllerDB.getLastTransactionId())
                                        console.log("OK - Reward will be create in a few moments")
                                        res.send("OK - Reward will be create in a few moments")

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
                        if (uniRewardReciverId == null) {
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

router.post('/createNewTransaction', async function(req, res) {
    if (valid && pendingTransactions.length == 0) {

        var isFromAddressNameExist = proveKey('fromAddressUN', 'string', req.body)
        var isToAddresNameExist = proveKey('toAddressUN', 'string', req.body)
        var isTypeTransactionExist = proveKey('typeT', 'string', req.body)
        var isPasswordFromExist = proveKey('passwordFrom', 'string', req.body)
        var isConceptExist = proveKey('concept', 'string', req.body)
        var isMoneyExist = proveKey('moneyTo', 'number', req.body)

        if (isFromAddressNameExist && isToAddresNameExist && isTypeTransactionExist && isPasswordFromExist && isConceptExist && isMoneyExist) {

            let userToId, userDestAdd, userFromId, userInstructor, userFromAdd
            if (req.body.typeT == "M") {

                userDestAdd = await controllerDB.findUserAddress(req.body.toAddressUN)
                userToId = await controllerDB.findUserAddressID(userDestAdd)
                userFromAdd = await controllerDB.findUserAddress("System")
                userFromId = await controllerDB.findUserAddressID(userFromAdd)
                userInstructor = await controllerDB.obtainUserId(req.body.fromAddressUN, req.body.passwordFrom)

            } else {

                userFromAdd = await controllerDB.findUserAddress(req.body.toAddressUN)
                userFromId = await controllerDB.findUserAddressID(userFromAdd)
                userDestAdd = await controllerDB.findUserAddress("System")
                userToId = await controllerDB.findUserAddressID(userDestAdd)
            }

            if (userToId != null && userFromId != null) {
                let userToData = await controllerDB.getUserData(userToId)
                let userFromData = await controllerDB.getUserData(userFromId)
                let userInstructorData = await controllerDB.getUserData(userInstructor)
                let isUserToDeleted = userToData.deleted
                let isUserFromDeleted = userFromData.deleted
                let typeUserTo = userToData.typeUser
                let typeUserFrom = ""
                if (req.body.typeT == "M") {
                    typeUserFrom = userInstructorData.typeUser
                } else {
                    typeUserFrom = userFromData.typeUser
                }

                if ((isUserToDeleted != null && isUserToDeleted == false) && (isUserFromDeleted != null && isUserFromDeleted == false) &&
                    !(typeUserTo == "N" && typeUserFrom == "N") && (userInstructor != userToId)) {

                    if (req.body.typeT == "M") {
                        var isUniRewardId = proveKey('uniRewardId', 'string', req.body)
                        if (userFromId != userToId && isUniRewardId) {

                            var idsWallets = [userFromId, userToId]
                            var idUniReward = await controllerDB.getUniRewardId(req.body.uniRewardId)
                            let newTransac = new Transaction(userFromAdd, userDestAdd, req.body.moneyTo, null, req.body.typeT, idsWallets, req.body.concept)

                            let userMoneyWallet = await controllerDB.getUserMoney(userFromId, idUniReward)

                            let isDeletedWallet1 = await controllerDB.obtainDeleteField(userFromId, 1)
                            let isDeletedWallet2 = await controllerDB.obtainDeleteField(userToId, 1)

                            if ((userToId != null && userFromId != null) && userMoneyWallet >= req.body.moneyTo &&
                                (!isDeletedWallet1 && !isDeletedWallet2) && newTransac.amount > 0 && idUniReward != null) {

                                let userRewardRecivierId = await controllerDB.getUserIDFromReward(req.body.uniRewardId)
                                if (userRewardRecivierId == userToId) {

                                    var idsToChange = await controllerDB.paymentPersonToPerson(userFromId, userToId, req.body.moneyTo, idUniReward)
                                    newTransac.setUniPointIds(idsToChange, 1)
                                    console.log("==============Estoy aqui================")
                                    console.log("=======================================================")
                                    console.log(newTransac.uniPointIds + " " + idsToChange)
                                    console.log("=======================================================")
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
                                        res.send("OK - Transaction created")
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

                        if (req.body.typeT == "U") {

                            var isUniRewardTransactionExist = proveKey('uniRewardT', 'string', req.body)

                            if (isUniRewardTransactionExist) {

                                var idsWallets = [userToId, userFromId]

                                let uniRewardId = await controllerDB.getUniRewardId(req.body.uniRewardT)
                                let uniRewardPurchase = await controllerDB.getPurchaseField(uniRewardId)

                                if (!uniRewardPurchase && uniRewardId != null) {

                                    let nameTo = await controllerDB.getUserWalletName(userFromId)
                                    let concept = "Giving to " + nameTo + " the UniReward: " + req.body.uniRewardT
                                    let newTransac = new Transaction(userFromAdd, userFromAdd, req.body.moneyTo, uniRewardId, req.body.typeT, idsWallets, concept)

                                    let userMoneyWallet = await controllerDB.getUserMoney(userFromId, uniRewardId)
                                    let specificUR = await controllerDB.getSpecificUR(uniRewardId)

                                    if (userMoneyWallet >= specificUR.cost &&
                                        req.body.moneyTo == specificUR.cost &&
                                        userMoneyWallet >= req.body.moneyTo) {

                                        var idsToChange = await controllerDB.getPointsToChange(userFromId, req.body.moneyTo, uniRewardId)
                                        newTransac.setUniPointIds(idsToChange, 1)
                                        var privateKey = await controllerDB.obtainPrivateKeyId(userFromId)
                                        newTransac.signTransaction(privateKey, 0)

                                        if (newTransac.isValid(0)) {
                                            let transactionObjId = await controllerDB.createTransaction(newTransac)
                                            await controllerDB.moveToMoneyExp(idsToChange, userFromId, uniRewardId)
                                            await controllerDB.updatePurchasePoints(idsToChange)
                                            await controllerDB.updateTransactionIds(idsWallets[0], transactionObjId)
                                            await controllerDB.updateTransactionIds(idsWallets[1], transactionObjId)
                                            await controllerDB.updateIdUniRewardWallet(userFromId, uniRewardId)
                                            await controllerDB.updatePurchaseField(uniRewardId)
                                            addPendingTransaction(newTransac)
                                            addPendingIds(transactionObjId)

                                            console.log("OK - Transaction created")
                                            res.send("OK - Transaction created")
                                        } else {
                                            console.log("Can't do the payment - Reason: Something go wrong during the sign of transaction")
                                            res.send("Can't do the payment - Reason: Something go wrong during the sign of transaction")
                                        }

                                    } else {

                                        if (userMoneyWallet < specificUR.cost) {

                                            console.log("Can't do the payment - Reason: Amount of money in wallet is insuficient")
                                            res.send("Can't do the payment - Reason: Amount of money in wallet is insuficient")

                                        } else {

                                            console.log("Can't do the payment - Reason: Not delivery correct amount to UniReward (Correct amount: " + specificUR.cost + " UniPoints)")
                                            res.send("Can't do the payment - Reason: Not delivery correct amount to UniReward (Correct amount: " + specificUR.cost + " UniPoints)")

                                        }

                                    }
                                } else {
                                    if (uniRewardPurchase) {

                                        console.log("Can't finish the Transaction - Reason: Reward already purchase")
                                        res.send("Can't finish the Transaction - Reason: Reward already purchase")

                                    } else {

                                        console.log("Can't finish the Transaction - Reason: Not existing uniReward")
                                        res.send("Can't finish the Transaction - Reason: Not existing uniReward")

                                    }

                                }
                            } else {

                                console.log("Can't finish the Transaction - Reason: Not correct parameters")
                                res.send("Can't finish the Transaction - Reason: Not correct paramaters")

                            }
                        } else {

                            console.log("Can't finish the Transaction - Reason: Not correct type of transaction")
                            res.send("Can't finish the Transaction - Reason: Not correct type of transaction")

                        }
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

router.post('/createNewUser', async function(req, res) {
    if (valid) {

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

router.post('/changeUserData', async function(req, res) {

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
                    console.log("User data chaged")
                    res.send("User data chaged")
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

router.post('/deleteUser', async function(req, res) {

    let isUserNameExist = proveKey('username', 'string', req.body)
    let isPasswordExist = proveKey('password', 'string', req.body)

    if (isUserNameExist && isPasswordExist) {

        const idUser = await controllerDB.obtainUserId(req.body.username, req.body.password)

        if (idUser != null) {

            const deletedUser = await controllerDB.obtainDeleteField(idUser, 0)
            const idWallet = await controllerDB.obtainWalletId(idUser)
            const deletedWallet = await controllerDB.obtainDeleteField(idWallet, 1)

            if ((!deletedUser) && ((!deletedWallet) || deletedWallet == null)) {
                controllerDB.deleteUser(idUser)
                console.log("OK - " + req.body.username + "'s data eliminated")
                res.send("OK - " + req.body.username + "'s data eliminated")
            } else {
                console.log(req.body.username + "'s data can't be eliminated - Reason: Exist but is Deleted")
                res.send(req.body.username + "'s data can't be eliminated - Reason: Exist but is Deleted")
            }
        } else {
            console.log(req.body.username + "'s data can't be eliminated - Reason: User Not Exist")
            res.send(req.body.username + "'s data can't be eliminated - Reason: User Not Exist")
        }
    } else {
        console.log("Wallet don't deleted - Reason: Not correct parammeters")
        res.send("Wallet don't deleted - Reason: Not correct parammeters")
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
            for (var i = 0; i < pendingUniRewards.length; i++) {
                await controllerDB.createUniReward(pendingUniRewards[i], newBlock.hash)
            }
            await controllerDB.createPoint(arrayPoints)
            pendingUniRewards.splice(0, pendingUniRewards.length)

        }


        for (var i = 0; i < pendingTransactions.length; i++) {

            var isExistTransaction = await controllerDB.isExistTransaction(pendingIdsTransactions[i])
            var userFrom, userTo, transaction
            if (!isExistTransaction) {
                //Transaction not already created
                var transactionObjId = await controllerDB.createTransaction(pendingTransactions[i])
                transaction = await controllerDB.updateTransactionHash(transactionObjId, newBlock.hash)
                userFrom = await controllerDB.getUserData(transaction.idWalletFrom)
                userTo = await controllerDB.getUserData(transaction.idWalletTo)
                if (transaction.typeTransaction == "U") {

                    if (userFrom.typeUser == "I") {
                        await controllerDB.paymentToSystem(userFrom.id, transaction.uniPointIds, transaction.id)
                    }
                    await controllerDB.updateHashUniReward(pendingIdsTransactions[i], newBlock.hash)

                }
            } else {
                //Transaction already created
                transaction = await controllerDB.updateTransactionHash(pendingIdsTransactions[i], newBlock.hash)
                userFrom = await controllerDB.getUserData(transaction.idWalletFrom)
                userTo = await controllerDB.getUserData(transaction.idWalletTo)
            }
            await controllerDB.updateHashUniPoint(pendingIdsTransactions[i], newBlock.hash)
            await controllerDB.updateTransactionIds(userFrom.id, transaction.id)
            await controllerDB.updateTransactionIds(userTo.id, transaction.id)

        }
        arrayPoints.splice(0, arrayPoints.length)
        pendingTransactions.splice(0, pendingTransactions.length)
        pendingIdsTransactions.splice(0, pendingIdsTransactions.length)

    } else {

        if (validBlockchain == false) {
            valid = false
            console.log("Error - Blockchain ins't correct")
        } else {
            console.log("NO, there aren't pending Transactions")
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
    valid = true
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

module.exports = router;