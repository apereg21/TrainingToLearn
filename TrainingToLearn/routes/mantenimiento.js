var models = require('../models');
var express = require('express');
var router = express.Router();
const controllerDB = require('../controllers/controllerDatabase');
const Wallet = require('../wallet')

router.get('/restaurarDB', async function(req, res) {
    // Borra todas las tablas y las recrea de nuevo
    models.sequelize.sync({ force: true }).then(async() => {
        var jsonReq = {
            name: "System",
            fullSurname: "System",
            username: "System",
            password: "admin",
            typeUser: "I"
        }
        await controllerDB.createSystem(jsonReq)
        const ownerId = await controllerDB.obtainUserId(jsonReq.username, jsonReq.password)
        var newWallet = new Wallet(ownerId)
        controllerDB.createWallet(newWallet)
        res.send({ ok: true });
    }).catch((val) => {
        res.send({ ok: false, error: val });
    });
});

module.exports = router;