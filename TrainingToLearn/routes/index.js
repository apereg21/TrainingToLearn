var models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.send('Backend de TTL');
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