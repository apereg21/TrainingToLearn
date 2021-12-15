//Imports
const Block = require('../block')
const Wallet = require('../wallet');
const Transaction = require('../transaction');
const models = require('../models');
var express = require('express');
const controllerDB = require('../controllers/controllerDatabase');
const { deleteLogroPin } = require('../controllers/controllerDatabase');

//Configuration zone
var router = express.Router();
var pendingTransactions = [];

/*
 * Default Route
 */

router.get('/', (req, res) => {
    res.send('Hey!')
});

/*
 * Routes Creation Object
 */

//This router is used for create a new block in the blockain with an LogroPin
//The LogroPin is passed in form of body parameters in the petition (req field)
//Parameters are
/**  
 *  @param {string} nameLP
 *  @param {string} descriptionLP
 *  @param {string} imageLP
 *  @param {number} UsuarioId
 *  @param {number} MonederoId
 *  @param {string} userPrivateKey
 */
/*First of all, the funtion find de lastIndex to assing it to the new block, then 
 * there is a comprobation with this lastIndex, if lastIndex=0, we need to create the genesis block,
 * the first block of our blockchain. If lastIndex !=0 we can continue like an normal iteration.
 *
 * All querys to the database are formed in controllerDB class
 *
 * We need to find the hash of the previous block for the next steep. We do a query to the database and find
 * this value. We pass the lastIndex value to the function. Then we need to get the lastId of LogroPins table. 
 * Same operation with lastIndex of Blockchain. The next steep is create the logroPin calling to the function of 
 * the controllerDB.
 *
 * We do small brake with the sleep function, the thing we want with this is have some time to listen petitions
 * from createNewTransaction route. We the limit time is finished, we create newBlock with all the data generated previously
 * and calculate the hash block. Then we asociated the logroPinId to the user's wallet
 */

router.post('/createNewReward', async function(req, res) {
    let lastIndex = await controllerDB.getLastBlockIndex(res)
    if (lastIndex == 0) {
        //There aren't blocks in the blockchain --> Adding the genesisBlock
        var genesisBlock = new Block(lastIndex, new Date(), {}, [], "0")
        genesisBlock.hash = genesisBlock.calcularHash()
        await controllerDB.createBlock(genesisBlock, res)
        lastIndex++
    }
    let prevHash = await controllerDB.getHashLastBlock(lastIndex - 1, res)
    let idUser = await controllerDB.obtainUserId(req.body.username, req.body.password)
    let logroPin = await controllerDB.createLogroPin(req, idUser, res)
        //Waiting petitions for the block
    await sleep(20000)
    if (prevHash == null || logroPin == null || (logroPin.nameLP == null || logroPin.descriptionLP == null || logroPin.imageLP == null || logroPin.UsuarioId == null || logroPin.MonederoId == null)) {
        console.log("Something with the logroPin gone wrong")
        res.send({ ok: false })
    } else {
        let newBlock = new Block(lastIndex, new Date(), logroPin, { transactions: pendingTransactions }, prevHash)
        newBlock.hash = newBlock.calcularHash()
        console.log(newBlock.hash)
        await controllerDB.createBlock(newBlock, res)
            //Assing LogroPin to the Wallet with the id --> req.body.Id
        await controllerDB.updateIdArrayMonedero(idUser, logroPin.id, req.body.userPrivateKey, req.body.password, res)
        res.send("Reward created")
    }
});

//This router is used for create a new Transaction and add this object to an array called pendingTransactions
//The Transaction is passed in form of body parameters in the petition (req field)
//Parameters are
/**  
 *  @param {string} fromAddress
 *  @param {string} toAddress
 *  @param {number} amount
 *  @param {number} UsuarioId
 *  @param {number} logroPinId
 */
/* We create a new Trasaction object with the parameters of the petition: fromAddress, toAddress, amount, and logroPin
 *  We need to obtain a the privateKey from the user, to signing the transaction. Once we sign the transaction, we can create
 *  the object in the DB. The createTransaction function return an object, this object is what we add to the pendingTransaction array
 *  calling the function addPendingTransaction 
 */

