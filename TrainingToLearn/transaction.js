const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {

    constructor(fromAddress, toAddress, amount, unireward, typeTr, idsWallets, concept) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.timestamp = Date.now();
        this.concept = concept;
        this.signatureC = "a234bksdv9876sdPo456ÑKSDFGPIQWeRnsdBQWOUERHsbLAJSDF";

        if (typeTr == "M") {
            this.UniRewardId = null;

        } else {
            this.UniRewardId = unireward;
        }

        this.amount = amount;
        this.idWalletFrom = idsWallets[0]
        this.idWalletTo = idsWallets[1]
        this.typeT = typeTr;
        this.uniPointIds = []
    }

    setUniPointIds(ids) {
        this.uniPointIds = ids
    }

    signTransaction(signingKey) {

        console.log("With the private key: " + signingKey)
        const signingKeyInterna = ec.keyFromPrivate(signingKey, 'hex');
        console.log("We compare if: " + signingKeyInterna.getPublic('hex') + "\nis equal to: " + this.fromAddress)
        if (signingKeyInterna.getPublic('hex') != this.fromAddress) {
            console.log('Something gone wrong with the operations!');
            this.signatureC = null
        } else {
            const hashTx = this.calHashTransaction();
            const sig = signingKeyInterna.sign(hashTx, 'base64');
            var signature = sig.toDER('hex');
            console.log("Firmado: " + signature)
            this.signatureC = signature
        }

    }

    calHashTransaction() {
        return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp + this.concept + this.idWalletFrom + this.idWalletTo + this.typeT).digest('hex');
    }

    isValid() {
        if (this.fromAddress === null) return true;
        if (!this.signatureC || this.signatureC.length === 0) {
            console.log('No signature in this transaction');
        } else {
            const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
            return publicKey.verify(this.calHashTransaction(), this.signatureC);
        }

    }
}
module.exports = Transaction