const controllerDB = require('../controllerDatabase');
const Wallet = require('../../wallet');

module.exports = {
    async deleteUser(req, res) {
        const user = await controllerDB.getUserData(req.body.id)

        if (user != null && !user.deleted) {

            const deletedUser = user.deleted
            const idWallet = user.id
            const deletedWallet = await controllerDB.obtainDeleteField(idWallet, 1)

            if ((!deletedUser) && ((!deletedWallet) || deletedWallet != null)) {
                controllerDB.deleteUser(user.id)
                console.log("OK - " + user.username + "'s data eliminated")
                res.send(user.username)
            } else {
                console.log(user.username + "'s data can't be eliminated - Reason: Exist but is Deleted")
                res.send(user.username + "'s data can't be eliminated - Reason: Exist but is Deleted")
            }
        } else {
            if (user == null) {
                console.log(user.username + "'s data can't be eliminated - Reason: User Not Exist")
                res.send(user.username + "'s data can't be eliminated - Reason: User Not Exist")
            } else {
                console.log(user.username + "'s data can't be eliminated - Reason: Already deleted")
                res.send(user.username + "'s data can't be eliminated - Reason: Already deleted")
            }
        }
    },
    async createNewUser(req,res){
        let userAlreadyCreated = await controllerDB.isUserCreated(req.body.username)

            if (userAlreadyCreated == false) {

                if (req.body.typeUser == "N" || req.body.typeUser == "I") {

                    await controllerDB.createUser(req.body)
                    console.log("OK - User created")
                    const ownerId = await controllerDB.obtainUserId(req.body.username, req.body.password)
                    const hasWallet = await controllerDB.userHasWallet(ownerId)

                    if (!hasWallet) {

                        const newWallet = new Wallet(ownerId)
                        controllerDB.createWallet(newWallet)
                        console.log("OK - Wallet Created")
                        res.send("OK - Acount created")

                    } else {
                        console.log("Wallet dont created - Reason: User has a Wallet already")
                        res.send("Wallet dont created - Reason: User has a Wallet already")
                    }

                } else {
                    console.log("User not created dont created - Reason: User role invalid")
                    res.send("User not created dont created - Reason: User role invalid")
                }

            } else {
                console.log("Acount dont created - Reason: Username already is used")
                res.send("Acount dont created - Reason: Username already is used")
            }
    }
}