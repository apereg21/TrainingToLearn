const controllerDB = require('./controllers/controllerDatabase');

class SmartContract {
    constructor(walletIdO, walletIdD, signO, signD, cond, dUnipoint, uniRewardId) {
        this.walletIdObserver = walletIdO,
            this.walletIdDemander = walletIdD,
            this.signatureObserver = signD,
            this.signatureDemander = signO,
            this.state = 0,
            this.condition = cond,
            this.deliveredUniPoints = [...dUnipoint]
        this.UniRewardId = uniRewardId;
    }
}
module.exports = SmartContract