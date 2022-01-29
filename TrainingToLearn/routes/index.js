//Imports
const Block = require('../block')
const Wallet = require('../wallet');
const Transaction = require('../transaction');
var express = require('express');
const controllerDB = require('../controllers/controllerDatabase');

//Configuration zone
var router = express.Router();
var pendingTransactions = [];

/*
 * Default Route
 */

router.get('/', (req) => {
    res.send('Hey!')
});

/*
 * Routes Creation Object
 */

//This router is used for create a new block in the blockain with an UniReward
//The UniReward is passed in form of body parameters in the petition (req field)
//Parameters are
/**  
 *  @param {string} nameUR
 *  @param {string} descriptionUR
 *  @param {string} imageUR
 *  @param {number} UserId
 *  @param {number} WalletId
 *  @param {string} userPrivateKey
 */
/*First of all, the funtion find de lastIndex to assing it to the new block, then 
 * there is a comprobation with this lastIndex, if lastIndex=0, we need to create the genesis block,
 * the first block of our blockchain. If lastIndex !=0 we can continue like an normal iteration.
 *
 * All querys to the database are formed in controllerDB class
 *
 * We need to find the hash of the previous block for the next steep. We do a query to the database and find
 * this value. We pass the lastIndex value to the function. Then we need to get the lastId of UniRewards table. 
 * Same operation with lastIndex of Blockchain. The next steep is create the UniReward calling to the function of 
 * the controllerDB.
 *
 * We do small brake with the sleep function, the thing we want with this is have some time to listen petitions
 * from createNewTransaction route. We the limit time is finished, we create newBlock with all the data generated previously
 * and calculate the hash block. Then we asociated the UniRewardId to the user's wallet
 */

//Blockchain Functions

router.post('/createNewReward', async function(req, res) {
    var isNameURExist = proveKey('nameUR', 'string', req.body)
    var isDescriptionURExist = proveKey('descriptionUR', 'string', req.body)
    var isImageURExist = proveKey('imageUR', 'string', req.body)
    var isUsernameExist = proveKey('username', 'string', req.body)
    var isPasswordExist = proveKey('password', 'string', req.body)
    if (isNameURExist && isDescriptionURExist && isImageURExist && isUsernameExist && isPasswordExist) {
        let lastIndex = await controllerDB.getLastBlockIndex()
        if (lastIndex == 0) {
            //There aren't blocks in the blockchain --> Adding the genesisBlock
            var genesisBlock = new Block(lastIndex, new Date(), {}, [], "0")
            genesisBlock.hash = genesisBlock.calculateHash()
            await controllerDB.createBlock(genesisBlock)
            lastIndex++
        }
        let prevHash = await controllerDB.getHashLastBlock(lastIndex - 1)
        let idUser = await controllerDB.obtainUserId(req.body.username, req.body.password)
        let isUserDelete = await controllerDB.isUserDeleted(idUser)
        if (idUser != null && !isUserDelete) {
            let uniReward = await controllerDB.createUniReward(req, idUser)
            await sleep(20000)
            if (prevHash == null || uniReward == null || (uniReward.nameUR == null || uniReward.descriptionUR == null || uniReward.imageUR == null || uniReward.UserId == null || uniReward.WalletId == null)) {
                console.log("Reward not created - Reason: Something with the UniReward fields isn't correct")
                res.send("Reward not created - Reason: Something with the UniReward fields isn't correct")
            } else {
                let newBlock = new Block(lastIndex, new Date(), uniReward, { transactions: pendingTransactions }, prevHash)
                newBlock.hash = newBlock.calculateHash()
                console.log(newBlock.hash)
                await controllerDB.createBlock(newBlock)
                await controllerDB.updateIdArrayWallet(idUser, uniReward.id, req.body.userPrivateKey, req.body.password)
                res.send("OK - Reward created")
            }
        } else {
            console.log("Reward not created - Reason: Username or password isn't correct")
            res.send("Reward not created - Reason: Username or password isn't correct")
        }
    } else {
        console.log("Reward not created - Reason: Incorrect params, someone of the params are not correct")
        res.send("Reward not created - Reason: Incorrect params, someone of the params are not correct")
    }
});

//This router is used for create a new Transaction and add this object to an array called pendingTransactions
//The Transaction is passed in form of body parameters in the petition (req field)
//Parameters are
/**  
 *  @param {string} fromAddress
 *  @param {string} toAddress
 *  @param {number} amount
 *  @param {number} UserId
 *  @param {number} UniRewardId
 */
/* We create a new Trasaction object with the parameters of the petition: fromAddress, toAddress, amount, and UniReward
 *  We need to obtain a the privateKey from the user, to signing the transaction. Once we sign the transaction, we can create
 *  the object in the DB. The createTransaction function return an object, this object is what we add to the pendingTransaction array
 *  calling the function addPendingTransaction 
 */

