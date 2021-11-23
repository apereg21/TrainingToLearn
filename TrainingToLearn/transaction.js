const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    /*  El contructor necesita, la fecha de la transacción, destinatario, remitente
    *   y la cantidad que se deseea traspasar de una cartera a otra
    */
    constructor(fromAddress, toAddress, amount) {
      this.fromAddress = fromAddress;
      this.toAddress = toAddress;
      this.amount = amount;
      this.timestamp = Date.now();
      this.signatureC = "";
    }
  
    /*
    *   Función para generar hash de la trasaccion
     */
    calculateHash() {
      return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + this.amount + this.timestamp).digest('hex');
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

      console.log("El parametro: "+signingKey)
      const signingKeyInterna = ec.keyFromPrivate(signingKey,'hex');
      console.log("La privada: "+signingKeyInterna.getPrivate('hex'))
      console.log("La publica de la izquierda: "+signingKeyInterna.getPublic('hex')+"\nLa publica de la derecha: "+this.fromAddress)
      if (signingKeyInterna.getPublic('hex') != this.fromAddress) {
        throw new Error('You cannot sign transactions for other wallets!');
      }

      const hashTx = this.calculateHash();
      const sig = signingKeyInterna.sign(hashTx, 'base64');
  
      var signature = sig.toDER('hex');
      console.log("Firmado: "+signature)
      this.signatureC=signature
    }

    isValid() {
      if (this.fromAddress === null) return true;
      if (!this.signatureC || this.signatureC.length === 0) {
        throw new Error('No signature in this transaction');
      }
      const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
      return publicKey.verify(this.calculateHash(), this.signatureC);
    }
}
module.exports=Transaction