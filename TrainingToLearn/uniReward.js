const controllerDB = require('./controllers/database/controllerUniRewardDB');

class UniReward {
    constructor(req, userFromId) {
        this.id,
            this.nameUR = req.nameUR,
            this.descriptionUR = req.descriptionUR,
            this.imageUR = "http://asdfasdfasdfasdfasdfasdfasdfasdf.com",
            this.cost = req.costReward,
            this.moneyExp = [],
            this.purchase = 0,
            this.hash = "",
            this.WalletId = userFromId
    }
    proveNotNullObject() {
        if (this.nameUR != null && this.descriptionUR != null && this.imageUR != null && this.cost != null && this.moneyExp != null &&
            this.purchase != null && this.hash != null && this.WalletId != null) {
            return false
        } else {

            return true
        }
    }

    setHash(hash) {
        this.hash = hash
    }

    async getAndSetLastId() {
        var lastID = await controllerDB.getLastUniRewardIndex()
        this.id = lastID
    }
}
module.exports = UniReward