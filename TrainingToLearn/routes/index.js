/*
 *Imports
 */
const Block = require('../block');
const Transaction = require('../transaction');
const SmartContract = require('../smartContract');

var express = require('express');

const controllerSContract = require('../controllers/endpoints/controllerSContract');
const controllerBlockchain = require('../controllers/endpoints/controllerBlockchain')
const controllerTransaction = require('../controllers/endpoints/controllerTransactions')
const controllerUniReward = require('../controllers/endpoints/controllerUniReward')
const controllerUser = require('../controllers/endpoints/controllerUser')

const controllerSContractDB = require('../controllers/database/controllerSContractDB');
const controllerWalletDB = require('../controllers/database/controllerWalletDB')
const controllerUniRewardDB = require('../controllers/database/controllerUniRewardDB')
const controllerUserDB = require('../controllers/database/controllerUserDB')

var router = express.Router();
var pendingTransactions = [];
var pendingUniRewards = [];
var pendingIdsTransactions = [];
var arrayPoints = [];
var smartContractList = [];
var validBlockchain = true
var finalFlag = process.env.FLAG_CREATION_DATABASE
var periodicFunct = setInterval(() => createBlock(), 5000);


/*
 * Default Route
 */

router.get('/', (req) => {

    res.send('Hey!')

});


router.get('/getAllUsersList', async function(req, res) {
    var usersList = await controllerUserDB.getAllUsers()
    res.send(usersList)

});

router.get('/getUsersName/:id', async function(req, res) {
    var userName = await controllerUserDB.getUsername(parseInt((req.params.id).replace(':', '')))
    res.send(userName)
});

router.get('/getUserRole/:id', async function(req, res) {
    var user = await controllerUserDB.getUserData(parseInt((req.params.id).replace(':', '')))
    res.send(user.typeUser)
});

router.get('/getUserID/:username', async function(req, res) {
    var userId = await controllerUserDB.getUserID((req.params.username).replace(':', ''))
    res.send("" + userId)
});

router.post('/loginUser', async function(req, res) {
    var isUsernameExist = proveKey('username', 'string', req.body)
    var isPasswordExist = proveKey('password', 'string', req.body)
    if (isUsernameExist && isPasswordExist) {
        var userId = await controllerUserDB.obtainUserId(req.body.username, req.body.password)
        if (userId != null) {
            res.send("" + userId)
        } else {
            res.send("Can't login - Reason: Don't exist an user with this password or username")
        }

    } else {
        res.send("Can't login - Reason: Not correct parameters")
    }
});

router.get('/getAllRewardsList/:id/:purch', async function(req, res) {
    console.log(parseInt((req.params.id).replace(':', '')))

    var rewardsList = await controllerUniRewardDB.getAllRewards((req.params.id).replace(':', ''), (req.params.purch).replace(':', ''))
    res.send(rewardsList)

});

router.get('/getAllSmartContractsUser/:id/', async function(req, res) {
    console.log(parseInt((req.params.id).replace(':', '')))

    var smartContractsList = await controllerSContractDB.getAllSmartContractsUser(parseInt((req.params.id).replace(':', '')))
    console.log("This is smartContracts: " + smartContractsList)
    console.log(smartContractsList.length)
    smartContractsList.length != 0 ? res.send(smartContractsList) : res.send(null)
});

router.get('/getSpecificUser/:id', async function(req, res) {

    console.log(parseInt((req.params.id).replace(':', '')))

    var userData = await controllerUserDB.getUserData(parseInt((req.params.id).replace(':', '')))

    res.send(userData)

});

router.post('/getSpecificUserID', async function(req, res) {

    var userID = await controllerUserDB.getSpecificUserID(req.body.username, req.body.password)

    if (userID != null) {
        res.send("" + userID)
    } else {
        res.send(null)
    }

});

router.get('/getSpecificWallet/:id', async function(req, res) {

    console.log(req.params.id + " is an " + typeof req.params.id)
    console.log(parseInt((req.params.id).replace(':', '')))

    var walletData = await controllerWalletDB.getUserWalletData(parseInt((req.params.id).replace(':', '')))

    res.send(walletData)

});

/*
 * Routes Creation Object
 */

