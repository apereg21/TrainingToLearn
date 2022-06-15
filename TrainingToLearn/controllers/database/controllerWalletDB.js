const db = require('../../models')
const controllerTransactionsDB = require('./controllerTransactionsDB')
const controllerUniRewardDB = require('./controllerUniRewardDB')

module.exports = {
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
    obtainIdFromAddress(publicAddress) {
        return db.Wallets.findOne({
            where: {
                publicKey: publicAddress
            }
        }).then((result) => {
            if (result != null) {
                return result.id
            }
        })
    },
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
    async getUniRewardsIdsInWallet(idUser) {
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
    async getUserWalletAddress(idUser) {
        return db.Wallets.findOne({
            where: {
                UserId: idUser
            }
        }).then((result) => {
            return result.publicKey
        }).catch(() => {
            return null
        })
    },

    async getUserWalletData(idUser) {
        var vectorURTransac = []
        var resultF
        if (typeof idUser == 'number') {
            return db.Wallets.findOne({
                where: {
                    UserId: idUser
                }
            }).then(async(result) => {
                if (result != null) {
                    console.log("User wallet data find it")
                    resultF = result
                    return db.UniPoints.findAll({
                        where: {
                            id: result.money,
                            alPurchase: 0
                        }
                    }).then(async(result2) => {
                        vectorURTransac.push(result2.length)
                        if (!(resultF.idsUniRewards.length <= 0)) {
                            var uniRewardsList = []
                            for (var i = 0; i < resultF.idsUniRewards.length; i++) {
                                var uniReward = await controllerUniRewardDB.getSpecificUR(resultF.idsUniRewards[i])
                                if (uniReward.purchase != 0) {
                                    uniRewardsList.push(uniReward)
                                }
                            }
                            vectorURTransac.push(uniRewardsList)
                            var transactionList = await controllerTransactionsDB.getUserWalletTransaction(resultF.UserId)
                            for (var i = 0; i < transactionList.length; i++) {
                                var nameAddress = await this.getNameAdressWallet(transactionList[i].fromAddress)
                                var nameAddress2 = await this.getNameAdressWallet(transactionList[i].toAddress)
                                var nameUniReward = await controllerUniRewardDB.getUniRewardName(transactionList[i].UniRewardId)
                                transactionList[i].fromAddress = nameAddress
                                transactionList[i].toAddress = nameAddress2
                                transactionList[i].UniRewardId = nameUniReward
                            }
                            vectorURTransac.push(transactionList)
                        } else {
                            var transactionList = await controllerTransactionsDB.getUserWalletTransaction(resultF.UserId)
                            for (var i = 0; i < transactionList.length; i++) {
                                var nameAddress = await this.getNameAdressWallet(transactionList[i].fromAddress)
                                var nameAddress2 = await this.getNameAdressWallet(transactionList[i].toAddress)
                                transactionList[i].fromAddress = nameAddress
                                transactionList[i].toAddress = nameAddress2
                            }
                            vectorURTransac.push(transactionList);
                        }
                        return vectorURTransac
                    })
                } else {
                    console.log("User wallet data not find it")
                    return null
                }
            }).catch(() => {
                console.log("User data don't loaded - Reason: The database isn't correct, try to restore DB")
                return null
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

                }).catch((val) => {})
            } else {
                return null
            }

        }).catch((val) => {})
    },
    async updateIdUniRewardWallet(idUser, idUniReward) {
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
            if (!(result.idsTransactions.includes(idTransaction))) {
                vectorTransIds = result.idsTransactions.concat(idTransaction)
                return db.Wallets.update({
                    idsTransactions: vectorTransIds
                }, {
                    where: {
                        id: idWallet
                    }
                })
            }
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

    async getUserMoney(userWalletId, idUniReward) {
        return db.Wallets.findOne({
            where: {
                id: userWalletId
            }
        }).then((result) => {
            if (result != null) {
                return db.UniPoints.findAll({
                    where: {
                        alPurchase: 0,
                        id: result.money,
                        UniRewardId: idUniReward
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
                console.log(idsToChange)
                console.log("Points traspased to UniReward")
            }).catch((val) => { console.log(val) })
        }).catch((val) => { console.log(val) })

    },
}