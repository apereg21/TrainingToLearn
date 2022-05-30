const db = require('../../models')
const SHA256 = require('crypto-js/sha256')

module.exports = {

    async getLastIdUP() {
        return db.UniPoints
            .count()
            .then((result) => {
                console.log("LastUnipointId in database found it: " + result)
                return result + 1
            })
            .catch((error) => console.log("Error: " + error));
    },
    async getPointsToChange(userFromId, numbPoints, uniRewardId) {
        var pointsToChange = []
        return db.UniPoints.findAll({
            limit: numbPoints,
            where: {
                WalletId: userFromId,
                UniRewardId: uniRewardId,
                alPurchase: 0
            },
            order: [
                ['id', 'ASC'],
            ]
        }).then((uniPoints) => {
            pointsToChange = uniPoints.map((uniPoint) => uniPoint.id)
            console.log("==============================================")
            console.log(pointsToChange)
            console.log("==============================================")
            return pointsToChange

        }).catch((val) => {
            console.log(val)
        })
    },
    async createPoints(pointsArray) {
        return db.UniPoints.bulkCreate(pointsArray)
            .then((points) => {
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
    async updateHashUniPoint(transactionObjId, uniRewardId, hashBlock) {
        return db.Transactions.findOne({
            where: {
                UniRewardId: uniRewardId
            }
        }).then((result) => {
            console.log("===========================================")
            console.log(result.uniPointIds)
            console.log("===========================================")
            return db.UniPoints.update({
                hash: SHA256(transactionObjId + hashBlock).toString()
            }, {
                where: {
                    id: result.uniPointIds
                }
            }).then(() => {
                console.log(SHA256(transactionObjId + hashBlock).toString())
            })
        })
    }
}