/*
 *Imports
 */

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

const exportsC = require('../exportsClass');
var finalFlag = exportsC.setFlag(false);

var router = express.Router();
var pendingTransactions = [];
var pendingUniRewards = [];
var pendingIdsTransactions = [];
var arrayPoints = [];
var validBlockchain = true
var finalFlag = false
var periodicFunct = setInterval(() => periodicFunction(), 5000);


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
    var id = parseInt((req.params.id).replace(':', ''))
    console.log(id)
    if (!isNaN(id)) {
        var userName = await controllerUserDB.getUsername(id)
        res.send(userName)
    } else {
        res.send("User data don't loaded - Reason: No user to load data")
    }
});

router.get('/getUserRole/:id', async function(req, res) {
    var id = parseInt((req.params.id).replace(':', ''))
    console.log(id)
    if (!isNaN(id)) {
        var user = await controllerUserDB.getUserData(id)
        res.send(user.typeUser)
    } else {
        res.send("User data don't loaded - Reason: No user to load data")
    }
});

router.get('/getUserID/:username', async function(req, res) {
    var userId = await controllerUserDB.getUserID((req.params.username).replace(':', ''))
    res.send("" + userId)
});

router.post('/loginUser', async function(req, res) {
    var isUsernameExist = exportsC.proveKey('username', 'string', req.body)
    var isPasswordExist = exportsC.proveKey('password', 'string', req.body)
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
    var id = parseInt((req.params.id).replace(':', ''))
    console.log(id)
    if (!isNaN(id)) {
        var rewardsList = await controllerUniRewardDB.getAllRewards((req.params.id).replace(':', ''), (req.params.purch).replace(':', ''))
        res.send(rewardsList)
    } else {
        res.send("User data don't loaded - Reason: No user to load data")
    }
});

router.get('/getAllSmartContractsUser/:id/', async function(req, res) {
    var id = parseInt((req.params.id).replace(':', ''))
    console.log(id)
    if (!isNaN(id)) {
        var smartContractsList = await controllerSContractDB.getAllSmartContractsUser(id)
        console.log("This is smartContracts: " + smartContractsList)
        console.log(smartContractsList.length)
        smartContractsList.length != 0 ? res.send(smartContractsList) : res.send(null)
    } else {
        res.send("User data don't loaded - Reason: No user to load data")
    }

});

router.get('/getSpecificUser/:id', async function(req, res) {

    var id = parseInt((req.params.id).replace(':', ''))
    console.log(id + " " + isNaN(id))
    if (!isNaN(id)) {
        var userData = await controllerUserDB.getUserData(id)
        res.send(userData)
    } else {
        res.send("User data don't loaded - Reason: No user to load data")
    }
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
    var id = parseInt((req.params.id).replace(':', ''))
    console.log(id)
    if (!isNaN(id)) {
        console.log(req.params.id + " is an " + typeof req.params.id)
        console.log(id)

        var walletData = await controllerWalletDB.getUserWalletData(id)

        res.send(walletData)
    } else {
        res.send("User data don't loaded - Reason: No user to load data")
    }
});

/*
 * Routes Creation Object
 */

