/*
 *Imports
 */
const Block = require('../block');
const Transaction = require('../transaction');
const SmartContract = require('../smartContract');

var express = require('express');

const controllerDB = require('../controllers/controllerDatabase');

//const controllerBlockC = require('../controllers/endpoints/controllerBlockchain')
const controllerTransaction = require('../controllers/endpoints/controllerTransactions')
const controllerUniReward = require('../controllers/endpoints/controllerUniReward')
const controllerUser = require('../controllers/endpoints/controllerUser')

//const controllerBlockCDB = require('../controllers/database/controllerBlockchainDB')
//const controllerSContractDB = require('../controllers/database/controllerSContract')
//const controllerTransactionDB = require('../controllers/database/controllerTransactions')
//const controllerUniRewardDB = require('../controllers/database/controllerUniReward')
//const controllerUserDB = require('../controllers/database/controllerUser')


/*
 *Configuration zone
 */
var router = express.Router();
var flagMaintenace = global.flag
var pendingTransactions = [];
var pendingUniRewards = [];
var pendingIdsTransactions = [];
var arrayPoints = [];
var smartContractList = [];
var validBlockchain = true
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
    if (validBlockchain && flagMaintenace==false) {
        var isNameURExist = proveKey('nameUR', 'string', req.body)
        var isDescriptionURExist = proveKey('descriptionUR', 'string', req.body)
        var isImageURExist = proveKey('imageUR', 'string', req.body)
        var isCostRewardExist = proveKey('costReward', 'number', req.body)
        var isUsernameExist = proveKey('username', 'string', req.body)
        var isPasswordExist = proveKey('password', 'string', req.body)
        var isUserCourseExist = proveKey('usernameCourse', 'string', req.body)

        if (isNameURExist && isDescriptionURExist && isImageURExist && isUsernameExist && isPasswordExist && isCostRewardExist && isUserCourseExist) {

            var responseServer = await controllerUniReward.createUniReward(res,req,pendingUniRewards,arrayPoints,pendingTransactions)
            console.log("I'm response server: "+responseServer + "\n" +responseServer[0].id)
            if(responseServer!=undefined){
                addPendingTransaction(responseServer[0])
                addPendingIds(responseServer[0].id)
                console.log("I'm a lot of things: "+pendingUniRewards,arrayPoints,pendingTransactions)
                sleep(2000)
                console.log("OK - Reward will be created")
                res.send("OK - Reward will be created") 
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
    if (validBlockchain && flagMaintenace==false) {

        var isFromAddressNameExist = proveKey('fromAddressUN', 'string', req.body)
        var isToAddresNameExist = proveKey('toAddressUN', 'string', req.body)
        var isTypeTransactionExist = proveKey('typeT', 'string', req.body)
        var isPasswordFromExist = proveKey('passwordFrom', 'string', req.body)
        var isConceptExist = proveKey('concept', 'string', req.body)
        var isMoneyExist = proveKey('moneyTo', 'number', req.body)
        var isUniRewardId = proveKey('uniRewardId', 'string', req.body)

        if (isFromAddressNameExist && isToAddresNameExist && isTypeTransactionExist && isPasswordFromExist && isConceptExist && isMoneyExist && isUniRewardId) {

            var responseServer = await controllerTransaction.createTransaction(req,res)
            if(responseServer.length > 2) {
                addPendingTransaction(responseServer[0])
                addPendingIds(responseServer[1])
                res.send("OK - Delivery complete")
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
    if (validBlockchain && flagMaintenace==false) {

        let isNameExist = proveKey('name', 'string', req.body)
        let isUserNameExist = proveKey('username', 'string', req.body)
        let isFullSurnameExist = proveKey('fullSurname', 'string', req.body)
        let isPasswordExist = proveKey('password', 'string', req.body)
        let isRoleExist = proveKey('typeUser', 'string', req.body)

        if (isNameExist && isUserNameExist && isFullSurnameExist && isPasswordExist && isRoleExist) {

            controllerUser.createNewUser(req,res)

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

        controllerUser.deleteUser(req, res)
        
    } else {
        console.log("User can't be deleted - Reason: Not correct parammeters")
        res.send("User can't be deleted - Reason: Not correct parammeters")
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

    if (pendingTransactions.length > 0 && validBlockchain && flagMaintenace==false) {

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

    console.log("Maintenance ====================================== "+ flagMaintenace)
    if (validBlockchain && flagMaintenace) {
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