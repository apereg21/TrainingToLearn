const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Wallet{
    constructor(owner){
        this.owner = owner
        this.balance = 0
        this.keyPublic ="" 
        this.keyPrivate =""
        this.idLogroPins=[]
        this.generatePublicPrivateKey()
    }
    generatePublicPrivateKey(){
        const key = ec.genKeyPair();
        this.keyPublic = key.getPublic('hex');
        this.keyPrivate = key.getPrivate('hex');
    }
}
module.exports = Wallet