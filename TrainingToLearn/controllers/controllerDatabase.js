const db = require('../models')

module.exports = {
    allBlocks() {
        return db.Blockchain.findAll();
    },
    async getLastBlockIndex() {
        return db.Blockchain
            .count()
            .then((result) => {
                console.log("LastBlock in blockchain found it: " + result)
                return result
            })
            .catch((error) => console.log("Error: " + error));
    },
    async createBlock(req) {
        return db.Blockchain.create({
            index: req.index,
            timestamp: Date.now(),
            idsTransactions: req.transactionIds,
            hash: req.hash,
            hashPrev: req.hashPrev
        }).then((result) => {
            console.log("The index of last creation is: " + result.index)
            return result.index
        }).catch((error) => console.log("Error: " + error));
    },
    async getHashLastBlock(lastIndex) {
        console.log("Last index is: " + lastIndex)
        if (lastIndex >= 0 && lastIndex != null && typeof lastIndex == 'number') {
            return db.Blockchain.findOne({
                where: {
                    index: lastIndex
                }
            }).then(result => {
                if (!result) {
                    console.log("Not found HashLastBlock")
                } else {
                    console.log("Found HashLastBlock")
                    return result.hash
                }

            })
        } else {
            console.log("Error in getHashLastBlock WrongLastIndexBlock")
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
    async getAllRewards() {
        return db.UniRewards.findAll({}).then((result) => {
            return result
        })
    },
    async createUniReward(req, idUser) {
        if (((req.body.nameUR != null && req.body.nameUR.length > 0))) {
            return db.UniRewards
                .create({
                    nameUR: req.body.nameUR,
                    descriptionUR: req.body.descriptionUR,
                    imageUR: req.body.imageUR,
                    cost: req.body.costReward,
                    username: req.body.username,
                    password: req.body.password
                }).then(data => {
                    console.log(data);
                    return data
                })
        } else {
            console.log("Error in createUniReward")
        }
    },
    deleteUniReward(req) {
        db.UniRewards.update({
            deleted: true
        }, {
            where: {
                id: req.body.id
            }
        }).then(() => {
            console.log("uniReward Eliminated")
        }).catch((val) => {
            console.log("Error: " + val.name)
        });
    },
    async getUniRewardId(uniRewardT) {
        return db.UniRewards.findOne({
                where: {
                    nameUR: uniRewardT
                }
            })
            .then((result) => {
                if (result != null) {
                    return result.id
                } else {
                    return null
                }
            })
    },
    async findUniReward(idUR) {
        if (idUR != null || idUR < 0) {
            console.log("db.UniRewards.findByPk(" + idUR + ")")
            db.UniRewards
                .findOne({ where: { id: idUR }, raw: true })
                .then(buscaPin => {
                    if (!buscaPin) {
                        console.log("Not found UniReward")
                    } else {
                        console.log("Found UniReward")
                        return buscaPin
                    }

                })
                .catch(
                    (error) => console.log("Error: " + error)
                )
        } else {
            console.log("Error in FindUniReward - WrongLastIndexUniReward")
        }

    },
    async existUniReward(id) {
        if (id != null && typeof id == 'number') {
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
        } else {
            console.log("Id administrated isn't correct")
            return null
        }
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
    async getAllUsers() {
        return db.Users.findAll({}).then((result) => {
            return result
        })
    },
    async createUser(req) {
        return db.Users.create({
            name: req.body.name,
            fullSurname: req.body.fullSurname,
            username: req.body.username,
            password: req.body.password,
            typeUser: req.body.roleUser
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
                console.log("Error" + val.name);
            });
        }).catch((val) => {
            console.log("Error" + val.name);
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
    async findUserAddress(usName) {
        return db.Users.findOne({
            where: {
                username: usName
            }
        }).then((result) => {
            if (result != null) {
                return db.Wallets.findOne({
                    where: {
                        id: result.id
                    }
                }).then((wallet) => {
                    if (wallet != null) {
                        return wallet.publicKey
                    } else {
                        return null
                    }
                })
            } else {
                return null
            }
        })
    },

    async obtainUserId(usName, usPass) {
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
    },

    async obtainUserType(usName, usPass) {
        return db.Users.findOne({
            where: {
                username: usName,
                password: usPass
            }
        }).then((result) => {
            if (result != null) {
                console.log("User find it")
                return result.typeUser
            } else {
                console.log("User not find it")
                return null
            }
        })
    },

    async isUserCreated(req) {
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
    },
    async usernameDeleted(usName) {
        return db.Users.findOne({
            where: {
                username: usName
            }
        }).then((result) => {
            if (result.delete) {
                return true
            } else {
                return false
            }
        })
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
    async getUserData(idUser) {
        if (typeof idUser == 'number') {
            return db.Users.findOne({
                where: {
                    id: idUser
                }
            }).then((result) => {
                if (result != null) {
                    console.log("User data find it")
                    return result
                } else {
                    console.log("User data not find it")
                    return null
                }
            })
        } else {
            console.log("idUser isn't a number")
            return null
        }
    },
    async modifyUserData(usNameN, usFullSurnameN, usUserNameN, usPasswordN, userId) {
        let user = await this.getUserData(userId)
        if (usPasswordN == "") {
            console.log("User's password don't change")
            usPasswordN = user.password
        }
        if (usUserNameN == "") {
            console.log("User's username don't change")
            usUserNameN = user.username
        }
        if (usNameN == "") {
            console.log("User's name don't change")
            usNameN = user.name
        }
        if (usFullSurnameN == "") {
            console.log("User's full surname don't change")
            usFullSurnameN = user.fullSurname
        }
        return db.Users.update({
            name: usNameN,
            fullSurname: usFullSurnameN,
            username: usUserNameN,
            password: usPasswordN,
        }, {
            where: {
                id: userId
            }
        }).then(() => {
            console.log("User changed")
        })

    },
    async isUsernameUsed(userName) {
        return db.Users.findOne({
            where: {
                username: userName,
                deleted: false
            }
        }).then((result) => {
            if (result != null) {
                console.log("Username find it")
                return true
            } else {
                console.log("Username not find it")
                return false
            }
        })
    },

    //Wallet functions
    createWallet(req) {
        return db.Wallets.create({
            publicKey: req.keyPublic,
            privateKey: req.keyPrivate,
            UserId: req.owner
        }).then(() => {
            console.log("Wallet Created")
        }).catch((val) => {
            console.log("Error: " + val);
        });
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
    async updateIdArrayWallet(idUser, idUniReward, privateKey, password) {
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
            console.log("Something with the data isn't correct - Key isn't correct")
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
                    return null
                }

            })
        } else {
            console.log("Id to obtain WalletId isnt a number")
            return null
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
            return null
        }
    },
    async userHasWallet(idUsu) {
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
    },

    //Transactions functions
    async createTransaction(transaction, type) {
        if (type == "M") {
            return db.Transactions.create({
                fromAddress: transaction.fromAddress,
                toAddress: transaction.toAddress,
                money: transaction.amount,
                typeTransaction: transaction.typeT,
                signature: transaction.signatureC
            }).then((result) => {
                console.log("Transaction Created")
                return result.id
            }).catch((val) => { console.log(val) });
        } else {
            return db.Transactions.create({
                fromAddress: transaction.fromAddress,
                toAddress: transaction.toAddress,
                money: transaction.amount,
                typeTransaction: transaction.typeT,
                signature: transaction.signatureC,
                UniRewardId: transaction.UniRewardId
            }).then((result) => {
                console.log("Transaction Created")
                return result.id
            }).catch((val) => { console.log(val) });
        }

    },
    async existAndNoDeleteWallet(walletDirection) {
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
    }
}