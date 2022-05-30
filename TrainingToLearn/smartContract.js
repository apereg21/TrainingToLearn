const controllerSContractDB = require('./controllers/database/controllerSContractDB');
const controllerWalletDB = require('./controllers/database/controllerWalletDB');
const controllerTransactionDB = require('./controllers/database/controllerTransactionsDB');
const controllerUniRewardDB = require('./controllers/database/controllerUniRewardDB');
const controllerUniPointDB = require('./controllers/database/controllerUniPointDB');

class SmartContract {
    constructor(walletIdO, walletIdD, dUnipoint, uniRewardId) {
        this.walletIdObserver = walletIdO,
            this.walletIdDemander = walletIdD,
            this.signatureObserver,
            this.signatureDemander,
            this.state = 0,
            this.condition = [...dUnipoint],
            this.deliveredUniPoints = []
        this.UniRewardId = uniRewardId;
    }
    setDeliveredUniPoints(deliveredUniPoints) {
        this.deliveredUniPoints = [...deliveredUniPoints];
    }

    calHashTransaction() {
        return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp + this.concept + this.idWalletFrom + this.idWalletTo + this.typeT).digest('hex');
    }

    signContract(signingKey, type) {
        console.log("With the private key: " + signingKey)
        const signingKeyInterna = ec.keyFromPrivate(signingKey, 'hex');
        console.log("We compare if: " + signingKeyInterna.getPublic('hex') + "\nis equal to: " + this.fromAddress)
            //Prove if is the key of correct user 
        if (type == 0) {
            if (signingKeyInterna.getPublic('hex') != this.fromAddress) {
                console.log('The key doesnt belong to the expected user');
                this.signatureFrom = null
            } else {
                const hash = this.calHashTransaction();
                const sig = signingKeyInterna.sign(hash, 'base64');
                var signature = sig.toDER('hex');
                console.log("Signed: " + signature)
                this.signatureFrom = signature

            }
        } else {
            if (signingKeyInterna.getPublic('hex') != this.toAddress) {
                console.log('The key doesnt belong to the expected user');
                this.signatureTo = null
            } else {
                const hash = this.calHashTransaction();
                const sig = signingKeyInterna.sign(hash, 'base64');
                var signature = sig.toDER('hex');
                console.log("Signed: " + signature)
                this.signatureTo = signature
            }
        }

    }

    async terminateContract() {
        await controllerSContractDB.updateStateSC(this.UniRewardId)
        this.state = true
    }

    proveCompleteContract() {
        console.log('==============================================================')
        console.log(this.deliveredUniPoints + "is equals to " + this.condition)
        if (this.deliveredUniPoints.length != this.condition.length) {
            return false
        } else {
            return (Array.isArray(this.deliveredUniPoints) &&
                Array.isArray(this.condition) &&
                this.deliveredUniPoints.length === this.condition.length &&
                this.deliveredUniPoints.every((val, index) => val === this.condition[index]))

        }
    }

    async endSmartContract(idsWallets, transactionObjId, idsToChange) {

        await controllerWalletDB.moveToMoneyExp(idsToChange, idsWallets[1], this.UniRewardId)

        await controllerUniPointDB.updatePurchasePoints(idsToChange)

        await controllerWalletDB.updateTransactionIds(idsWallets[0], transactionObjId)
        await controllerWalletDB.updateTransactionIds(idsWallets[1], transactionObjId)

        await controllerWalletDB.updateIdUniRewardWallet(idsWallets[1], this.UniRewardId)

        await controllerUniRewardDB.updatePurchaseField(this.UniRewardId)

        await controllerSContractDB.updateStateSC(this.UniRewardId)
        this.state = true
    }

}
module.exports = SmartContract