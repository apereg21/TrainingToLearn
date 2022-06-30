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
var arrayPoints = [];
var validBlockchain = true
var finalFlag = false
var periodicFunct = setInterval(() => periodicFunction(), 15000);


/*
 * Default Route
 */

router.get('/', (req) => {
    res.send('Hey!')
});


router.get('/getAllUsersList', async function(req, res) {
    var usersList = await controllerUserDB.getAllUsers()
    if (usersList != null) {
        usersList.splice(0, 1);
        res.send(usersList)
    } else {
        console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
        res.send("User data don't loaded - Reason: The database isn't correct, try to restore DB")
    }
});

router.get('/getUsersName/:id', async function(req, res) {
    var id = parseInt((req.params.id).replace(':', ''))
    console.log(id)
    if (!isNaN(id) && id != 1) {
        var userName = await controllerUserDB.getUsername(id)
        if (userName != null) {
            res.send(userName)
        } else {
            if (userName != false) {
                console.log("User data don't loaded - Reason: No user located with this id")
                res.send("User data don't loaded - Reason: No user located with this id")
            } else {
                console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
                res.send("User data don't loaded - Reason: The database isn't correct, try to restore DB")
            }
        }

    } else {
        if (id == 1) {
            console.log("User data don't loaded - Reason: No user located with this id")
            res.send("User data don't loaded - Reason: No user located with this id")
        } else {
            res.send("User data don't loaded - Reason: No user to load data")
        }
    }
});

router.get('/getUserRole/:id', async function(req, res) {
    var id = parseInt((req.params.id).replace(':', ''))
    if (!isNaN(id)) {
        var user = await controllerUserDB.getUserData(id)
        if (user != null && user != false) {
            if (user.id != 1) {
                res.send(user.typeUser)
            } else {
                console.log("User data don't loaded - Reason: Dosen't exists")
                res.send("User data don't loaded - Reason: Dosen't exists")
            }
        } else {
            if (user == false) {
                console.log("User data don't loaded - Reason: Dosen't exists")
                res.send("User data don't loaded - Reason: Dosen't exists")
            } else {
                console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
                res.send("User data don't loaded - Reason: The database isn't correct, try to restore DB")
            }

        }

    } else {
        res.send("User data don't loaded - Reason: No user to load data")
    }
});

router.get('/getUserID/:username', async function(req, res) {

    if (typeof((req.params.username).replace(':', '')) == 'string') {
        var userId = await controllerUserDB.getUserID((req.params.username).replace(':', ''))

        if (userId != null && userId != false && userId != 1) {
            res.send("" + userId)
        } else {
            if (userId == false || userId == 1) {
                console.log("User data don't loaded - Reason: Dosen't exists")
                res.send("User data don't loaded - Reason: Dosen't exists")
            } else {
                console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
                res.send("User data don't loaded - Reason: The database isn't correct, try to restore DB")
            }
        }
    } else {
        res.send("User username don't located - Reason: Not correct type of parameter")
    }
});

router.post('/loginUser', async function(req, res) {
    var isUsernameExist = exportsC.proveKey('username', 'string', req.body)
    var isPasswordExist = exportsC.proveKey('password', 'string', req.body)
    if (isUsernameExist && isPasswordExist) {
        var userId = await controllerUserDB.obtainUserId(req.body.username, req.body.password)
        if (userId != null && typeof userId != 'string' && userId != 1) {
            var userData = await controllerUserDB.getUserData(userId)
            console.log("Userdata: " + userData.deleted)
            if (!userData.deleted) {
                res.send("" + userId)
            } else {
                res.send("Can't login - Reason: Don't exist an user with this password or username")
            }

        } else {
            if (typeof userId == "string") {
                console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
                res.send("Can't login - Reason: The database isn't correct, try to restore DB")
            } else {
                res.send("Can't login - Reason: Don't exist an user with this password or username")
            }
        }

    } else {
        res.send("Can't login - Reason: Not correct parameters")
    }
});

