/*
 *Imports
 */
const Block = require('../block');
const Wallet = require('../wallet');
const Transaction = require('../transaction');
var express = require('express');
const controllerDB = require('../controllers/controllerDatabase');

/*
 *Configuration zone
 */
var router = express.Router();
var pendingTransactions = [];
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

router.get('/getAllRewardsList', async function(req, res) {

    var rewardsList = await controllerDB.getAllRewards()
    res.send(rewardsList)

});


router.get('/getSpecificUser/:id', async function(req, res) {

    console.log(req.params.id + " is an " + typeof req.params.id)
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
    if (valid) {

        var arrayPoints = []
        var isNameURExist = proveKey('nameUR', 'string', req.body)
        var isDescriptionURExist = proveKey('descriptionUR', 'string', req.body)
        var isImageURExist = proveKey('imageUR', 'string', req.body)
        var isCostRewardExist = proveKey('costReward', 'number', req.body)
        var isUsernameExist = proveKey('username', 'string', req.body)
        var isPasswordExist = proveKey('password', 'string', req.body)

        if (isNameURExist && isDescriptionURExist && isImageURExist && isUsernameExist && isPasswordExist && isCostRewardExist) {

            let idUser = await controllerDB.obtainUserId(req.body.username, req.body.password)
            let isUserDelete = await controllerDB.isUserDeleted(idUser)

            if (idUser != null && !isUserDelete && req.body.costReward > 0) {

                let userType = await controllerDB.obtainUserType(req.body.username, req.body.password)

                if (userType == "I") {

                    let userFromAddressID = await controllerDB.findUserAddress("System")
                    let userToAddressID = await controllerDB.findUserAddress(req.body.username)

                    if (userFromAddressID != null) {

                        let uniReward = await controllerDB.createUniReward(req, idUser)

                        if (uniReward != null) {

                            let userFromId = await controllerDB.findUserAddressID(userFromAddressID)
                            let userToId = await controllerDB.findUserAddressID(userToAddressID)
                            var idsWallets = [userFromId, userToId]

                            let isDeletedWallet1 = await controllerDB.obtainDeleteField(userFromId, 1)
                            let isDeletedWallet2 = await controllerDB.obtainDeleteField(userToId, 1)
                            let concept = "Giving UniPoints referrer to UniReward: " + req.body.nameUR

                            if (!isDeletedWallet1 && !isDeletedWallet2) {

                                let newTransac = new Transaction(userFromAddressID, userToAddressID, req.body.costReward, null, "M", idsWallets, concept)
                                let transactionObj = await controllerDB.createTransaction(newTransac)
                                addPendingTransaction(transactionObj)
                                let userWalletId = await controllerDB.obtainWalletId(idUser)

                                for (var i = 0; i < req.body.costReward; i++) {
                                    var jsonObj = {
                                        timestamp: new Date(),
                                        WalletId: userWalletId
                                    }
                                    arrayPoints.push(jsonObj)
                                }

                                var idPoints = await controllerDB.createPoint(arrayPoints)
                                await controllerDB.paymentFromSystem(userWalletId, idPoints)
                                idPoints.splice(0, idPoints.length)

                                console.log("OK - Reward created")
                                res.send("OK - Reward created")
                            } else {

                                console.log("Can't do the payment - Reason: Not exist destiny or sender wallet")
                                res.send("Can't do the payment - Reason: Not exist destiny or sender wallet")

                            }
                        } else {

                            console.log("Reward not created - UniReward already exists")
                            res.send("Reward not created - UniReward already exists")

                        }

                    } else {

                        console.log("Reward not created - Reason: System User for points transation dosen't exist")
                        res.send("Reward not created - Reason: System User for points transation dosen't exist")

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
    if (valid) {

        var isFromAddressNameExist = proveKey('fromAddressUN', 'string', req.body)
        var isToAddresNameExist = proveKey('toAddressUN', 'string', req.body)
        var isTypeTransactionExist = proveKey('typeT', 'string', req.body)
        var isPasswordFromExist = proveKey('passwordFrom', 'string', req.body)
        var isConceptExist = proveKey('concept', 'string', req.body)

        if (isFromAddressNameExist && isToAddresNameExist && isTypeTransactionExist && isPasswordFromExist && isConceptExist) {

            let userId

            if (req.body.typeT == "M") {
                userId = await controllerDB.obtainUserId(req.body.fromAddressUN, req.body.passwordFrom)
            } else {
                userId = await controllerDB.obtainUserId(req.body.toAddressUN, req.body.passwordFrom)
            }

            if (userId != null) {

                let isUserDeleted = await controllerDB.isUserDeleted(userId)

                if (isUserDeleted != null && isUserDeleted == false) {

                    let userFromAddress = await controllerDB.findUserAddress(req.body.fromAddressUN)
                    let toAddress = await controllerDB.findUserAddress(req.body.toAddressUN)

                    if (req.body.typeT == "M") {

                        var isMoneyExist = proveKey('moneyTo', 'number', req.body)

                        if (isMoneyExist && (userFromAddress != toAddress)) {

                            let userFromId = await controllerDB.findUserAddressID(userFromAddress)
                            let userToId = await controllerDB.findUserAddressID(toAddress)
                            var idsWallets = [userFromId, userToId]

                            let newTransac = new Transaction(userFromAddress, toAddress, req.body.moneyTo, null, req.body.typeT, idsWallets, req.body.concept)

                            let userMoneyWallet = await controllerDB.getUserMoney(userFromId)
                            let isDeletedWallet1 = await controllerDB.obtainDeleteField(userFromId, 1)
                            let isDeletedWallet2 = await controllerDB.obtainDeleteField(userToId, 1)

                            if ((userToId != null && userFromId != null) && userMoneyWallet >= req.body.moneyTo &&
                                (!isDeletedWallet1 && !isDeletedWallet2) && newTransac.amount > 0) {

                                let transactionObj = await controllerDB.createTransaction(newTransac)
                                addPendingTransaction(transactionObj)
                                controllerDB.paymentPersonToPerson(userFromId, userToId, req.body.moneyTo)
                                res.send("OK - Transaction created")

                            } else if (userMoneyWallet < req.body.moneyTo) {

                                console.log("Can't do the payment - Reason: Amount of money in wallet is insuficient")
                                res.send("Can't do the payment - Reason: Amount of money in wallet is insuficient")

                            } else if (newTransac.amount <= 0) {

                                console.log("Can't do the payment - Reason: Amount of money can't be 0 cost or negative cost")
                                res.send("Can't do the payment - Reason: Amount of money can't be 0 cost or negative cost")

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

                            if (userFromAddress == toAddress) {

                                console.log("Can't finish the Transaction - Reason: User From and User Destiny can't be the same")
                                res.send("Can't finish the Transaction - User From and User Destiny can't be the same")

                            } else {

                                console.log("Can't finish the Transaction - Reason: Not correct parameters")
                                res.send("Can't finish the Transaction - Reason: Not correct paramaters")

                            }
                        }
                    } else {

                        if (req.body.typeT == "U") {

                            var isUniRewardTransactionExist = proveKey('uniRewardT', 'string', req.body)

                            if (isUniRewardTransactionExist) {

                                var idMatch = 0
                                userFromAddress = await controllerDB.findUserAddress("System")
                                let systemId = await controllerDB.findUserAddressID(userFromAddress)
                                let userToId = await controllerDB.findUserAddressID(toAddress)
                                var idsWallets = [systemId, userToId]

                                let isDeletedWallet1 = await controllerDB.obtainDeleteField(systemId, 1)
                                let isDeletedWallet2 = await controllerDB.obtainDeleteField(userToId, 1)

                                let uniRewardId = await controllerDB.getUniRewardId(req.body.uniRewardT)
                                let uniRewardsInWallet = await controllerDB.getUniRewardInWallet(userId)
                                let uniRewardPurchase = await controllerDB.getPurchaseField(uniRewardId)
                                console.log("Prove that UniReward exist already in wallet")

                                for (var i = 0; i < uniRewardsInWallet.length; i++) {
                                    if (uniRewardsInWallet[i] == uniRewardId) {
                                        console.log("UniReward already exists")
                                        idMatch++
                                    }
                                }

                                if (!(idMatch > 0) && !uniRewardPurchase && (userToId != null && systemId != null)) {
                                    let nameTo = await controllerDB.getUserWalletName(userToId)
                                    let concept = "Giving to " + nameTo + " the UniReward: " + req.body.uniRewardT
                                    let newTransac = new Transaction(userFromAddress, toAddress, req.body.moneyTo, uniRewardId, req.body.typeT, idsWallets, concept)
                                    let userMoneyWallet = await controllerDB.getUserMoney(userToId)
                                    let specificUR = await controllerDB.getSpecificUR(uniRewardId)
                                    let user = await controllerDB.getUserData(userId)
                                    if ((!isDeletedWallet1 && !isDeletedWallet2) && userMoneyWallet >= specificUR.cost && req.body.moneyTo == specificUR.cost && userMoneyWallet >= req.body.moneyTo && user.typeUser != "I") {
                                        let transactionObj = await controllerDB.createTransaction(newTransac)
                                        await controllerDB.updateIdArrayWallet(userId, uniRewardId)
                                        await controllerDB.updatePurchaseField(uniRewardId)
                                        var idsToChange = await controllerDB.paymentPersonToPerson(userToId, systemId, req.body.moneyTo)
                                        await controllerDB.moveToMoneyExp(idsToChange, systemId, uniRewardId)
                                        await controllerDB.updatePurchasePoints(idsToChange)
                                        addPendingTransaction(transactionObj)
                                        console.log("OK - Transaction created")
                                        res.send("OK - Transaction created")
                                    } else {

                                        if (user.typeUser == "I") {
                                            console.log("Can't do the payment - Reason: Instructor can't purchase a UniReward")
                                            res.send("Can't do the payment - Reason: Instructor can't purchase a UniReward")
                                        } else if (userMoneyWallet < specificUR.cost) {
                                            console.log("Can't do the payment - Reason: Amount of money in wallet is insuficient")
                                            res.send("Can't do the payment - Reason: Amount of money in wallet is insuficient")
                                        } else {

                                            if (isDeletedWallet1 == true || isDeletedWallet2 == true) {
                                                console.log("Can't do the payment - Reason: Not exist destiny or sender wallet")
                                                res.send("Can't do the payment - Reason: Not exist destiny or sender wallet")
                                            } else {
                                                console.log("Can't do the payment - Reason: Not delivery correct amount to UniReward (Correct amount: " + specificUR.cost + " UniPoints)")
                                                res.send("Can't do the payment - Reason: Not delivery correct amount to UniReward (Correct amount: " + specificUR.cost + " UniPoints)")
                                            }
                                        }

                                    }
                                } else {
                                    console.log("Can't finish the Transaction - Reason: Reward already purchase")
                                    res.send("Can't finish the Transaction - Reason: Reward already purchase")
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
                    console.log("Can't finish the Transaction - Reason: User dosen't Exist")
                    res.send("Can't finish the Transaction - Reason: User dosen't Exists")
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
        let isRoleExist = proveKey('roleUser', 'string', req.body)

        if (isNameExist && isUserNameExist && isFullSurnameExist && isPasswordExist && isRoleExist) {

            let userAlreadyCreated = await controllerDB.isUserCreated(req.body.username)

            if (userAlreadyCreated == false) {

                if (req.body.roleUser == "N" || req.body.roleUser == "I") {

                    await controllerDB.createUser(req)
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
        console.log(pendingTransactions)
        let lastIndex = await controllerDB.getLastBlockIndex()

        if (lastIndex == 0) {

            var genesisBlock = new Block(lastIndex, new Date(), [], "0")
            genesisBlock.hash = genesisBlock.calculateHash()
            await controllerDB.createBlock(genesisBlock)
            lastIndex++
        }

        let prevHash = await controllerDB.getHashLastBlock(lastIndex - 1)
        let newBlock = new Block(lastIndex, new Date(), pendingTransactions, prevHash)
        newBlock.hash = newBlock.calculateHash()
        await controllerDB.createBlock(newBlock)
        pendingTransactions.splice(0, pendingTransactions.length)
        console.log(pendingTransactions)

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