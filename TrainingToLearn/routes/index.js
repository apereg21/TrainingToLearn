const Block = require('../block')
const Blockchain = require('../blockchain')
var models = require('../models');
var express = require('express');
const controllerDB = require('../controllers/controllerDatabase');
var router = express.Router();

router.get('/', (req, res) => {
    res.send('Buenas!')
});

router.post('/crearNuevoNFT', async function(req, res) {
    let simCoin = new Blockchain();
    simCoin.chain = await controllerDB.allBlocks(res);
    let lengthLogroPines = await controllerDB.idLatestLogroPin() + 1
    console.log("Id es: " + lengthLogroPines)
    controllerDB.createLogroPin(req, res, lengthLogroPines)
    var buscaPin = await controllerDB.findLogroPin(lengthLogroPines - 1, res)
    console.log("Soy Logropin: " + buscaPin)
    simCoin.addBlock(new Block(simCoin.lastIndex(), new Date(), buscaPin, { amount: 1 }, "0"))
    console.log(simCoin.getLastBlock())
    controllerDB.createBlock(simCoin, res)
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
    models.Monederos.create({
        address: req.body.address,
        UsuarioId: req.body.UsuarioId
    }).then(() => {
        res.json({ ok: true });
    }).catch((val) => {
        res.json({ ok: false, error: val });
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

module.exports = router;