const { response } = require('express');
const Sequelize = require('sequelize');
const db = require('../models')

module.exports = {
    async allBlocks(res) {
        return db.Blockchain.findAll();
    },
    createBlock(req, res) {
        return db.Blockchain.create({
                index: req.lastIndex() - 1,
                timestamp: Date.now(),
                //Mirar si es mejor guardar en DB como array o como String - Ambas funcionan bien
                logroPin: req.getLastBlock().logroPin,
                data: JSON.stringify(req.getLastBlock().data),
                hash: req.getLastBlock().hash,
                hashPrev: req.getLastBlock().hashPrev
            })
            .then(blockchain => res.status(200).send(blockchain))
            .catch(error => res.status(400).send(error))
    }
}