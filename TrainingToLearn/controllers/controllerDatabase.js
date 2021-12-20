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
            .catch((error) => console.log("Error: " + error));
    },
    async createBlock(req, res) {
        console.log((req.index) + (req.timestamp) + (req.uniReward) + (req.data) + (req.hash) + (req.hashPrev))
        if ((typeof req.index == 'number' && typeof req.hash == 'string' && typeof req.hashPrev == 'string') &&
            (req.index != null) && (req.timestamp != null) && (req.uniReward != null) && (req.data != null) && (req.hash != null) && (req.hashPrev != null)) {
            return db.Blockchain.create({
                index: req.index,
                timestamp: Date.now(),
                uniReward: req.uniReward,
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

    //uniRewards functions
    async createUniReward(req, idUser, res) {
        if (((req.body.nameUR != null && req.body.nameUR.length > 0))) {
            return db.UniRewards
                .create({
                    nameUR: req.body.nameUR,
                    descriptionUR: req.body.descriptionUR,
                    imageUR: req.body.imageUR,
                    UserId: idUser,
                    WalletId: await this.obtainWalletId(idUser)
                }).then(data => {
                    console.log(data);
                    return data
                })
        } else {
            console.log("Error in createUniReward")
            res.json({ ok: false, error: "NotCorrectReqParameters" })
        }
    },
    deleteUniReward(req, res) {
        db.UniRewards.update({
            deleted: true
        }, {
            where: {
                id: req.body.id
            }
        }).then(() => {
            console.log("uniReward Eliminated")
        }).catch((val) => {
            res.json({ ok: false, error: val.name });
        });
    },
    updateUniReward(req, res) {
        db.UniRewards.update({
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
    async findUniReward(idUR, res) {
        if (idUR != null || idUR < 0) {
            console.log("db.UniRewards.findByPk(" + idUR + ")")
            db.UniRewards
                .findOne({ where: { id: idUR }, raw: true })
                .then(buscaPin => {
                    if (!buscaPin) {
                        console.log("Not found UniReward"),
                            res.status(400).send(error)
                    } else {
                        console.log("Found UniReward")
                        return buscaPin
                    }

                })
                .catch((error) => res.status(400).send(error).end());
        } else {
            console.log("Error in FindUniReward")
            res.status(400).json({ ok: false, error: "WrongLastIndexUniReward" })
        }

    },
    async existUniReward(id) {
        return db.UniRewards.findOne({
            where: {
                id: id
            }
        }).then((result) => {
            if (result != null) {
                console.log("UniReward with id:" + id + " Find it")
                return true
            } else {
                console.log("UniReward with id:" + id + " Not Find it")
                return false
            }
        })
    },
    async obtainUserIdUR(idUniReward) {
        return db.UniRewards.findOne({
                where: {
                    id: idUniReward
                }
            })
            .then((result) => {
                if (result != null) {
                    console.log("UniReward with id:" + idUniReward + " Find it")
                    return result.UserId
                } else {
                    console.log("UniReward with id:" + idUniReward + " Not Find it")
                }
            })
    },
    async ownableUniReward(idUniReward, username, userPassword) {
        const idUser = await this.obtainUserId(username, userPassword)
        const idUserUR = await this.obtainUserIdUR(idUniReward)
        if (idUser == idUserUR) {
            console.log("User " + username + " has de own property for UniReward with Id:" + idUniReward)
            return true
        } else {
            console.log("User " + username + " hasn`t the own property for UniReward with Id:" + idUniReward)
            return false
        }
    },

    //User Functions
    createUser(req, res) {
        db.Users.create({
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
        db.Users.update({
            deleted: true
        }, {
            where: {
                id: id
            }
        }).then((result) => {
            console.log("OK User with id:" + id + " eliminated")
            db.Wallets.update({
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
        db.Users.update({
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
            return db.Users.findOne({
                where: {
                    id: idObject
                }
            }).then((result) => {
                if (result != null) {
                    console.log("Deleted field is: " + result.deleted)
                    return result.deleted
                } else {
                    console.log("Deleted field is: " + false)
                    return false
                }
            })
        } else if (opc == 1) {
            return db.Wallets.findOne({
                where: {
                    id: idObject
                }
            }).then((result) => {
                if (result != null) {
                    console.log("Deleted field is: " + result.deleted)
                    return result.deleted
                } else {
                    console.log("Deleted field is: " + false)
                    return false
                }
            })
        } else if (opc == 2) {
            return db.UniRewards.findOne({
                where: {
                    id: idObject
                }
            }).then((result) => {
                if (result != null) {
                    console.log("Deleted field is: " + result.deleted)
                    return result.deleted
                } else {
                    console.log("Deleted field is: " + false)
                    return false
                }
            })
        }
    },
    async obtainUserPassword(id) {
        return db.Users.findOne({
            where: {
                id: id
            }
        }).then((result) => {
            console.log(result.password)
            return result.password
        })
    },
    async userIdExists(id) {
        return db.Users.findOne({
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
            return db.Users.findOne({
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
                    return null
                }
            })
        } else {
            console.log("Parameters to obatain Wallet isnt correct")
            return null
        }

    },
    async isUserCreated(req) {
        if ((typeof req.body.username == 'string' && typeof req.body.name == 'string' && typeof req.body.fullSurname == 'string' && typeof req.body.username == 'string') &&
            req.body.username != null && req.body.name != null && req.body.fullSurname != null && req.body.password != null &&
            req.body.username.length > 0 && req.body.name.length > 0 && req.body.fullSurname.length > 0 && req.body.password.length > 0) {
            return db.Users.findOne({
                where: {
                    username: req.body.username
                }
            }).then((result) => {
                if (result != null) {
                    console.log("User find it")
                    if (result.delete == true) {
                        console.log("User can created")
                        return false
                    } else {
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
            return db.Users.findOne({
                where: {
                    id: idUser
                }
            }).then((result) => {
                if (result.delete == true) {
                    console.log("User is Deleted")
                    return true
                } else {
                    console.log("User is not Deleted")
                    return false
                }
            })
        } else {
            console.log("idUser isn't a number")
            return null
        }

    },

    //Wallet functions
    createWallet(req, res) {
        if (typeof req.keyPublic == 'string' && typeof req.keyPrivate == 'string' && typeof req.owner == 'number') {
            return db.Wallets.create({
                publicKey: req.keyPublic,
                privateKey: req.keyPrivate,
                UserId: req.owner
            }).then(() => {
                console.log("Wallet Created")
            }).catch((val) => {
                console.log("Error: " + val);
            });
        } else {
            console.log("Something with the data isn't correct")
        }

    },
    deleteWallet(idUser) {
        if (typeof idUser == 'number') {
            db.Wallets.update({
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
    async updateIdArrayWallet(idUser, idUniReward, privateKey, password, res) {
        let privateKeyId = await this.obtainPrivateKeyId(idUser)
        let userpassword = await this.obtainUserPassword(idUser)
        console.log("Compare if " + privateKey + " is equals to " + privateKeyId)
        console.log("Compare if " + userpassword + " is equals to " + userpassword)
        if (privateKey == privateKeyId && userpassword == password && (typeof idUser == 'number' && typeof idUniReward == 'number' &&
                typeof privateKey == 'string' && typeof password == 'string')) {
            console.log("Private Key is correct")
            db.Wallets.findOne({
                where: {
                    UserId: idUser
                }
            }).then((result) => {
                console.log(result.idsUniRewards)
                result.idsUniRewards.push(idUniReward)
                db.Wallets.update({
                    idsUniRewards: result.idsUniRewards
                }, {
                    where: {
                        UserId: idUser
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
    async takeUniRewardFromWallet(privKey, idUniReward) {
        const isWalletDeleted = this.isWalletDeletedPK(privKey)
        const isUniRDeleted = this.isUniRDeleted(idUniReward)
        if (typeof privKey == 'string' && typeof idUniReward == 'number') {
            if (isWalletDeleted && isUniRDeleted) {
                return db.Wallets.findOne({
                    where: {
                        privateKey: privKey
                    }
                }).then((result) => {
                    console.log(result.idsUniRewards)
                    const index = result.idsUniRewards.indexOf(idUniReward);
                    console.log("The localitation of idUniReward:" + idUniReward + "is " + index)
                    if (index > -1) {
                        result.idsUniRewards.splice(index, 1) //Delete idUniReward once in the array
                        db.Wallets.update({
                            idsUniRewards: result.idsUniRewards
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
                    console.log("Error: " + val);
                });
            } else {
                console.log("Cant remove UniReward from Wallet - Reason: UniReward or Wallet of parameters dosent exists")
            }
        } else {
            console.log("Cant remove UniReward from Wallet - Reason: Not correct type of parameters")
        }
    },
    async obtainPrivateKeyId(id) {
        if (typeof id == 'number') {
            return db.Wallets.findOne({
                where: {
                    UserId: id
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
    async obtainWalletId(idUsu) {
        if (typeof idUsu == 'number' || idUsu != null) {
            return db.Wallets.findOne({
                where: {
                    UserId: idUsu
                }
            }).then((result) => {
                if (result == null) {
                    console.log("No Wallet for User with id:" + idUsu)
                    return null
                } else {
                    console.log("Getting idWallet own by idUser: " + result.id)
                    return result.id
                }
            })
        } else {
            console.log("Id to obtain WalletId isnt correct")
        }
    },
    async isWalletDeletedPK(privKey) {
        if (typeof privKey == 'string') {
            return db.Wallets.findOne({
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
    async isUniRDeleted(idUniReward) {
        if (typeof idUniReward == 'number') {
            return db.UniRewards.findOne({
                where: {
                    id: idUniReward
                }
            }).then((result) => {
                console.log("Getting delete field: " + result.delete)
                return result.delete
            })
        } else {
            console.log("Id to obtain UniRin isnt a number")
        }
    },
    async userHasWallet(idUsu) {
        if (typeof idUsu == 'number' && idUsu != null || idUsu != undefined) {
            return db.Wallets.findOne({
                where: {
                    UserId: idUsu
                }
            }).then((result) => {
                if (result != null) {
                    console.log("idUser: " + idUsu + " has a wallet")
                    return true
                } else {
                    console.log("idUser: " + idUsu + " hasn't a wallet")
                    return false
                }
            })
        } else {
            console.log("Id to comprobate if User has wallet isnt a number")
            return null
        }

    },

    //Transactions functions
    async createTransaction(transaction, res) {
        return db.Transactions.create({
            fromAddress: transaction.fromAddress,
            toAddress: transaction.toAddress,
            amount: transaction.amount,
            signature: transaction.signatureC,
            UniRewardId: transaction.UniRewardId
        }).then((result) => {
            console.log("Transaction Created")
            return result
        }).catch((val) => {});
    },
    async proveTransactionParams(req) {
        //Prove Destination and From Addresses
        if (req.body.fromAddress != null && req.body.toAddress != null && req.body.amount != null && req.body.UniRewardId != null &&
            typeof req.body.fromAddress == 'string' && typeof req.body.toAddress == 'string' && typeof req.body.amount == 'number' && typeof req.body.UniRewardId == 'number' &&
            req.body.fromAddress != req.body.toAddress) {
            let isWalletFromAddressExistNoDelete = await this.existAndNoDeleteWallet(req.body.fromAddress)
            let isWalletToAddressExistNoDelete = await this.existAndNoDeleteWallet(req.body.toAddress)
            if (isWalletFromAddressExistNoDelete && isWalletToAddressExistNoDelete) {
                console.log("All is correct in params of Transaction")
                return true
            } else {
                console.log("User's transaction dont exist or User's transaction is deleted")
                return false
            }
        } else {
            console.log("Some isn't correct in params of Transaction")
            return false
        }

    },
    async existAndNoDeleteWallet(walletDirection) {
        if (typeof walletDirection != 'string' && walletDirection != null) {
            return db.Wallets.findOne({
                where: {
                    publicKey: walletDirection
                }
            }).then((result) => {
                if (result != null) {
                    if (result.delete == false) {
                        console.log("WalletAdress is correct and Dont deleted")
                        return true
                    } else {
                        console.log("WalletAdress is correct but is Deleted")
                        return false
                    }

                } else {
                    console.log("WalletAdress isn't correct")
                    return false
                }
            }).catch((val) => {})
        } else {
            console.log("Wrong parametrs to ")
        }
    }
}