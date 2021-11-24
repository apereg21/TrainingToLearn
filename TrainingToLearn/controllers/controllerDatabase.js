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
    async createBlock(req, res) {
        console.log((req.index) + (req.timestamp) + (req.logroPin) + (req.data) + (req.hash) + (req.hashPrev))
        if ((req.index != null) && (req.timestamp != null) && (req.logroPin != null) && (req.data != null) && (req.hash != null) && (req.hashPrev != null)) {
            return db.Blockchain.create({
                index: req.index,
                timestamp: Date.now(),
                logroPin: req.logroPin,
                data: JSON.stringify(req.data),
                hash: req.hash,
                hashPrev: req.hashPrev
            }).then(() => {})
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
        return db.Monederos.create({
            publicKey: req.keyPublic,
            privateKey: req.keyPrivate,
            UsuarioId: req.owner
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

    async modificarMonedero(idUsuario, idLogroPin, privateKey, res) {
        let privateKeyId = await this.obtainPrivateKeyId(idUsuario)
        console.log("Compare if " + privateKey + " is equals to " + privateKeyId)
        if (privateKey == privateKeyId) {
            console.log("Private Key is correct")
            db.Monederos.findOne({
                where: {
                    UsuarioId: idUsuario
                }
            }).then((result) => {
                console.log(result.idsLogroPins)
                result.idsLogroPins.push(idLogroPin)
                db.Monederos.update({
                    idsLogroPins: result.idsLogroPins
                }, {
                    where: {
                        UsuarioId: idUsuario
                    }
                }).then((result2) => {
                    console.log(result2.idsLogroPins)
                    res.json({ ok: true });
                })
            })
        } else {
            console.log("Private Key isn't correct")
            res.json({ ok: false, error: "Key isn't correct" })
        }
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
    },
    async obtainPrivateKeyId(id) {
        return db.Monederos.findOne({
            where: {
                UsuarioId: id
            }
        }).then((result) => {
            return result.privateKey
        })
    },
    async obtainDataField(index) {
        return db.Blockchain.findOne({
            where: {
                index: index
            }
        }).then((result) => {
            console.log(result.data)
            return result.data
        })
    },
    async createTransaction(transaction, res) {
        return db.Transactions.create({
            fromAddress: transaction.fromAddress,
            toAddress: transaction.toAddress,
            amount: transaction.amount,
            signature: transaction.signatureC,
            LogropineId: transaction.LogroPinId
        }).then((result) => {
            console.log("Transaction Created")
            return result

        }).catch((val) => {});
    }
}