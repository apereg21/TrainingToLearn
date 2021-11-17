const db = require('../models')

module.exports = {
    allBlocks(res) {
        return db.Blockchain.findAll();
    },
    getLastBlockIndex(res) {
        return db.Blockchain
            .count()
            .then((result) => {
                console.log("LastBlock in blockchain found it: " + result)
                return result
            })
            .catch((error) => res.status(400).send(error));
    },
    createBlock(req, res) {
        console.log((req.index) + (req.timestamp) + (req.logroPin) + (req.data) + (req.hash) + (req.hashPrev))
        if ((req.index != null) && (req.timestamp != null) && (req.logroPin != null) && (req.data != null) && (req.hash != null) && (req.hashPrev != null)) {
            return db.Blockchain.create({
                index: req.index,
                timestamp: Date.now(),
                logroPin: req.logroPin,
                data: JSON.stringify(req.data),
                hash: req.hash,
                hashPrev: req.hashPrev
            }).then(() => {
                res.send("Creado");
            })
        } else {
            console.log("Error in createBlock")
            res.json({ ok: false, error: "NotCorrectReqParameters" })
        }
    },
    getHashLastBlock(lastIndex, res) {
        console.log("Last index is: " + lastIndex)
        if (lastIndex >= 0 && lastIndex != null) {
            return db.Blockchain.findOne({
                where: {
                    index: lastIndex
                }
            }).then(result => {
                if (!result) {
                    console.log("Not found HashLastBlock")
                        //res.sendStatus(404)
                } else {
                    console.log("Found HashLastBlock")
                    return result.hash
                }

            })
        } else {
            console.log("Error in getHashLastBlock")
            res.json({ ok: false, error: "WrongLastIndexBlock" })
        }

    },
    createLogroPin(req, res, indexLast) {
        if (!(indexLast < 0) && ((req.body.nameLP != null && req.body.nameLP.length > 0)) && (req.body.UsuarioId != null) && (req.body.MonederoId != null)) {
            return db.Logropines
                .create({
                    id: indexLast,
                    nameLP: req.body.nameLP,
                    descriptionLP: req.body.descriptionLP,
                    imageLP: req.body.imageLP,
                    UsuarioId: req.body.UsuarioId,
                    MonederoId: req.body.MonederoId
                }).then(data => {
                    console.log(data);
                    return data
                })
        } else {
            console.log("Error in createLogroPin")
            res.json({ ok: false, error: "NotCorrectReqParameters" })
        }
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
        if (idLP != null || idLP < 0) {
            console.log("db.Logropines.findByPk(" + idLP + ")")
            db.Logropines
                .findOne({ where: { id: idLP }, raw: true })
                .then(buscaPin => {
                    if (!buscaPin) {
                        console.log("Not found LogroPin"),
                            res.status(400).send(error)
                    } else {
                        console.log("Found LogroPin")
                        return buscaPin
                    }

                })
                .catch((error) => res.status(400).send(error).end());
        } else {
            console.log("Error in FindLogroPin")
            res.status(400).json({ ok: false, error: "WrongLastIndexLogroPin" })
        }

    },
    idLatestLogroPin(res) {
        return db.Logropines
            .count()
            .then((result) => {
                console.log("Count Logropins return is: " + result)
                return result
            })
            .catch((error) => res.status(400).send(error).end());
    }
}