router.post('/createNewTransaction', async function(req, res) {
    let newTransac = new Transaction(req.body.fromAddres, req.body.toAddress, req.body.amount, req.body.logroPinId)
    let privKey = await controllerDB.obtainPrivateKeyId(req.body.UsuarioId)
    newTransac.signTransaction(privKey)
    if (newTransac.fromAddress == null || newTransac.toAddress == null || newTransac.amount == null || newTransac.LogroPinId == null || newTransac.signatureC == null) {
        console.log("Something with the data in createNewTransaction gone wrong")
        res.send({ ok: false })
    } else {
        let jsonTransaction = await controllerDB.createTransaction(newTransac, res)
        addPendingTransaction(jsonTransaction)
        res.send({ ok: true })
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
    let userAlreadyCreated = await controllerDB.isUserCreated(req, res)
    if (userAlreadyCreated == false) {
        controllerDB.createUser(req, res)
        console.log("User created correctly")
        res.send("User created correctly")
    } else {
        console.log("User dont created, the user alredy exists")
        res.send("User dont created, the user alredy exists")
    }

});

//This router is used for create a new Monedero to the DB. //The Monedero is passed in form of 
//body parameters in the petition (req field)
//Parameters are
/**  
 *  @param {string} username
 *  @param {string} password
 */
/* The only thing we need to do is create the object from the class Monedero from this project
 *The class fild all the elements from the object, like the public and private key
 * to the user
 */

router.post('/createNewWallet', async function(req, res) {
    const ownerId = await controllerDB.obtainUserId(req.body.username, req.body.password)
    if (ownerId != null) {
        const newWallet = new Wallet(ownerId)
        const hasWallet = await controllerDB.userHasWallet(ownerId)
        if (!hasWallet) {
            controllerDB.createWallet(newWallet, res)
        } else {
            console.log("Can't create wallet - Reason: The user has a Wallet already")
            res.send("Can't create wallet - Reason: The user has a Wallet already")
        }
    } else {
        console.log("Can't create wallet - Reason: Username and password not corect")
        res.send("Can't create wallet - Reason: Username and password not corect")
    }
});

/*
 * Routes Delete Object
 */

router.post('/deleteLogroPin', async function(req, res) {
    const existLogroPin = await controllerDB.existLogroPin(req.body.id)
    const idUser = await controllerDB.obtainUserId(req.body.username, req.body.password)
    const deletedLogroPin = await controllerDB.obtainDeleteField(idUser, 0)
    console.log(existLogroPin)
    if (existLogroPin && !deletedLogroPin) {
        const isLogroPinOwner = await controllerDB.ownableLogroPin(req.body.id, req.body.username, req.body.password)
        if (isLogroPinOwner) {
            //Elimination moment
            await controllerDB.takeLogroPinFromWallet(req.body.privateKey, req.body.id)
            controllerDB.deleteLogroPin(req, res)
            res.send("OK - LogroPinEliminated")
        } else {
            console.log("The logroPin asociated to id:" + req.body.id + " can't be eliminated - Reason: Not correct User Owner")
            res.send("The logroPin asociated to id:" + req.body.id + " can't be eliminated - Reason: Not correct User Owner")
        }
    } else {
        console.log("The logroPin asociated to id:" + req.body.id + " can't be eliminated - Reason: Not Exist")
        res.send("The logroPin asociated to id:" + req.body.id + " can't be eliminated - Reason: Not Exist")
    }
});

router.post('/deleteUser', async function(req, res) {
    const idUser = await controllerDB.obtainUserId(req.body.username, req.body.password)
    const deletedUser = await controllerDB.obtainDeleteField(idUser, 0)
    if (idUser != null && (!deletedUser)) {
        controllerDB.deleteUser(idUser)
        res.send("OK - " + req.body.username + "'s data eliminated")
    } else {
        console.log(req.body.username + "'s data can't be eliminated - Reason: Not Exist")
        res.send(req.body.username + "'s data can't be eliminated - Reason: Not Exist")
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