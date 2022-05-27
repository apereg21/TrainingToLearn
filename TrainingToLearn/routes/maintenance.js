var models = require('../models');
var express = require('express');
var router = express.Router();
const controllerDB = require('../controllers/controllerDatabase');
const Wallet = require('../wallet')

router.get('/restaurarDB', async function(req, res) {
    sleep(10000)
    models.sequelize.sync({ force: true }).then(async() => {
        process.env.FLAG_CREATION_DATABASE = "1"
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
        process.env.FLAG_CREATION_DATABASE = "0"
        res.send({ ok: true });
    }).catch((val) => {
        res.send({ ok: false, error: val });
    });
});

router.get('/createUI', async function(req, res) {
    process.env.FLAG_CREATION_DATABASE = "1"
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
    process.env.FLAG_CREATION_DATABASE = "0"
    res.send({ ok: true })
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = router