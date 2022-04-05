const db = require('../models')
const { Op } = require("sequelize");
const unireward = require('../models/unireward');

module.exports = {
    async getBlock(indexNumber) {
        return db.Blockchain.findOne({
            where: {
                index: indexNumber
            }
        }).then(result => {
            return result
        }).catch((error) => console.log("Error: " + error));
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
    async getAllRewards(idUser,pruch) {
        return db.UniRewards.findAll({
            where: {
                WalletId: idUser,
                purchase: pruch
            }
        }).then((result) => {
            return result
        })
    },

    async createUniReward(req, idFinalUser) {
        var isUniRewardNameUsed = await this.isUniRewardNameUsed(req.body.nameUR)
        if (!isUniRewardNameUsed) {
            return db.UniRewards
                .create({
                    nameUR: req.body.nameUR,
                    descriptionUR: req.body.descriptionUR,
                    imageUR: req.body.imageUR,
                    cost: req.body.costReward,
                    username: req.body.username,
                    password: req.body.password,
                    WalletId: idFinalUser
                }).then(data => {
                    if (data != null) {
                        console.log(data);
                        return data
                    } else {
                        return null
                    }
                })
        } else {
            console.log("UniReward don't created - Reason: Already Exists")
            return null
        }
    },
    isUniRewardNameUsed(nameUniR) {
        return db.UniRewards.findOne({
            where: {
                nameUR: nameUniR
            }
        })
            .then((result) => {
                if (result != null) {
                    return true
                } else {
                    return false
                }
            })
    },
    getUniRewardName(idUniReward) {
        return db.UniRewards.findOne({
            where: {
                id: idUniReward
            }
        })
            .then((result) => {
                if (result != null) {
                    return result.nameUR
                } else {
                    return null
                }
            })
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
    async getUsername(userId) {
        return db.Users.findOne({
            where: {
                id: userId
            }
        }).then((result) => {
            if (result != null) {
                return result.username
            } else {
                return null
            }
        })
    },
    async getUserWalletName(userToId) {
        return db.Wallets.findOne({
            where: {
                id: userToId
            }
        })
            .then((result) => {
                if (result != null) {
                    return db.Users.findOne({
                        where: {
                            id: result.UserId
                        }
                    })
                        .then((result2) => {
                            if (result2 != null) {
                                return result2.username
                            } else {
                                return null
                            }
                        })
                } else {
                    return null
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

    async getSpecificUR(idUniReward) {
        return db.UniRewards.findOne({
            where: {
                id: idUniReward
            }
        })
            .then((result) => {
                if (result != null) {
                    console.log("UniReward with id:" + idUniReward + " Find it")
                    return result
                } else {
                    console.log("UniReward with id:" + idUniReward + " Not Find it")
                }
            })
    },

    //User Functions
    async getAllUsers() {
        return db.Users.findAll({ where: { deleted: false } }).then((result) => {
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
    async createSystem(req) {
        return db.Users.create({
            name: req.name,
            fullSurname: req.fullSurname,
            username: req.username,
            password: req.password,
            typeUser: req.typeUser
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
    async findUserAddressID(address) {
        return db.Wallets.findOne({
            where: {
                publicKey: address
            }
        }).then((result) => {
            if (result != null) {
                return result.id
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

    async obtainUserType(idUser) {
        return db.Users.findOne({
            where: {
                id: idUser
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

    async isUserCreated(usName) {
        return db.Users.findOne({
            where: {
                username: usName
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

    async getSpecificUserID(usName, usPass) {
        return db.Users.findOne({
            where: {
                username: usName,
                password: usPass
            }
        }).then((result) => {
            if (result != null) {
                console.log("User data find it")
                return result.id
            } else {
                console.log("User data not find it")
                return null
            }
        }).catch((val) => {
            console.log("Error: " + val);
        });
    },

    async modifyUserData(usNameN, usFullSurnameN, usUserNameN, usPasswordN, userId) {
        let user = await this.getUserData(userId)
        if (usPasswordN == "" || usPasswordN == user.password) {
            console.log("User's password don't change")
            usPasswordN = user.password
        }
        if (usUserNameN == "" || usUserNameN == user.username) {
            console.log("User's username don't change")
            usUserNameN = user.username
        }

        if (usFullSurnameN == "" || usFullSurnameN == user.fullSurname) {
            console.log("User's full surname don't change")
            usFullSurnameN = user.fullSurname
        }
        if (usNameN == "" || usNameN == user.name) {
            console.log("User's name don't change")
            usNameN == user.name
        }
        if (usUserNameN != user.username) {
            console.log("Usernames are diferent, can create user")
            console.log(usUserNameN + "" + user.username)
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
                return true
            }).catch((val) => {
                console.log("Error: " + val);
            });
        } else {
            console.log("Usernames aren't diferent, can't create user")
            return false
        }
    },
    async getUserID(username){
        return db.Users.findOne({
            where: {
                username: username
            }
        }).then((result) => {
            if (result != null) {
                console.log("User data find it")
                return result.id
            } else {
                console.log("User data not find it")
                return null
            }
        }).catch((val) => {
            console.log("Error: " + val);
        });
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
    async getUniRewardInWallet(idUser) {
        return db.Wallets.findOne({
            where: {
                UserId: idUser
            }
        }).then((result) => {
            if (result != null) {
                return result.idsUniRewards
            } else {
                return []
            }
        })
    },
    async updatePurchaseField(idUR) {
        return db.UniRewards.update({
            purchase: true
        }, {
            where: {
                id: idUR
            }
        }).then(() => {
            console.log("Reward Purchased")
        }).catch((val) => {
            console.log("Error: " + val)
        });
    },
    async getPurchaseField(uniRewardId) {
        return db.UniRewards.findOne({
            where: {
                id: uniRewardId
            }
        }).then((result) => {
            return result.purchase
        })
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

    async getUserWalletData(idUser) {
        var vectorURTransac = []
        if (typeof idUser == 'number') {
            return db.Wallets.findOne({
                where: {
                    UserId: idUser
                }
            }).then(async (result) => {
                if (result != null) {
                    console.log("User wallet data find it")
                    vectorURTransac.push(result)
                    if (!(result.idsUniRewards.length <= 0)) {
                        var uniRewardsList = []
                        for (var i = 0; i < result.idsUniRewards.length; i++) {
                            var uniReward = await this.getSpecificUR(result.idsUniRewards[i])
                            if (unireward.purchase != 0) {
                                uniRewardsList.push(uniReward)
                            }
                        }
                        vectorURTransac.push(uniRewardsList)
                        var transactionList = await this.getUserWalletTransaction(result.UserId)
                        for (var i = 0; i < transactionList.length; i++) {
                            var nameAddress = await this.getNameAdressWallet(transactionList[i].fromAddress)
                            var nameAddress2 = await this.getNameAdressWallet(transactionList[i].toAddress)
                            var nameUniReward = await this.getUniRewardName(transactionList[i].UniRewardId)
                            transactionList[i].fromAddress = nameAddress
                            transactionList[i].toAddress = nameAddress2
                            transactionList[i].UniRewardId = nameUniReward
                        }
                        vectorURTransac.push(transactionList)
                    } else {
                        var transactionList = await this.getUserWalletTransaction(result.UserId)
                        for (var i = 0; i < transactionList.length; i++) {
                            var nameAddress = await this.getNameAdressWallet(transactionList[i].fromAddress)
                            var nameAddress2 = await this.getNameAdressWallet(transactionList[i].toAddress)
                            transactionList[i].fromAddress = nameAddress
                            transactionList[i].toAddress = nameAddress2
                        }
                        vectorURTransac.push(transactionList);
                    }
                    return vectorURTransac
                } else {
                    console.log("User wallet data not find it")
                    return null
                }
            })
        } else {
            console.log("idUser isn't a number")
            return null
        }
    },
    async getNameAdressWallet(address) {
        return db.Wallets.findOne({
            where: {
                publicKey: address
            }
        }).then((result) => {
            if (result != null) {
                return db.Users.findOne({
                    where: {
                        id: result.id
                    }
                }).then((result2) => {
                    if (result2 != null) {
                        return result2.username
                    } else {
                        return null
                    }

                }).catch((val) => { })
            } else {
                return null
            }

        }).catch((val) => { })
    },
    async updateIdArrayWallet(idUser, idUniReward) {
        return db.Wallets.findOne({
            where: {
                UserId: idUser
            }
        }).then((result) => {
            console.log(result.idsUniRewards)
            result.idsUniRewards.push(idUniReward)
            return db.Wallets.update({
                idsUniRewards: result.idsUniRewards
            }, {
                where: {
                    UserId: idUser
                }
            }).then(
                console.log("All is fine")
            )
        })
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
        if (typeof idUsu == 'number' && idUsu != null) {
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
    async updateTransactionIds(idWallet, idTransaction) {
        return db.Wallets.findOne({
            where: {
                id: idWallet
            }
        }).then((result) => {
            var vectorTransIds = []
            vectorTransIds = result.idsTransactions.concat(idTransaction)
            return db.Wallets.update({
                idsTransactions: vectorTransIds
            }, {
                where: {
                    id: idWallet
                }
            })
        })
    },
    async paymentToSystem(userWalletId, moneyIds, idTransaction) {
        return db.Wallets.findOne({
            where: {
                id: userWalletId
            }
        }).then((result) => {
            var vectorMoneyIds = [],
                vectorTransIds = []
            vectorMoneyIds = result.money.concat(moneyIds)
            vectorTransIds = result.idsTransactions.concat(idTransaction)
            return db.Wallets.update({
                money: vectorMoneyIds,
                idsTransactions: vectorTransIds
            }, {
                where: {
                    id: userWalletId
                }
            }).then(() => {
                return db.UniPoints.update({
                    WalletId: userWalletId
                }, {
                    where: {
                        id: vectorMoneyIds
                    }
                }).then(() => {
                    console.log("UniPoints updated")
                    console.log("User wallet updated")
                })
            })
        })
    },

    async getUserMoney(userWalletId) {
        return db.Wallets.findOne({
            where: {
                id: userWalletId
            }
        }).then((result) => {
            if (result != null) {
                return db.UniPoints.findAll({
                    where: {
                        id: result.money,
                        alPurchase: 0
                    }
                }).then((result2) => {
                    if (result2 != null) {
                        return result2.length
                    } else {
                        return 0
                    }
                })
            } else {
                return 0
            }
        })
    },

    async paymentPersonToPerson(userFromWalletId, userToWalletId, numbPoints, uniRewardId) {
        var pointsToChange = []
        var idsMoney = []
        //Obtain first n elements           
        return db.UniPoints.findAll({
            limit: numbPoints,
            where: {
                WalletId: userFromWalletId,
                UniRewardId: uniRewardId
            },
            order: [
                ['id', 'ASC'],
            ]
        }).then((points) => {
            //Load info about Dest's Wallet
            if (points != null) {
                pointsToChange = points.map((point) => point.id)
                console.log(pointsToChange)
                return db.Wallets.findOne({
                    where: {
                        id: userToWalletId
                    }
                }).then((result) => {
                    //Update in toAddress 
                    idsMoney = result.money.concat(pointsToChange)
                    return db.Wallets.update({
                        money: idsMoney
                    }, {
                        where: {
                            id: userToWalletId
                        }
                    }).then(() => {
                        //Update in Points Table
                        return db.UniPoints.update({
                            WalletId: userToWalletId
                        }, {
                            where: {
                                id: idsMoney,
                                UniRewardId: uniRewardId
                            }
                        }).then(() => {
                            //Get actual info
                            return db.Wallets.findOne({
                                where: {
                                    id: userFromWalletId
                                }
                            }).then((result2) => {
                                //Update in FromAddress deleted the points delivered
                                var vectorOriginal = result2.money
                                var vectorFinal = vectorOriginal.filter(value => !pointsToChange.includes(value))
                                return db.Wallets.update({
                                    money: vectorFinal
                                }, {
                                    where: {
                                        id: userFromWalletId
                                    }
                                }).then(() => {
                                    console.log("Transaction complete")
                                    return pointsToChange
                                })
                            })
                        })
                    }).catch((val) => {
                        console.log(val)
                    })
                })
            } else {
                return false
            }
        })
    },

    //Transactions functions
    async createTransaction(transaction) {
        if (transaction.typeT == "M") {
            return db.Transactions.create({
                fromAddress: transaction.fromAddress,
                toAddress: transaction.toAddress,
                money: transaction.amount,
                typeTransaction: transaction.typeT,
                concept: transaction.concept,
                signature: transaction.signatureC,
                idWalletFrom: transaction.idWalletFrom,
                idWalletTo: transaction.idWalletTo
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
                concept: transaction.concept,
                signature: transaction.signatureC,
                UniRewardId: transaction.UniRewardId,
                idWalletFrom: transaction.idWalletFrom,
                idWalletTo: transaction.idWalletTo
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
        }).catch((val) => { })
    },
    async getUserWalletTransaction(idWallet) {
        return db.Transactions.findAll({
            where: {
                [Op.or]: [{ idWalletFrom: idWallet }, { idWalletTo: idWallet }]
            }
        }).then((result) => {
            if (result != null) {
                console.log("Transactions find asociated to concrete Wallet")
                return result
            } else {
                console.log("No Transactions find asociated to concrete Wallet")
                return null
            }
        }).catch((val) => { console.log(val) })
    },

    async createPoint(pointsArray) {
        return db.UniPoints.bulkCreate(pointsArray).then((points) => {
            console.log("OK - All points craeted")
            return points.map((point) => point.id)
        });
    },

    async updatePurchasePoints(idsToChange) {
        return db.UniPoints.update({
            alPurchase: true
        }, {
            where: {
                id: idsToChange
            }
        }).then((result) => {
            if (result != null) {
                console.log("Purchase UniPoints")
            } else {
                console.log("Don't Purchase UniPoints")
            }
        }).catch((val) => { console.log(val) })
    },

    async moveToMoneyExp(idsToChange, walletId, idUR) {
        return db.UniRewards.update({
            WalletId: walletId
        }, {
            where: {
                id: idUR
            }
        }).then(() => {
            return db.UniRewards.update({
                moneyExp: idsToChange
            }, {
                where: {
                    id: idUR
                }
            }).then(() => {
                console.log("Points traspased to UniReward")
            }).catch((val) => { console.log(val) })
        }).catch((val) => { console.log(val) })

    }
}