router.post('/createNewReward', async function(req, res) {

    if (validBlockchain && !finalFlag) {

        var isNameURExist = exportsC.proveKey('nameUR', 'string', req.body)
        var isDescriptionURExist = exportsC.proveKey('descriptionUR', 'string', req.body)
        var isImageURExist = exportsC.proveKey('imageUR', 'string', req.body)
        var isCostRewardExist = exportsC.proveKey('costReward', 'number', req.body)
        var isUsernameExist = exportsC.proveKey('username', 'string', req.body)
        var isPasswordExist = exportsC.proveKey('password', 'string', req.body)
        var isUserCourseExist = exportsC.proveKey('usernameCourse', 'string', req.body)

        if (isNameURExist && isDescriptionURExist && isImageURExist && isUsernameExist && isPasswordExist && isCostRewardExist && isUserCourseExist) {

            var responseServer = []
            responseServer = await controllerUniReward.createUniRewardObject(res, req, pendingUniRewards, arrayPoints, pendingTransactions)
            console.log("I'm response server: " + responseServer[0] + "\n" + responseServer[0].id)
            if (responseServer != undefined && responseServer.length == 1) {
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
        if (finalFlag) {
            console.log("Reward not created - Reason: Server is doing a restart")
            res.send("Reward not created - Reason: Server is doing a restart")
        } else {
            console.log("Reward not created - Reason: Blockchain isn't valid")
            res.send("Reward not created - Reason: Blockchain isn't valid")
        }
    }
});

router.post('/createNewTransaction', async function(req, res) {
    if (validBlockchain && !finalFlag) {

        var isFromAddressNameExist = exportsC.proveKey('fromAddressUN', 'string', req.body)
        var isToAddresNameExist = exportsC.proveKey('toAddressUN', 'string', req.body)
        var isTypeTransactionExist = exportsC.proveKey('typeT', 'string', req.body)
        var isPasswordFromExist = exportsC.proveKey('password', 'string', req.body)
        var isConceptExist = exportsC.proveKey('concept', 'string', req.body)
        var isMoneyExist = exportsC.proveKey('moneyTo', 'number', req.body)
        var isUniRewardId = exportsC.proveKey('uniRewardId', 'string', req.body)

        if (isFromAddressNameExist && isToAddresNameExist && isTypeTransactionExist && isPasswordFromExist && isConceptExist && isMoneyExist && isUniRewardId) {

            var responseServer = []
            responseServer = await controllerTransaction.createTransactionObject(req, res)

            if (!(typeof responseServer === 'string')) {
                if (responseServer != undefined && responseServer.length == 2) {
                    console.log("Hello im the responseServer vector" + responseServer[0] + "and " + responseServer[1])
                    addPendingTransaction(responseServer[0])
                    addPendingIds(responseServer[1])
                    res.send("OK - Delivery complete")
                }
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
    if (validBlockchain && !finalFlag) {

        let isNameExist = exportsC.proveKey('name', 'string', req.body)
        let isUserNameExist = exportsC.proveKey('username', 'string', req.body)
        let isFullSurnameExist = exportsC.proveKey('fullSurname', 'string', req.body)
        let isPasswordExist = exportsC.proveKey('password', 'string', req.body)
        let isRoleExist = exportsC.proveKey('typeUser', 'string', req.body)

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

router.post('/changeUserData', async function(req, res) {

    let isUserNameExist = exportsC.proveKey('username', 'string', req.body)
    let isPasswordExist = exportsC.proveKey('password', 'string', req.body)
    let isChangesExist = exportsC.proveKey('changes', 'object', req.body)

    if (isUserNameExist && isPasswordExist && isChangesExist) {

        var userModify = await controllerUser.modifyUserData(req, res)

        if (userModify == true) {
            console.log("User data changed")
            res.send("User data changed")
        } else {
            console.log("User data dont changed")
            res.send("User data dont changed")
        }

    } else {
        console.log("User not modify - Reason: Parameters are not corrects")
        res.send("User not modify - Reason: Parameters are not corrects")
    }
});

router.post('/deleteUser', async function(req, res) {

    let isUserIdExist = exportsC.proveKey('id', 'number', req.body)

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

function addPendingIds(id) {
    pendingIdsTransactions.push(id)
}

async function periodicFunction() {

    console.log("Time has passed, time for block creation. ¿There are pending transactions?")
    validBlockchain = await isValidBlockchain()
    console.log(validBlockchain)
    if (pendingTransactions.length > 0 && validBlockchain && !finalFlag) {

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
            if (finalFlag) {
                console.log("Can't operate on platform because there is a reset of database")
            } else {
                console.log("NO, there aren't pending Transactions")
            }
        }
    }

    console.log("Maintenance ====================================== " + exportsC.getFlag())

    finalFlag = exportsC.getFlag()
    console.log("Can visualice Smart Contracts?" + validBlockchain + finalFlag)
    if (validBlockchain && !finalFlag) {
        controllerSContract.proveStateSC()
    }
}

async function isValidBlockchain() {

    console.log("¿Is Blockchain valid?")
    return controllerBlockchain.isBlockchainValid()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = router;