const controllerDB = require('./controllers/controllerDatabase');

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

    proveCompleteContract(){
        if (this.condition.length !== this.deliveredUniPoints.length) return false
        for (var i = 0; this.condition.length < i; i++) {
            for (var j = 0; this.condition.length < j; j++) {
                if (this.condition[i] != this.deliveredUniPoints[j]) return false;
            }
        }
        return true
    }

}
module.exports = SmartContract