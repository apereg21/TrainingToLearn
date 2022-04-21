const controllerDB = require('./controllers/controllerDatabase');

class UniReward {
    constructor(req, userToId){ 
        this.nameUR = req.nameUR, 
        this.descriptionUR= req.descriptionUR, 
        this.imageUR= "http://asdfasdfasdfasdfasdfasdfasdfasdf.com", 
        this.cost= req.costReward, 
        this.moneyExp= [], 
        this.purchase= 0, 
        this.hash= "",
        this.WalletId= userToId
    }
    proveNotNullObject(){
        if(this.nameUR!=null && this.descriptionUR!=null && this.imageUR!=null && this.cost!=null && this.moneyExp!=null 
            && this.purchase!=null && this.hash!=null && this.WalletId!=null){
            console.log("==============================================================================================================================")
            console.log(this.nameUR+ "  " +this.descriptionUR+ "  " +this.imageUR+ "  " +this.cost+ "  " +this.moneyExp+ "  " +this.purchase+ "  " +this.hash+ "  " +this.WalletId)
            console.log("==============================================================================================================================")
            return false
        }else{
            
            return true
        }
    }

    setHash(hash){

        this.hash= hash
        console.log("==========================================================")
        console.log(this.hash)
        console.log("==========================================================")
    }

    async getLastIndex() {
        return controllerDB.getLastUniRewardIndex()
    }
}
module.exports = UniReward