router.get('/getAllRewardsList/:id/:purch', async function(req, res) {
    var id = parseInt((req.params.id).replace(':', ''))
    console.log(id)
    if (!isNaN(id) || typeof((req.params.purch).replace(':', '')) == 'boolean') {
        var rewardsList = await controllerUniRewardDB.getAllRewards((req.params.id).replace(':', ''), (req.params.purch).replace(':', ''))
        if (rewardsList != null && rewardsList != false) {
            res.send(rewardsList)
        } else {
            if (rewardsList == false) {
                console.log("User data don't loaded - Reason: Dosen't exists")
                res.send("User data don't loaded - Reason: Dosen't exists")
            } else {
                console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
                res.send("User data don't loaded - Reason: The database isn't correct, try to restore DB")
            }
        }

    } else {
        res.send("User data don't loaded - Reason: No user to load data")
    }
});

router.get('/getAllSmartContractsUser/:id/', async function(req, res) {
    var id = parseInt((req.params.id).replace(':', ''))
    if (!isNaN(id)) {
        var smartContractsList = await controllerSContractDB.getAllSmartContractsUser(id)
        if (smartContractsList != null && smartContractsList != false && typeof smartContractsList != 'string') {
            console.log("This is smartContracts: " + smartContractsList)
            console.log(smartContractsList.length)
            smartContractsList.length != 0 ? res.send(smartContractsList) : res.send("No courses are activated for the user")
        } else {
            console.log(smartContractsList)
            if (smartContractsList == false || smartContractsList == null) {
                console.log("User data don't loaded - Reason: Dosen't exists")
                res.send("User data don't loaded - Reason: Dosen't exists")
            } else {
                console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
                res.send("User data don't loaded - Reason: The database isn't correct, try to restore DB")
            }
        }

    } else {
        res.send("User data don't loaded - Reason: No user to load data")
    }

});

router.get('/getSpecificUser/:id', async function(req, res) {

    var id = parseInt((req.params.id).replace(':', ''))
    console.log(id + " " + isNaN(id))
    if (!isNaN(id)) {
        var userData = await controllerUserDB.getUserData(id)
        if (userData != null) {
            if (userData != false) {
                res.send(userData)
            } else {
                console.log("User data don't loaded - Reason: Dosen't exists")
                res.send("User data don't loaded - Reason: Dosen't exists")
            }

        } else {
            console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
            res.send("User data don't loaded - Reason: The database isn't correct, try to restore DB")
        }

    } else {
        res.send("User data don't loaded - Reason: No user to load data")
    }
});

router.get('/getSpecificWallet/:id', async function(req, res) {
    var id = parseInt((req.params.id).replace(':', ''))
    console.log(id)
    if (!isNaN(id)) {

        var walletData = await controllerWalletDB.getUserWalletData(id)
        if (walletData != null && typeof walletData != 'string') {
            if (walletData != false) {
                res.send(walletData)
            } else {
                console.log("User data don't loaded - Reason: Dosen't exists")
                res.send("User data don't loaded - Reason: Dosen't exists")
            }

        } else {
            if (walletData == null) {
                console.log("User data don't loaded - Reason: Dosen't exists")
                res.send("User data don't loaded - Reason: Dosen't exists")
            } else {
                console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
                res.send("User data don't loaded - Reason: The database isn't correct, try to restore DB")
            }

        }

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
            responseServer = await controllerUniReward.createUniRewardObject(res, req, pendingUniRewards)
            console.log("I'm response server: " + responseServer[0] + "\n" + responseServer[0].id)
            if (responseServer != undefined && responseServer.length == 1) {
                addPendingTransaction(responseServer[0])

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
            responseServer = await controllerTransaction.createTransaction(req, res)

            if (!(typeof responseServer === 'string')) {
                if (responseServer != undefined && responseServer.length == 1) {
                    console.log("Hello im the responseServer vector" + responseServer[0])
                    addPendingTransaction(responseServer[0])
                    res.send("OK - Delivery complete")
                }
            }

        } else {

            console.log("Can't finish the Transaction - Reason: Not correct parameters")
            res.send("Can't finish the Transaction - Reason: Not correct paramaters")

        }
    } else {

        if (finalFlag) {
            console.log("Transaction not created - Reason: Server is doing a restart")
            res.send("Transaction not created - Reason: Server is doing a restart")
        } else {
            console.log("Transaction not created - Reason: Blockchain isn't valid")
            res.send("Transaction not created - Reason: Blockchain isn't valid")
        }

    }
});