router.post('/createNewReward', async function(req, res) {

    if (validBlockchain && JSON.stringify(process.env.FLAG_CREATION_DATABASE) === JSON.stringify("0")) {

        var isNameURExist = proveKey('nameUR', 'string', req.body)
        var isDescriptionURExist = proveKey('descriptionUR', 'string', req.body)
        var isImageURExist = proveKey('imageUR', 'string', req.body)
        var isCostRewardExist = proveKey('costReward', 'number', req.body)
        var isUsernameExist = proveKey('username', 'string', req.body)
        var isPasswordExist = proveKey('password', 'string', req.body)
        var isUserCourseExist = proveKey('usernameCourse', 'string', req.body)

        if (isNameURExist && isDescriptionURExist && isImageURExist && isUsernameExist && isPasswordExist && isCostRewardExist && isUserCourseExist) {

            var responseServer = await controllerUniReward.createUniRewardObject(res, req, pendingUniRewards, arrayPoints, pendingTransactions)
            console.log("I'm response server: " + responseServer + "\n" + responseServer[0].id)
            if (responseServer != undefined) {
                addPendingTransaction(responseServer[0])
                addPendingIds(responseServer[0].id)
                sleep(2000)
                console.log("OK - Reward will be created")
                res.send("OK - Reward will be created")
            }

        } else {

            console.log("Reward not created - Reason: Incorrect params, someone of the params are not correct")
            res.send("Reward not created - Reason: Incorrect params, someone of the params are not correct")

        }
    } else {
        if (!(JSON.stringify(process.env.FLAG_CREATION_DATABASE) === "0")) {
            console.log("Reward not created - Reason: Server is doing a restart")
            res.send("Reward not created - Reason: Server is doing a restart")
        } else {
            console.log("Reward not created - Reason: Blockchain isn't valid")
            res.send("Reward not created - Reason: Blockchain isn't valid")
        }
    }
});

router.post('/createNewTransaction', async function(req, res) {
    if (validBlockchain && process.env.FLAG_CREATION_DATABASE == false) {

        var isFromAddressNameExist = proveKey('fromAddressUN', 'string', req.body)
        var isToAddresNameExist = proveKey('toAddressUN', 'string', req.body)
        var isTypeTransactionExist = proveKey('typeT', 'string', req.body)
        var isPasswordFromExist = proveKey('passwordFrom', 'string', req.body)
        var isConceptExist = proveKey('concept', 'string', req.body)
        var isMoneyExist = proveKey('moneyTo', 'number', req.body)
        var isUniRewardId = proveKey('uniRewardId', 'string', req.body)

        if (isFromAddressNameExist && isToAddresNameExist && isTypeTransactionExist && isPasswordFromExist && isConceptExist && isMoneyExist && isUniRewardId) {

            var responseServer = await controllerTransaction.createTransactionObject(req, res)
            if (responseServer != undefined && responseServer.length > 2) {
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

router.post('/createNewUser', async function(req, res) {
    if (validBlockchain && process.env.FLAG_CREATION_DATABASE == false) {

        let isNameExist = proveKey('name', 'string', req.body)
        let isUserNameExist = proveKey('username', 'string', req.body)
        let isFullSurnameExist = proveKey('fullSurname', 'string', req.body)
        let isPasswordExist = proveKey('password', 'string', req.body)
        let isRoleExist = proveKey('typeUser', 'string', req.body)

        if (isNameExist && isUserNameExist && isFullSurnameExist && isPasswordExist && isRoleExist) {

            controllerUser.createNewUser(req, res)

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

        var userModify = await controllerUser.modifyUserData(req, res)

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
});

router.post('/deleteUser', async function(req, res) {

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
    validBlockchain = await isValidBlockchain()
    console.log(validBlockchain)
    if (pendingTransactions.length > 0 && validBlockchain && JSON.stringify(process.env.FLAG_CREATION_DATABASE) === JSON.stringify("0")) {

        console.log("YES, there are pending Transactions")
        var newBlock = await controllerBlockchain.createBlockObject(pendingIdsTransactions)

        if (pendingUniRewards.length > 0) {

            await controllerUniReward.createUniReward(pendingUniRewards, arrayPoints, newBlock.hash)

        }

        await controllerTransaction.createAndUpdateTransactions(pendingTransactions, pendingIdsTransactions, newBlock.hash)

        arrayPoints.splice(0, arrayPoints.length)
        pendingUniRewards.splice(0, pendingUniRewards.length)
        pendingTransactions.splice(0, pendingTransactions.length)
        pendingIdsTransactions.splice(0, pendingIdsTransactions.length)


    } else {
        if (validBlockchain == false) {
            console.log("Error - Blockchain ins't correct")
        } else {
            console.log("NO, there aren't pending Transactions")
        }
    }

    //console.log("Maintenance ====================================== " + process.env.FLAG_CREATION_DATABASE)

    if (validBlockchain) {
        controllerSContract.proveStateSC()
    }
}

async function isValidBlockchain() {

    console.log("¿Is Blockchain valid?")
    return controllerBlockchain.isBlockchainValid()
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