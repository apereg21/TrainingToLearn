const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {

    constructor(fromAddress, toAddress, amount, unireward, typeTr, idsWallets, concept) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.timestamp = Date.now();
        this.concept = concept;
        this.signatureFrom = "";
        this.signatureTo = "";

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

    calHashTransaction() {
        return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp + this.concept + this.idWalletFrom + this.idWalletTo + this.typeT).digest('hex');
    }

    signTransaction(signingKey,type) {
        console.log("With the private key: " + signingKey)
        const signingKeyInterna = ec.keyFromPrivate(signingKey, 'hex');
        console.log("We compare if: " + signingKeyInterna.getPublic('hex') + "\nis equal to: " + this.fromAddress)
        //Prove if is the key of correct user 
        if(type == 0){
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
        }else{
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

    isValid(type) {
        if(this.typeT=="U"){
            if (this.signatureFrom==null || this.signatureFrom.length == 0) {
                console.log('No signature/s in this transaction');
                return false
            } else{
                const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
                return publicKey.verify(this.calHashTransaction(), this.signatureFrom);
            }
        }else{
            if (this.signatureFrom==null || this.signatureFrom.length == 0 || this.signatureTo==null || this.signatureTo.length == 0) {
                console.log('No signature in this transaction');
                return false
            } else { 
                const publicKeyFrom = ec.keyFromPublic(this.fromAddress, 'hex');
                var isCorrectKF = publicKeyFrom.verify(this.calHashTransaction(), this.signatureFrom);
                if(type==0){
                    return publicKeyFrom.verify(this.calHashTransaction(), this.signatureFrom);
                }else{
                    const publicKeyTo = ec.keyFromPublic(this.toAddress, 'hex');
                    var isCorrectKT = publicKeyTo.verify(this.calHashTransaction(), this.signatureTo); 
                    if(isCorrectKF==false || isCorrectKT==false){
                        return false
                    } else {
                        return true
                    }
                }
            }
        }
        

    }
}
module.exports = Transaction