router.post('/createNewTransaction', async function(req, res) {
    var isFromAddresNameExist = proveKey('fromAddressUN', 'string', req.body)
    var isToAddresNameExist = proveKey('toAddressUN', 'string', req.body)
    var isTypeTransactionExist = proveKey('typeT', 'string', req.body)
    var isPasswordFromExist = proveKey('passwordFrom', 'string', req.body)
    if (isFromAddresNameExist && isToAddresNameExist && isTypeTransactionExist && isPasswordFromExist) {
        let userId = await controllerDB.obtainUserId(req.body.fromAddressUN, req.body.passwordFrom)
        if (userId != null) {
            let isUserDeleted = await controllerDB.isUserDeleted(userId)
            if (isUserDeleted != null && isUserDeleted == false) {
                let userFromAddress = await controllerDB.findUserAddress(req.body.fromAddressUN)
                let toAddress = await controllerDB.findUserAddress(req.body.toAddressUN)
                if (req.body.typeT == "M") {
                    var isMoneyExist = proveKey('money', 'integer', req.body)
                    if (isMoneyExist) {
                        let newTransac = new Transaction(userFromAddress, toAddress, req.body.moneyT, null, req.body.typeT, 0)
                        let jsonTransaction = await controllerDB.createTransaction(newTransac)
                        addPendingTransaction(jsonTransaction)
                        res.send("OK - Transaction created")
                    } else {
                        console.log("Can't finish the Transaction - Reason: Not correct parameters")
                        res.send("Can't finish the Transaction - Reason: Not correct paramaters")
                    }
                } else {
                    var isUniRewardTransactionExist = proveKey('uniRewardT', 'string', req.body)
                    if (isUniRewardTransactionExist) {
                        let uniRewardId = await controllerDB.getUniRewardId(req.body.uniRewardT)
                        let newTransac = new Transaction(userFromAddress, toAddress, null, uniRewardId, req.body.typeT, 1)
                        let jsonTransaction = await controllerDB.createTransaction(newTransac)
                        addPendingTransaction(jsonTransaction)
                        res.send("OK - Transaction created")
                    } else {
                        console.log("Can't finish the Transaction - Reason: Not correct parameters")
                        res.send("Can't finish the Transaction - Reason: Not correct paramaters")
                    }
                }
            } else {
                console.log("Can't finish the Transaction - Reason: User dosen't Exist")
                res.send("Can't finish the Transaction - Reason: User dosen't Exists")
            }
        } else {
            console.log("Some isn't correct in params of Transaction")
        }
    } else {
        console.log("Can't finish the Transaction - Reason: Not correct parameters")
        res.send("Can't finish the Transaction - Reason: Not correct paramaters")
    }
});

//This router is used for create a new User to the DB. //The User is passed in form of 
//body parameters in the petition (req field)
//Parameters are
/**  
 *  @param {string} name
 *  @param {string} fullSurname
 *  @param {string} username
 *  @param {string} password
 */
/* The only thing we need to do is create the user, if the object exists we need to comunicate
 * to the user
 *
 */

router.post('/createNewUser', async function(req, res) {
    let isNameExist = proveKey('name', 'string', req.body)
    let isUserNameExist = proveKey('username', 'string', req.body)
    let isFullSurnameExist = proveKey('fullSurname', 'string', req.body)
    let isPasswordExist = proveKey('password', 'string', req.body)
    let isRoleExist = proveKey('roleUser', 'string', req.body)
    if (isNameExist && isUserNameExist && isFullSurnameExist && isPasswordExist && isRoleExist) {
        let userAlreadyCreated = await controllerDB.isUserCreated(req, res)
        if (userAlreadyCreated == false) {
            await controllerDB.createUser(req)
            console.log("OK - User created")
            const ownerId = await controllerDB.obtainUserId(req.body.username, req.body.password)
            console.log("Hola buenas tardes aqui está: " + ownerId)
            const hasWallet = await controllerDB.userHasWallet(ownerId)
            if (!hasWallet) {
                const newWallet = new Wallet(ownerId)
                controllerDB.createWallet(newWallet)
                console.log("OK - Wallet Created")
            } else {
                console.log("Wallet dont created - Reason: User has a Wallet already")
            }
            res.send("OK - Acount created")
        } else {
            let userIsDeleted = await controllerDB.usernameDeleted(req.body.username)
            if (userIsDeleted) {
                await controllerDB.createUser(req)
                console.log("OK - User created")
                const ownerId = await controllerDB.obtainUserId(req.body.username, req.body.password)
                console.log("Hola buenas tardes aqui está: " + ownerId)
                const hasWallet = await controllerDB.userHasWallet(ownerId)
                if (!hasWallet) {
                    const newWallet = new Wallet(ownerId)
                    controllerDB.createWallet(newWallet)
                    console.log("OK - Wallet Created")
                } else {
                    console.log("Wallet dont created - Reason: User has a Wallet already")
                }
                res.send("OK - Acount created")
            } else {
                console.log("User dont created - Reason: User is Created already")
                res.send("User dont created - Reason: User is Created already")
            }

        }
    } else {
        console.log("User dont created - Reason: The data of parameters isn't correct")
        res.send("User dont created - Reason: The data of parameters isn't correct")
    }
});

