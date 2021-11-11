const Block = require('../block')
const Blockchain = require('../blockchain')
var models = require('../models');
var express = require('express');
const controllerDB = require('../contracts/controllerDatabase');
var router = express.Router();

router.get('/', (req, res) => {
    res.send('Buenas!')
});

router.get('/crearNuevoNFT', async function(req, res) {
    let simCoin = new Blockchain();
    simCoin.chain = await controllerDB.allBlocks(res);
    simCoin.addBlock(new Block(simCoin.lastIndex(), new Date(), { nombre: "El pistolero 7", descripcion: "El llanero solitario 7", image: "https://pbs.twimg.com/profile_images/1244332617652211715/R6MEhciZ.jpg", owner: "1" }, { amount: 1 }))
    console.log(JSON.stringify(simCoin, null, 4))
    console.log(simCoin.getLastBlock())
    controllerDB.createBlock(simCoin, res)
});

module.exports = router;