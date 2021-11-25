const Block = require('../block')
const Blockchain = require('../blockchain')
const Wallet = require('../wallet');
var models = require('../models');
var express = require('express');
const controllerDB = require('../controllers/controllerDatabase');
const Transaction = require('../transaction');

var router = express.Router();
var pendingTransactions = [];

//Default Route

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

router.post('/createNewNFT', async function(req, res) {
    let lastIndex = await controllerDB.getLastBlockIndex(res)
    if (lastIndex == 0) {
        //There aren't blocks in the blockchain --> Adding the genesisBlock
        var genesisBlock = new Block(lastIndex, new Date(), {}, [], "0")
        genesisBlock.hash = genesisBlock.calcularHash()
        await controllerDB.createBlock(genesisBlock, res)
        lastIndex++
    }
    let prevHash = await controllerDB.getHashLastBlock(lastIndex - 1, res)
    let logroPin = await controllerDB.createLogroPin(req, res)
        //Waiting petitions for the block
    await sleep(20000)
        //console.log(pendingTransacitons)
        //console.log(pendingTransacitons[1])
    console.log(JSON.stringify(pendingTransactions))
    let newBlock = new Block(lastIndex, new Date(), logroPin, { transactions: pendingTransactions }, prevHash)
    newBlock.hash = newBlock.calcularHash()
    console.log(newBlock.hash)
    await controllerDB.createBlock(newBlock, res)
        //Assing LogroPin to the Wallet with the id --> req.body.Id
    controllerDB.updateIdArrayMonedero(req.body.UsuarioId, logroPin.id, req.body.userPrivateKey, req.body.userPassword, res)
});

//This router is used for create a new Transaction and add this object to an array called pendingTransactions
//The LogroPin is passed in form of body parameters in the petition (req field)
//Parameters are
/**  
*  @param {string} fromAddress
*  @param {string} toAddress
*  @param {number} amount
*  @param {number} UsuarioId
*  @param {number} logroPinId
*/
/* We create a new Trasaction object with the parameters of the petition: fromAddress, toAddress, amount, and logroPin
*  We need to obtain a the privateKey from the user, to signing the transaction. ONce we sign the transaction, we can create
*  the object in the DB. The createTransaction function return an object, this object is what we add to the pendingTransaction array
*  calling the function addPendingTransaction 
*/

router.post('/createNewTransaction', async function(req, res) {
    let newTransac = new Transaction(req.body.fromAddres, req.body.toAddress, req.body.amount, req.body.logroPinId)
    let privKey = await controllerDB.obtainPrivateKeyId(req.body.UsuarioId)
    newTransac.signTransaction(privKey)
    let jsonTransaction = await controllerDB.createTransaction(newTransac, res)
    console.log("Soy " + jsonTransaction)
    addPendingTransaction(jsonTransaction)
    res.send({ ok: true })
});

router.post('/createUser', function(req, res) {
    controllerDB.crearUsuario(req,res)
});

router.post('/crearMonedero', function(req, res) {
    const newWallet = new Wallet(req.body.ownerId)
    controllerDB.crearMonedero(newWallet, res)

});

router.post('/modificarUsuario', function(req, res) {
    models.Usuarios.update({
        username: req.body.usernameNuevo,
        fullSurname: req.body.fullSurnameNuevo,
    }, {
        where: {
            id: req.body.id
        }
    }).then(() => {
        res.json({ ok: true });
    }).catch((val) => {
        res.json({ ok: false, error: val.name });
    });
});

router.post('/modificarMonedero', function(req, res) {
    models.Monederos.update({
        address: req.body.addressNuevo,
        UsuarioId: req.body.UsuarioIdNuevo
    }, {
        where: {
            id: req.body.id
        }
    }).then(() => {
        res.json({ ok: true });
    }).catch((val) => {
        res.json({ ok: false, error: val.name });
    });
});

router.post('/modificarUsuario', function(req, res) {
    models.Logropines.update({
        nameLP: req.body.nameLPNuevo,
        addressLP: req.body.addressLPNuevo,
        UsuarioId: req.body.UsuarioIdNuevo,
        MonederoId: req.body.MonederoIdNuevo
    }, {
        where: {
            id: req.body.id
        }
    }).then(() => {
        res.json({ ok: true });
    }).catch((val) => {
        res.json({ ok: false, error: val.name });
    });

});

router.post('/eliminarLogroPin', function(req, res) {
    models.Logropines.destroy({
        where: {
            id: req.body.id
        }
    }).then(() => {
        res.json({ ok: true });
    }).catch((val) => {
        res.json({ ok: false, error: val.name });
    });
});

router.post('/eliminarUsuario', function(req, res) {
    models.Usuarios.destroy({
        where: {
            id: req.body.id
        }
    }).then(() => {
        res.json({ ok: true });
    }).catch((val) => {
        res.json({ ok: false, error: val.name });
    });
});

router.post('/eliminarMonedero', function(req, res) {
    models.Monederos.destroy({
        where: {
            id: req.body.id
        }
    }).then(() => {
        res.json({ ok: true });
    }).catch((val) => {
        res.json({ ok: false, error: val.name });
    });
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