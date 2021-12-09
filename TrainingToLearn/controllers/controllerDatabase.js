const db = require('../models')

module.exports = {
    //Blockchain Functions
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

    //LogroPins functions
    async createLogroPin(req, res) {
        if (((req.body.nameLP != null && req.body.nameLP.length > 0)) && (req.body.UsuarioId != null)) {
            return db.Logropines
                .create({
                    nameLP: req.body.nameLP,
                    descriptionLP: req.body.descriptionLP,
                    imageLP: req.body.imageLP,
                    UsuarioId: req.body.UsuarioId,
                    MonederoId: await this.obtainMonederoId(req.body.UsuarioId)
                }).then(data => {
                    console.log(data);
                    return data
                })
        } else {
            console.log("Error in createLogroPin")
            res.json({ ok: false, error: "NotCorrectReqParameters" })
        }
    },
    deleteLogroPin(req, res) {
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
    updateLogroPin(req, res) {
        db.Logropines.update({
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

    //Usuario Functions
    createUser(req, res) {
        db.Usuarios.create({
            name: req.body.name,
            fullSurname: req.body.fullSurname,
            username: req.body.username,
            password: req.body.password
        }).then(() => {
            console.log("Created")
        }).catch((val) => {
            console.log("Something go wrong with user creation: " + val);
        });
    },
    deleteUser(req, res) {
        db.Usuarios.destroy({
            where: {
                id: req.body.id,
                password: req.body.password,
                username: req.body.username
            }
        }).then(() => {
            res.json({ ok: true });
        }).catch((val) => {
            res.json({ ok: false, error: val.name });
        });
    },
    updateUser(req, res) {
        db.Usuarios.update({
            name: req.body.nameNew,
            fullSurname: req.body.fullSurnameNew,
            username: req.body.usernameNew,
            password: req.body.passwordNew,
        }, {
            where: {
                id: req.body.id,
                password: req.body.password,
                username: req.body.username
            }
        }).then(() => {
            res.json({ ok: true });
        }).catch((val) => {
            res.json({ ok: false, error: val.name });
        });
    },
    async obtainUserPassword(id) {
        return db.Usuarios.findOne({
            where: {
                id: id
            }
        }).then((result) => {
            console.log(result.password)
            return result.password
        })
    },
    async userIdExists(id) {
        return db.Usuarios.findOne({
            where: {
                id: id
            }
        }).then((result) => {
            if (result != null) {
                console.log("User id exists")
                return true
            } else {
                console.log("User id dosent exists")
                return false
            }
        })
    },
    async obtainUserId(usName, usPass) {
        if (typeof usName == 'string' && typeof usName == 'string') {
            return db.Usuarios.findOne({
                where: {
                    username: usName,
                    password: usPass
                }
            }).then((result) => {
                if (result != null) {
                    console.log("User find it")
                    return result.id
                } else {
                    console.log("User not find it")
                }
            })
        } else {
            console.log("Id to obtain WalletId isnt a number")
        }

    },
    async isUserCreated(req, res) {
        return db.Usuarios.findOne({
            where: {
                name: req.body.name,
                fullSurname: req.body.fullSurname,
                username: req.body.username,
                password: req.body.password
            }
        }).then((result) => {
            if (result != null) {
                console.log("User find it")
                return true
            } else {
                console.log("User not find it")
                return false
            }
        })
    },

    //Monedero functions
    crearMonedero(req, res) {
        if (typeof req.keyPublic == 'string' && typeof req.keyPrivate == 'string' && typeof req.owner == 'string') {
            return db.Monederos.create({
                publicKey: req.keyPublic,
                privateKey: req.keyPrivate,
                UsuarioId: req.owner
            }).then(() => {
                res.json({ ok: true });
            }).catch((val) => {
                res.json({ ok: false, error: val });
            });
        } else {

        }

    },
    eliminarMonedero(req, res) {
        if (typeof req.keyPublic == 'string' && typeof req.keyPrivate == 'string' && typeof req.owner == 'string') {
            db.Monederos.destroy({
                where: {
                    id: req.body.id
                }
            }).then(() => {
                res.json({ ok: true });
            }).catch((val) => {
                res.json({ ok: false, error: val.name });
            });
        } else {

        }

    },
    updateMonedero(req, res) {
        if (typeof req.keyPublic == 'string' && typeof req.keyPrivate == 'string' && typeof req.owner == 'string') {
            return db.Monederos.update({
                publicKey: req.keyPublic,
                privateKey: req.keyPrivate,
                UsuarioId: req.owner
            }, {
                where: {
                    id: req.body.id
                }
            }).then(() => {
                res.json({ ok: true });
            }).catch((val) => {
                res.json({ ok: false, error: val });
            });
        } else {

        }

    },
    async updateIdArrayMonedero(idUsuario, idLogroPin, privateKey, password, res) {
        let privateKeyId = await this.obtainPrivateKeyId(idUsuario)
        let userpassword = await this.obtainUserPassword(idUsuario)
        console.log("Compare if " + privateKey + " is equals to " + privateKeyId)
        console.log("Compare if " + userpassword + " is equals to " + password)
        if (privateKey == privateKeyId && userpassword == password && (typeof idUsuario == 'number' && typeof idLogroPin == 'number' &&
                typeof privateKey == 'string' && typeof password == 'string')) {
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
            console.log("Something with the data isn't correct")
            res.json({ ok: false, error: "Key isn't correct" })
        }
    },
    obtainPrivateKeyId(id) {
        if (typeof id == 'number') {
            return db.Monederos.findOne({
                where: {
                    UsuarioId: id
                }
            }).then((result) => {
                if (result != null) {
                    console.log("PrivateKey associated to id:" + id + " found it: " + result.privateKey)
                    return result.privateKey
                } else {
                    console.log("PrivateKey associated to id:" + id + " not found")
                }

            })
        } else {
            console.log("Id to obtain WalletId isnt a number")
        }
    },
    async obtainMonederoId(idUsu) {
        if (typeof idUsu == 'number') {
            return db.Monederos.findOne({
                where: {
                    id: idUsu
                }
            }).then((result) => {
                console.log("Getting idMonedero own by idUsuario: " + result.id)
                return result.id
            })
        } else {
            console.log("Id to obtain WalletId isnt a number")
        }
    },
    async userHasWallet(idUsu) {
        if (typeof idUsu == 'number') {
            return db.Monederos.findOne({
                where: {
                    UsuarioId: idUsu
                }
            }).then((result) => {
                if (result != null) {
                    console.log("idUsuario: " + idUsu + " has a wallet")
                    return true
                } else {
                    console.log("idUsuario: " + idUsu + " hasn't a wallet")
                    return false
                }
            })
        } else {
            console.log("Id to comprobate if User has wallet isnt a number")
        }

    },

    //Transactions functions
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
    },
}