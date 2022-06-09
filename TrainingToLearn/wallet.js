const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Wallet{
    constructor(owner){
        this.owner = owner
        this.keyPublic ="" 
        this.keyPrivate =""
        this.generatePublicPrivateKey()
    }
    generatePublicPrivateKey(){
        const key = ec.genKeyPair();
        this.keyPublic = key.getPublic('hex');
        this.keyPrivate = key.getPrivate('hex');
    }
}
module.exports = Wallet