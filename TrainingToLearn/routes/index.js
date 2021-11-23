const Block = require('../block')
const Blockchain = require('../blockchain')
const Wallet = require('../wallet');
var models = require('../models');
var express = require('express');
const controllerDB = require('../controllers/controllerDatabase');

var router = express.Router();
var pendingTransacitons = [];
router.get('/', (req, res) => {
    res.send('Hey!')
});

router.post('/createNuevoNFT', async function(req, res) {
    let lastIndex = await controllerDB.getLastBlockIndex(res)
    if (lastIndex == 0) {
        //There aren't blocks in the blockchain --> Adding the genesisBlock
        var genesisBlock = new Block(lastIndex, new Date(), {}, [], "0")
        genesisBlock.hash = genesisBlock.calcularHash()
        await controllerDB.createBlock(genesisBlock, res)
        lastIndex++
    }
    let prevHash = await controllerDB.getHashLastBlock(lastIndex - 1, res)
    let lengthLogroPines = await controllerDB.idLatestLogroPin(res) + 1
    let logroPin = await controllerDB.createLogroPin(req, res, lengthLogroPines)
        //Waiting petitions for the block
    await sleep(20000)
        //console.log(pendingTransacitons)
        //console.log(pendingTransacitons[1])
    let newBlock = new Block(lastIndex, new Date(), logroPin, pendingTransacitons, prevHash)
    newBlock.hash = newBlock.calcularHash()
    console.log(newBlock.hash)
    controllerDB.createBlock(newBlock, res)
    //Assing to a Wallet with the req.body.Id
    controllerDB.modificarMonedero(req.body.UsuarioId,logroPin.id,res)


});

router.post('/createNewTransaction', function(req, res) {
    let json = {
        amount: req.body.amount
    }
    addPendingTransaction(json)
    res.send({ ok: true })
});

router.post('/crearUsuario', function(req, res) {
    models.Usuarios.create({
        username: req.body.username,
        fullSurname: req.body.fullSurname,
    }).then(() => {
        res.json({ ok: true });
    }).catch((val) => {
        res.json({ ok: false, error: val });
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

router.post('/crearMonedero', function(req, res) {
    const newWallet = new Wallet(req.body.ownerId)
    controllerDB.crearMonedero(newWallet,res)
    
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

router.post('/crearLogroPin', function(req, res) {
    models.Logropines.create({
        nameLP: req.body.nameLP,
        addressLP: req.body.addressLP,
        UsuarioId: req.body.UsuarioId,
        MonederoId: req.body.MonederoId
    }).then(() => {
        res.json({ ok: true });
    }).catch((val) => {
        res.json({ ok: false, error: val });
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

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function addPendingTransaction(transaction) {
    pendingTransacitons.push(transaction)
}

module.exports = router;