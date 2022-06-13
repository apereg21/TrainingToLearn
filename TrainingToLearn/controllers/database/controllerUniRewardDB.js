const db = require('../../models')
const SHA256 = require('crypto-js/sha256')

module.exports = {
    async getLastUniRewardIndex() {
        return db.UniRewards
            .count()
            .then((result) => {
                console.log("LastUnireward in database is : " + (result + 1))
                return (result + 1)
            })
            .catch((error) => console.log("Error: " + error));
    },

    //uniRewards functions
    async updateHashUniReward(transactionObjId, uniRewardId, hashBlock) {
        return db.UniRewards.update({
            hash: SHA256(transactionObjId + hashBlock).toString()
        }, {
            where: {
                id: uniRewardId
            }
        })

    },

    async getAllRewards(idUser, pruch) {
        return db.UniRewards.findAll({
            where: {
                WalletId: idUser,
                purchase: pruch
            }
        }).then((result) => {
            return result
        })
    },

    async createUniReward(req, hashBlock) {
        var isUniRewardNameUsed = await this.isUniRewardCreated(hashBlock)
        if (isUniRewardNameUsed != true && isUniRewardNameUsed != null) {
            return db.UniRewards
                .create({
                    nameUR: req.nameUR,
                    descriptionUR: req.descriptionUR,
                    imageUR: req.imageUR,
                    cost: req.cost,
                    WalletId: req.WalletId
                }).then(data => {
                    if (data != null) {
                        console.log(data);
                        return true
                    } else {
                        return false
                    }
                })
        } else {
            console.log("UniReward don't created - Reason: Already Exists")
            return null
        }
    },
    async isUniRewardCreated(hashUR) {
        return db.UniRewards.count({}).then(counter => {
            if (counter == 0) {
                return false
            } else {
                return db.UniRewards.findOne({
                    where: {
                        hash: hashUR
                    }
                }).then((result) => {
                    if (result != null) {
                        return true
                    } else {
                        return false
                    }
                })
            }
        })
    },
    async getUniRewardName(idUniReward) {
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
    async getUserIDFromReward(uniRewardN) {
        return db.UniRewards.findOne({
            where: {
                nameUR: uniRewardN
            }
        }).then((result) => {
            if (result != null) {
                return result.WalletId
            } else {
                return null
            }
        })
    },
    async getUniRewardId(uniRewardN) {

        return db.UniRewards.findOne({
                where: {
                    nameUR: uniRewardN
                }
            })
            .then((result) => {
                if (result != null) {
                    if (result.deleted != true) {
                        return result.id
                    } else {
                        return null
                    }
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
    async getUniReward(idUniReward) {
        return db.UniRewards.findOne({
            where: {
                id: idUniReward
            }
        }).then((result) => {
            if (result != null) {
                return result
            } else {
                return null
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
            if (result != null) {
                return result.purchase
            } else {
                return false
            }
        })
    },
}