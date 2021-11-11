var models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/restaurarDB', function(req, res) {
    // Borra todas las tablas y las recrea de nuevo
    models.sequelize.sync({ force: true }).then(() => {
        res.send({ ok: true });
    }).catch((val) => {
        res.send({ ok: false, error: val });
    });
});

module.exports = router;