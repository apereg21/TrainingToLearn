const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    /*  El contructor necesita, la fecha de la transacción, destinatario, remitente
     *   y la cantidad que se deseea traspasar de una cartera a otra
     */
    constructor(fromAddress, toAddress, amount, logropinId) {
            this.fromAddress = fromAddress;
            this.toAddress = toAddress;
            this.amount = amount;
            this.timestamp = Date.now();
            this.signatureC = "";
            this.LogroPinId = logropinId;
        }
        /*
         *   Firmar la transacción, que se realiza mediante la clave privada
         */
    signTransaction(signingKey) {
        //Probamos que la publicKey que se genero es la correcta. Esto se puede hacer de la siguiente manera:
        /*
          Con la clave privada, lo que podemos hacer es obtener la clave publica, con el comando
          .getPublic(). Si no es la misma dirección, estamos ante un error
        */
        console.log()
        console.log()
        console.log("With the private key: " + signingKey)
        const signingKeyInterna = ec.keyFromPrivate(signingKey, 'hex');
        console.log("We compare if: " + signingKeyInterna.getPublic('hex') + "\nis equal to: " + this.fromAddress)
        if (signingKeyInterna.getPublic('hex') != this.fromAddress) {
            console.log('Something gone wrong with the operations!');
            this.signatureC = null
        }else{
            const hashTx = this.calHashTransaction();
            const sig = signingKeyInterna.sign(hashTx, 'base64');
            var signature = sig.toDER('hex');
            console.log("Firmado: " + signature)
            this.signatureC = signature
        }
        
    }


    /*
     *   Función para generar hash de la trasaccion
     */
    calHashTransaction() {
        return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp).digest('hex');
    }

    isValid() {
        if (this.fromAddress === null) return true;
        if (!this.signatureC || this.signatureC.length === 0) {
            console.log('No signature in this transaction');
        }else{
            const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
            return publicKey.verify(this.calHashTransaction(), this.signatureC);
        }
        
    }
}
module.exports = Transaction