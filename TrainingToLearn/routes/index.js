const Block = require('../block')
const Blockchain = require('../blockchain')
var models = require('../models');
var express = require('express');
const controllerDB = require('../controllers/controllerDatabase');
var router = express.Router();

router.get('/', (req, res) => {
    res.send('Buenas!')
});

router.post('/createNuevoNFT', async function(req, res) {
    let lastIndex = await controllerDB.getLastBlockIndex(res)
    console.log(lastIndex)
    if (lastIndex == 0) {
        var genesisBlock = new Block(lastIndex, new Date(), {}, {}, "0")
        controllerDB.createBlock(genesisBlock, res)
    } else {
        let prevHash = await controllerDB.getHashLastBlock(lastIndex - 1, res)
        console.log(prevHash)
        let lengthLogroPines = await controllerDB.idLatestLogroPin(res) + 1
        let logroPin = await controllerDB.createLogroPin(req, res, lengthLogroPines)
        let newBlock = new Block(lastIndex, new Date(), logroPin, { amount: 1 }, prevHash)
        controllerDB.createBlock(newBlock, res)
    }

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