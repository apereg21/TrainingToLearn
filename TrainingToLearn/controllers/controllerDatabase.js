const db = require('../models')

module.exports = {
    allBlocks(res) {
        return db.Blockchain.findAll();
    },
    createBlock(req, res) {
        return db.Blockchain.create({
            index: req.lastIndex() - 1,
            timestamp: Date.now(),
            logroPin: req.getLastBlock().logroPin,
            data: JSON.stringify(req.getLastBlock().data),
            hash: req.getLastBlock().hash,
            hashPrev: req.getLastBlock().hashPrev
        }).then(() => {
            res.send("Creado");
        })
    },
    createLogroPin(req, res, indexLast) {
        const promise1 = Promise.resolve(indexLast);
        promise1.then((value) => {
            return db.Logropines.create({
                id: value,
                nameLP: req.body.nameLP,
                descriptionLP: req.body.descriptionLP,
                imageLP: req.body.imageLP,
                UsuarioId: req.body.UsuarioId,
                MonederoId: req.body.MonederoId
            })
        });
    },
    crearUsuario(req, res) {
        db.Usuarios.create({
            username: req.body.username,
            fullSurname: req.body.fullSurname,
        }).then(() => {
            res.json({ ok: true });
        }).catch((val) => {
            res.json({ ok: false, error: val });
        });
    },

    eliminarUsuario(req, res) {
        db.Usuarios.destroy({
            where: {
                id: req.body.id
            }
        }).then(() => {
            res.json({ ok: true });
        }).catch((val) => {
            res.json({ ok: false, error: val.name });
        });
    },

    modificarUsuario(req, res) {
        db.Usuarios.update({
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
    },

    crearMonedero(req, res) {
        db.Monederos.create({
            address: req.body.address,
            UsuarioId: req.body.UsuarioId
        }).then(() => {
            res.json({ ok: true });
        }).catch((val) => {
            res.json({ ok: false, error: val });
        });
    },

    eliminarMonedero(req, res) {
        db.Monederos.destroy({
            where: {
                id: req.body.id
            }
        }).then(() => {
            res.json({ ok: true });
        }).catch((val) => {
            res.json({ ok: false, error: val.name });
        });
    },

    modificarMonedero(req, res) {
        db.Monederos.update({
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
    },

    eliminarLogroPin(req, res) {
        db.Logropines.destroy({
            where: {
                id: req.body.id
            }
        }).then(() => {
            res.json({ ok: true });
        }).catch((val) => {
            res.json({ ok: false, error: val.name });
        });
    },

    modificarUsuario(req, res) {
        db.Logropines.update({
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
    },
    async findLogroPin(idLP, res) {
        console.log("db.Logropines.findByPk(" + idLP + ")")
        return db.Logropines
            .findOne({ where: { id: (idLP) }, raw: true })
            .then(buscaPin => {
                if (!buscaPin) {
                    console.log("No encontrado"),
                        res.status(400).send(error)
                } else {
                    console.log("Encontrado")
                    return buscaPin
                }

            })
            .catch((error) => res.status(400).send(error));
    },
    idLatestLogroPin() {
        return db.Logropines.count()
    }
}