//Imports
const Block = require('../block')
const Wallet = require('../wallet');
const Transaction = require('../transaction');
const models = require('../models');
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

router.post('/createNewReward', async function(req, res) {
    let proveInitialParam = await controllerDB.proveRewardParameters(req)
    if(proveInitialParam){
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
        if (idUser != null) {
            let uniReward = await controllerDB.createUniReward(req, idUser)
                //Waiting petitions for the block
            await sleep(20000)
            if (prevHash == null || uniReward == null || (uniReward.nameUR == null || uniReward.descriptionUR == null || uniReward.imageUR == null || uniReward.UserId == null || uniReward.WalletId == null)) {
                console.log("Reward not created - Reason: Something with the UniReward fields isn't correct")
                res.send("Reward not created - Reason: Something with the UniReward fields isn't correct")
            } else {
                let newBlock = new Block(lastIndex, new Date(), uniReward, { transactions: pendingTransactions }, prevHash)
                newBlock.hash = newBlock.calculateHash()
                console.log(newBlock.hash)
                await controllerDB.createBlock(newBlock)
                    //Assing UniReward to the Wallet with the id --> req.body.Id
                await controllerDB.updateIdArrayWallet(idUser, uniReward.id, req.body.userPrivateKey, req.body.password)
                res.send("OK - Reward created")
            }
        }else{
            console.log("Reward not created - Reason: Username or password isn't correct")
            res.send("Reward not created - Reason: Username or password isn't correct") 
        }
    }else{
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
    let isTransactionCorrect = await controllerDB.proveTransactionParams(req)
    let userId = await controllerDB.obtainUserId(req.body.username, req.body.password)
    if (isTransactionCorrect && typeof userId == 'number' && userId != null) {
        let isUserDeleted = await controllerDB.isUserDeleted(userId)
        if (isUserDeleted != null && isUserDeleted == false) {
            let privKey = await controllerDB.obtainPrivateKeyId(userId)
            let newTransac = new Transaction(req.body.fromAddress, req.body.toAddress, req.body.amount, req.body.uniRewardId)
            newTransac.signTransaction(privKey)
            if (newTransac.signatureC == null) {
                console.log("Can't finish the Transaction - Reason: Signature not correct")
                res.send("Can't finish the Transaction - Reason: Signature not correct")
            } else {
                let jsonTransaction = await controllerDB.createTransaction(newTransac)
                addPendingTransaction(jsonTransaction)
                res.send("OK - Transaction created")
            }
        } else {
            console.log("Can't finish the Transaction - Reason: User dosen't Exist")
            res.send("Can't finish the Transaction - Reason: User dosen't Exists")
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
    let userAlreadyCreated = await controllerDB.isUserCreated(req)
    let usName=req.body.username
    let usPass=req.body.password
    console.log(usName.length +"\n"+usPass.length)
    if (userAlreadyCreated == false && (usPass.length > 0) && (usName.length > 0)) {
        controllerDB.createUser(req)
        console.log("OK - User created")
        res.send("OK - User created")
    } else {
        let userID=await controllerDB.obtainUserId(req.body.username, req.body.password)
        let userDeleted= await controllerDB.isUserDeleted(userID)

        if((typeof req.body.username != 'string' && typeof req.body.name != 'string' && typeof req.body.fullSurname != 'string' && typeof req.body.username != 'string') &&
        req.body.username == null && req.body.name == null && req.body.fullSurname == null && req.body.password == null &&
        req.body.username.length < 0 && req.body.name.length < 0 && req.body.fullSurname.length < 0 && req.body.password.length < 0){
            console.log("User dont created - Reason: The data of parameters isn't correct")
            res.send("User dont created - Reason: The data of parameters isn't correct")
        }else if(!userDeleted){
            console.log("User dont created - Reason: User is Created already")
            res.send("User dont created - Reason: User is Created already")
        }else{
            res.send("")
        }
    }

});

//This router is used for create a new Wallet to the DB. //The Wallet is passed in form of 
//body parameters in the petition (req field)
//Parameters are
/**  
 *  @param {string} username
 *  @param {string} password
 */
/* The only thing we need to do is create the object from the class Wallet from this project
 *The class fild all the elements from the object, like the public and private key
 * to the user
 */

router.post('/createNewWallet', async function(req, res) {
    const ownerId = await controllerDB.obtainUserId(req.body.username, req.body.password)
    if (ownerId != null) {
        const hasWallet = await controllerDB.userHasWallet(ownerId)
        const idWallet = await controllerDB.obtainWalletId(ownerId)
        const deletedWallet = await controllerDB.obtainDeleteField(idWallet, 1)
        if (!hasWallet && !deletedWallet && hasWallet != null && deletedWallet != null) {
            const newWallet = new Wallet(ownerId)
            controllerDB.createWallet(newWallet)
            res.send("OK - Wallet Created")
        } else {
            console.log("Can't create wallet - Reason: The user has a Wallet already")
            res.send("Can't create wallet - Reason: The user has a Wallet already")
        }
    } else {
        if (typeof req.body.username != 'string' || typeof req.body.password != 'string') {
            console.log("Can't create wallet - Reason: Username or password not corect types")
            res.send("Can't create wallet - Reason: Username or password not corect types")
        } else {
            console.log("Can't create wallet - Reason: Username and password not corect")
            res.send("Can't create wallet - Reason: Username and password not corect")
        }

    }
});

/*
 * Modify Routes
 */

router.post('/changeUserData', async function(req, res) {
    const userID = await controllerDB.obtainUserId(req.body.username, req.body.password)
    if (userID != null) {
        const userNameExist = await controllerDB.isUsernameUsed(req.body.usernameN)
        if(!userNameExist && userNameExist==null){
            let counterErrors=0
            for(let i = 0;i<req.body.changes.length;i++){
                switch(req.body.changes[i]){
                    case "p":
                        if(req.body.passwordN==null || typeof req.body.passwordN !='string'){ 
                            counterErrors++
                        }   
                    break;
                    case "u":
                        if(req.body.usernameN==null || typeof req.body.usernameN !='string'){ 
                            counterErrors++
                        }   
                    break;
                    case "f":
                        if(req.body.fullSurnameN==null || typeof req.body.fullSurnameN !='string'){ 
                            counterErrors++
                        }   
                    break;
                    case "n":
                        if(req.body.nameN==null || typeof req.body.nameN !='string'){ 
                            counterErrors++
                        }   
                    break;
                    default:
                        counterErrors++
                }
            }
            if(counterErrors==0){
                await controllerDB.modifyUserData(req,userID)
                console.log("OK - User modify")
                res.send("OK - User modify")
            }else{
                console.log("User not modify - Reason: Parameters not corrects")
                res.send("User not modify - Reason: Parameters not corrects")
            }
        }else{
            console.log("User not modify - Reason: Username already exist")
            res.send("User not modify - Reason: Username already exist")
        }
    } else {
        console.log("User data dont change - Reason: Username or password ins't correct")
        res.send("User data dont change - Reason: Username or password ins't correct")
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
});

router.post('/deleteWallet', async function(req, res) {
    const idUser = await controllerDB.obtainUserId(req.body.username, req.body.password)
    const privateKey = await controllerDB.obtainPrivateKeyId(idUser)
    const deletedWallet = await controllerDB.obtainDeleteField(idUser, 1)
    console.log(idUser)
    console.log(privateKey)
    if (idUser != null && privateKey != null && (privateKey == req.body.privateKey) && !deletedWallet) {
        controllerDB.deleteWallet(idUser)
        res.send("OK - " + req.body.username + "'s data eliminated")
    } else {
        console.log(req.body.username + "'s data can't be eliminated - Reason: Not Exist")
        res.send(req.body.username + "'s data can't be eliminated - Reason: Not Exist")
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

module.exports = router;