router.get('/getAllUsersList', async function(req, res) {
    var usersList = await controllerDB.getAllUsers()
    res.send(usersList)
});

router.get('/getAllRewardsList', async function(req, res) {
    var rewardsList = await controllerDB.getAllRewards()
    res.send(rewardsList)
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
            let counterErrName = 0
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
                        } else {
                            let userNameExist = await controllerDB.isUsernameUsed(req.body.usernameN)
                            if (userNameExist) {
                                counterErrors++
                                counterErrName++
                            }
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
                await controllerDB.modifyUserData(req.body.nameN, req.body.fullSurnameN, req.body.usernameN, req.body.passwordN, userID)
                console.log("OK - User modify")
                res.send("OK - User modify")
            } else {
                if (counterErrName > 0) {
                    console.log("User not modify - Reason: Username Already used")
                    res.send("User not modify - Reason: Username Already used")
                } else {
                    console.log("User not modify - Reason: Parameters are not corrects")
                    res.send("User not modify - Reason: Parameters are not corrects")
                }
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

/*
 * Routes Delete Object
 */

// router.post('/deleteUniReward', async function(req) {
//     const existUniReward = await controllerDB.existUniReward(req.body.id)
//     const idUser = await controllerDB.obtainUserId(req.body.username, req.body.password)
//     const deletedUniReward = await controllerDB.obtainDeleteField(idUser, 0)
//     console.log(existUniReward)
//     if (existUniReward && !deletedUniReward) {
//         const isUniRewardOwner = await controllerDB.ownableUniReward(req.body.id, req.body.username, req.body.password)
//         if (isUniRewardOwner) {
// Elimination moment
//             await controllerDB.takeUniRewardFromWallet(req.body.privateKey, req.body.id)
//             controllerDB.deleteUniReward(req)
//             res.send("OK - UniRewardEliminated")
//         } else {
//             console.log("The UniReward asociated to id:" + req.body.id + " can't be eliminated - Reason: Not correct User Owner")
//             res.send("The UniReward asociated to id:" + req.body.id + " can't be eliminated - Reason: Not correct User Owner")
//         }
//     } else {
//         console.log("The UniReward asociated to id:" + req.body.id + " can't be eliminated - Reason: Not Exist")
//         res.send("The UniReward asociated to id:" + req.body.id + " can't be eliminated - Reason: Not Exist")
//     }
// });

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

router.post('/deleteWallet', async function(req, res) {
    let isUserNameExist = proveKey('username', 'string', req.body)
    let isPasswordExist = proveKey('password', 'string', req.body)
    if (isUserNameExist && isPasswordExist) {
        const idUser = await controllerDB.obtainUserId(req.body.username, req.body.password)
        const deletedWallet = await controllerDB.obtainDeleteField(idUser, 1)
        console.log(idUser)
        if (idUser != null && !deletedWallet) {
            controllerDB.deleteWallet(idUser)
            res.send("OK - " + req.body.username + "'s data eliminated")
        } else {
            console.log(req.body.username + "'s data can't be eliminated - Reason: Not Exist an User with those username and password")
            res.send(req.body.username + "'s data can't be eliminated - Reason: Not Exist an User with those username and password")
        }
    } else {
        console.log("Wallet don't deleted - Reason: Not correct parammeters")
        res.send("Wallet don't deleted - Reason: Not correct parammeters")
    }
});

/* 
 * The objective of this funtion is do a break in the cycle of execution of node, to execute something,
 * whatever you want. For example in this function, we do an stop of ms miliseconds.
 */

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/* 
 * This funtion is used for adding information to the pendingTransaction array.
 * With transaction parameter, we call pendingTransactions.push(), and add 
 * transaction on in
 */

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
                if (reqJson[nameKey].length > 0) {
                    console.log("Correct Type\n")
                    return true
                } else {
                    console.log("Incorrect Type - Reason: Length of Key isn't correct\n")
                    return false
                }
            } else {
                console.log("Correc tType\n")
                return true
            }
        } else {
            console.log("Incorrect Type - Reason: Not correct type\n")
            return false
        }
    } else {
        console.log("Incorrect Type - Reason: Not exist\n")
        return false
    }
}

module.exports = router;