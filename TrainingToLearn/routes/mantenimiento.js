var models = require('../models');
var express = require('express');
var router = express.Router();
const controllerDB = require('../controllers/controllerDatabase');
const Wallet = require('../wallet')

router.get('/restaurarDB', async function(req, res) {
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

router.get('/createUI', async function(req, res) {
        var jsonReq = {
            name: "alumno",
            fullSurname: "alumno",
            username: "alumno",
            password: "123456",
            typeUser: "N"
        }
        await controllerDB.createUser(jsonReq)
        const ownerId = await controllerDB.obtainUserId(jsonReq.username, jsonReq.password)
        var newWallet = new Wallet(ownerId)
        await controllerDB.createWallet(newWallet)
        
        var jsonReq2 = {
            name: "instructor",
            fullSurname: "instructor",
            username: "instructor",
            password: "123456",
            typeUser: "I"
        }
        await controllerDB.createUser(jsonReq2)
        const ownerId2 = await controllerDB.obtainUserId(jsonReq2.username, jsonReq2.password)
        var newWallet2 = new Wallet(ownerId2)
        await controllerDB.createWallet(newWallet2)
        res.send({ ok: true })
});

module.exports = router;