const controllerDB = require('./controllers/database/controllerUniRewardDB');

class UniReward {
    constructor(req, userFromId) {
        this.id,
            this.nameUR = req.nameUR,
            this.descriptionUR = req.descriptionUR,
            this.imageUR = "http://asdfasdfasdfasdfasdfasdfasdfasdf.com",
            this.cost = req.costReward,
            this.WalletId = userFromId
    }
    proveNotNullObject() {
        if (this.nameUR != null && this.descriptionUR != null && this.imageUR != null && this.cost != null && this.WalletId != null) {
            return false
        } else {

            return true
        }
    }

    setHash(hash) {
        this.hash = hash
    }

}
module.exports = UniReward