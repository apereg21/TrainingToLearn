const db = require('../models')

module.exports = {
    //Blockchain Functions
    allBlocks() {
        return db.Blockchain.findAll();
    },
    getLastBlockIndex() {
        return db.Blockchain
            .count()
            .then((result) => {
                console.log("LastBlock in blockchain found it: " + result)
                return result
            })
            .catch((error) => console.log("Error: "+error));
    },
    async createBlock(req, res) {
        console.log((req.index) + (req.timestamp) + (req.logroPin) + (req.data) + (req.hash) + (req.hashPrev))
        if ((typeof req.index == 'number' && typeof req.hash == 'string' && typeof req.hashPrev == 'string') &&
            (req.index != null) && (req.timestamp != null) && (req.logroPin != null) && (req.data != null) && (req.hash != null) && (req.hashPrev != null)) {
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
        if (lastIndex >= 0 && lastIndex != null && typeof lastIndex == 'number') {
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
    async createLogroPin(req, idUser, res) {
        if (((req.body.nameLP != null && req.body.nameLP.length > 0))) {
            return db.Logropines
                .create({
                    nameLP: req.body.nameLP,
                    descriptionLP: req.body.descriptionLP,
                    imageLP: req.body.imageLP,
                    UsuarioId: idUser,
                    MonederoId: await this.obtainMonederoId(idUser)
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
        db.Logropines.update({
            deleted: true
        }, {
            where: {
                id: req.body.id
            }
        }).then(() => {
            console.log("LogroPin Eliminated")
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
    async existLogroPin(id) {
        return db.Logropines.findOne({
            where: {
                id: id
            }
        }).then((result) => {
            if (result != null) {
                console.log("LogroPin with id:" + id + " Find it")
                return true
            } else {
                console.log("LogroPin with id:" + id + " Not Find it")
                return false
            }
        })
    },
    async obtainUserIdLP(idLogroPin) {
        return db.Logropines.findOne({
                where: {
                    id: idLogroPin
                }
            })
            .then((result) => {
                if (result != null) {
                    console.log("LogroPin with id:" + idLogroPin + " Find it")
                    return result.UsuarioId
                } else {
                    console.log("LogroPin with id:" + idLogroPin + " Not Find it")
                }
            })
    },
    async ownableLogroPin(idLogroPin, username, userPassword) {
        const idUser = await this.obtainUserId(username, userPassword)
        const idUserLP = await this.obtainUserIdLP(idLogroPin)
        if (idUser == idUserLP) {
            console.log("User " + username + " has de own property for LogroPin with Id:" + idLogroPin)
            return true
        } else {
            console.log("User " + username + " hasn`t the own property for LogroPin with Id:" + idLogroPin)
            return false
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
    deleteUser(id) {
        db.Usuarios.update({
            deleted: true
        }, {
            where: {
                id: id
            }
        }).then((result) => {
            console.log("OK User with id:" + id + " eliminated")
            db.Monederos.update({
                deleted: true
            }, {
                where: {
                    id: id
                }
            }).then(() => {
                console.log("OK Wallet with id:" + id + " eliminated")
                
            }).catch((val) => {
                res.json({ ok: false, error: val.name });
            });
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
    async obtainDeleteField(idObject, opc) {
        if (opc == 0) {
            return db.Usuarios.findOne({
                where: {
                    id: idObject
                }
            }).then((result) => {
                if(result!=null){
                    console.log("Deleted field is: " + result.deleted)
                    return result.deleted
                }else{
                    console.log("Deleted field is: " + false)
                    return false
                }
            })
        } else if (opc == 1) {
            return db.Monederos.findOne({
                where: {
                    id: idObject
                }
            }).then((result) => {
                if(result!=null){
                    console.log("Deleted field is: " + result.deleted)
                    return result.deleted
                }else{
                    console.log("Deleted field is: " + false)
                    return false
                }
            })
        } else if (opc == 2) {
            return db.Logropines.findOne({
                where: {
                    id: idObject
                }
            }).then((result) => {
                if(result!=null){
                    console.log("Deleted field is: " + result.deleted)
                    return result.deleted
                }else{
                    console.log("Deleted field is: " + false)
                    return false
                }
            })
        }
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
        if (typeof usName == 'string' && typeof usPass == 'string') {
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
        if (typeof req.body.username == 'string' && req.body.username.length > 0) {
            return db.Usuarios.findOne({
                where: {
                    username: req.body.username
                }
            }).then((result) => {
                if (result != null) {
                    console.log("User find it")
                    if(result.delete == true){
                        console.log("User can created")
                        return false
                    }else{
                        console.log("User can't created")
                        return true
                    }
                } else {
                    console.log("User not find it")
                    return false
                }
            })
        } else {
            console.log("Something with the data isn't correct")
        }

    },
    async isUserDeleted(idUser) {
        if (typeof idUser == 'number') {
            return db.Usuarios.findOne({
                where: {
                    id: idUser
                }
            }).then((result) => {
                if (result==true) {
                    console.log("User is Deleted")
                    return true
                } else {
                    console.log("User is not Deleted")
                    return false
                }
            })
        } else {
            console.log("idUser isn't a number")
        }

    },

    //Monedero functions
    createWallet(req, res) {
        if (typeof req.keyPublic == 'string' && typeof req.keyPrivate == 'string' && typeof req.owner == 'number') {
            return db.Monederos.create({
                publicKey: req.keyPublic,
                privateKey: req.keyPrivate,
                UsuarioId: req.owner
            }).then(() => {
                console.log("Wallet Created")
            }).catch((val) => {
                console.log("Error: "+val);
            });
        } else {
            console.log("Something with the data isn't correct")
        }

    },
    deleteWallet(idUser) {
        if (typeof idUser == 'number') {
            db.Monederos.update({
                deleted: true
            }, {
                where: {
                    id: idUser
                }
            }).then(() => {
                console.log("Wallet eliminated")
            }).catch((val) => {
                console.log("Error: " + val)
            });
        } else {
            console.log("Something with the data isn't correct")
        }

    },
    async updateIdArrayWallet(idUsuario, idLogroPin, privateKey, password, res) {
        let privateKeyId = await this.obtainPrivateKeyId(idUsuario)
        let userpassword = await this.obtainUserPassword(idUsuario)
        console.log("Compare if " + privateKey + " is equals to " + privateKeyId)
        console.log("Compare if " + userpassword + " is equals to " + userpassword)
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
                }).then( 
                    console.log("All is fine")
                )
            })
        } else {
            console.log("Something with the data isn't correct")
            res.json({ ok: false, error: "Key isn't correct" })
        }
    },
    async takeLogroPinFromWallet(privKey, idLogroPin) {
        const isWalletDeleted = this.isWalletDeletedPK(privKey)
        const isLogroPDeleted = this.isLogroPDeleted(idLogroPin)
        if(typeof privKey =='string' && typeof idLogroPin == 'number'){
            if(isWalletDeleted && isLogroPDeleted){
                return db.Monederos.findOne({
                    where: {
                        privateKey: privKey
                    }
                }).then((result) => {
                    console.log(result.idsLogroPins)
                    const index = result.idsLogroPins.indexOf(idLogroPin);
                    console.log("The localitation of idLogroPin:" + idLogroPin + "is " + index)
                    if (index > -1) {
                        result.idsLogroPins.splice(index, 1) //Delete idLogroPin once in the array
                        db.Monederos.update({
                            idsLogroPins: result.idsLogroPins
                        }, {
                            where: {
                                privateKey: privKey
                            }
                        }).then(
                            console.log("All is fine")
                        )
                    } else {
                        console.log("Id isn't correct and can't be localizated")
                    }
                }).catch((val) => {
                    console.log("Error: "+val);
                });
            }else{
                console.log("Cant remove LogroPin from Wallet - Reason: LogroPin or Wallet of parameters dosent exists")
            }
        } else {
            console.log("Cant remove LogroPin from Wallet - Reason: Not correct type of parameters")
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
        if (typeof idUsu == 'number' || idUsu!=null) {
            return db.Monederos.findOne({
                where: {
                    UsuarioId: idUsu
                }
            }).then((result) => {
                if(result==null){
                    console.log("No Wallet for User with id:"+idUsu)
                    return null
                }else{
                    console.log("Getting idMonedero own by idUsuario: " + result.id)
                    return result.id
                }
            })
        } else {
            console.log("Id to obtain WalletId isnt correct")
        }
    },
    async isWalletDeletedPK(privKey){
        if (typeof privKey == 'string') {
            return db.Monederos.findOne({
                where: {
                    privateKey: privKey
                }
            }).then((result) => {
                console.log("Getting delete field: " + result.delete)
                return result.delete
            })
        } else {
            console.log("Id to obtain WalletId isnt a number")
        }
    },
    async isLogroPDeleted(idLogro){
        if (typeof idLogro == 'number') {
            return db.Logropines.findOne({
                where: {
                    id: idLogro
                }
            }).then((result) => {
                console.log("Getting delete field: " + result.delete)
                return result.delete
            })
        } else {
            console.log("Id to obtain LogroPin isnt a number")
        }
    },
    async userHasWallet(idUsu) {
        if (typeof idUsu == 'number' && idUsu != null || idUsu != undefined) {
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
    comprobateTransaction(transParameters){
        let userExistNoDel
        let walletExistNoDel
    }
}