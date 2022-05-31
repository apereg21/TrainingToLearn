var models = require('../models');
var express = require('express');
var router = express.Router();
const controllerUserDB = require('../controllers/database/controllerUserDB');
const controllerWalletDB = require('../controllers/database/controllerWalletDB');
const Wallet = require('../wallet')
const exportsC = require('../exportsClass');

router.get('/restaurarDB', async function(req, res) {
    exportsC.setFlag(true)
    models.sequelize.sync({ force: true }).then(async() => {
        var jsonReq = {
            name: "System",
            fullSurname: "System",
            username: "System",
            password: "admin",
            typeUser: "I"
        }
        await controllerUserDB.createSystem(jsonReq)
        const ownerId = await controllerUserDB.obtainUserId(jsonReq.username, jsonReq.password)
        var newWallet = new Wallet(ownerId)
        controllerWalletDB.createWallet(newWallet)
        exportsC.setFlag(false)
        res.send({ ok: true });
    }).catch((val) => {
        res.send({ ok: false, error: val });
    });
});

router.get('/createUI', async function(req, res) {
    exportsC.setFlag(true)
    var jsonReq = {
        name: "alumno",
        fullSurname: "alumno",
        username: "alumno",
        password: "123456",
        typeUser: "N"
    }
    await controllerUserDB.createUser(jsonReq)
    const ownerId = await controllerUserDB.obtainUserId(jsonReq.username, jsonReq.password)
    var newWallet = new Wallet(ownerId)
    await controllerWalletDB.createWallet(newWallet)

    var jsonReq2 = {
        name: "instructor",
        fullSurname: "instructor",
        username: "instructor",
        password: "123456",
        typeUser: "I"
    }
    await controllerUserDB.createUser(jsonReq2)
    const ownerId2 = await controllerUserDB.obtainUserId(jsonReq2.username, jsonReq2.password)
    var newWallet2 = new Wallet(ownerId2)
    await controllerWalletDB.createWallet(newWallet2)
    exportsC.setFlag(false)    
    res.send({ ok: true })
});

module.exports = router