router.post('/createNewUser', async function(req, res) {
    if (!finalFlag) {

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
        console.log("User not created - Reason: Server is doing a restart")
        res.send("User not created - Reason: Server is doing a restart")
    }
});

router.post('/changeUserData', async function(req, res) {

    let isUserNameExist = exportsC.proveKey('username', 'string', req.body)
    let isPasswordExist = exportsC.proveKey('password', 'string', req.body)
    let isChangesExist = exportsC.proveKey('changes', 'object', req.body)

    if (isUserNameExist && isPasswordExist && isChangesExist && !finalFlag) {
        var userModify = await controllerUser.modifyUserData(req, res)

        if (userModify == true) {
            console.log("OK - User data changed")
            res.send("OK - User data changed")
        } else {
            if (userModify == false) {
                console.log("User data dont change - Reason: Username or password ins't correct")
                res.send("User data dont change - Reason: Username or password ins't correct")
            } else {
                console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
                res.send("User data don't loaded - Reason: The database isn't correct, try to restore DB")
            }

        }

    } else {
        if (finalFlag) {
            console.log("User data not changed - Reason: Server is doing a restart")
            res.send("User data not changed - Reason: Server is doing a restart")
        } else {
            console.log("User not modified - Reason: Parameters are not corrects")
            res.send("User not modified - Reason: Parameters are not corrects")
        }
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

async function periodicFunction() {

    console.log("Time has passed, time for execute periodicFunction")
    validBlockchain = await isValidBlockchain()
    console.log(validBlockchain)
    if (pendingTransactions.length > 0 && validBlockchain && !finalFlag) {
        console.log("There are pending transactions and elements to create")

        //The transactions came without some values, this is the place where pending transactions are updated in these fields
        var pendingIdsTransaction = await controllerTransaction.obtainAndUpdateAllPendingTransactions(pendingTransactions)

        var newBlock = await controllerBlockchain.createBlock(pendingTransactions)
        if (pendingUniRewards.length > 0) {

            console.log("Creating a new UniReward")
            await controllerUniReward.createUniReward(pendingUniRewards, newBlock.hash)

            pendingUniRewards.splice(0, pendingUniRewards.length)
            arrayPoints.splice(0, arrayPoints.length)

        }
        await controllerTransaction.updateIdsUniPointsField(pendingTransactions, pendingIdsTransaction)
        console.log("Creating or update rest of elements")
        await controllerTransaction.createAndUpdateTransactions(pendingTransactions, newBlock.hash)

        pendingTransactions.splice(0, pendingTransactions.length)
        pendingIdsTransaction.splice(0, pendingIdsTransaction.length)

    } else {
        if (validBlockchain == false) {
            console.log("Error - Blockchain ins't correct")
        } else {
            if (finalFlag) {
                console.log("Can't operate on platform because there is a reset of database")
            } else {
                console.log("There aren't pending Transactions")
            }
        }
    }

    console.log("Maintenance ====================================== " + exportsC.getFlag())

    finalFlag = exportsC.getFlag()
    console.log("Can visualice Smart Contracts?" + validBlockchain == finalFlag)
    if (validBlockchain && !finalFlag) {
        controllerSContract.proveStateSC()
    }
}

async function isValidBlockchain() {

    console.log("¿Is Blockchain valid?")
    console.log(await controllerBlockchain.isBlockchainValid())
    return await controllerBlockchain.isBlockchainValid()
}

module.exports = router;