const controllerDB = require('../controllerDatabase');
const Wallet = require('../../wallet');

module.exports = {
    async modifyUserData(req, res) {
        const userID = await controllerDB.obtainUserId(req.body.username, req.body.password)

        if (userID != null) {

            let counterErrors = 0

            for (let i = 0; i < req.body.changes.length; i++) {

                switch (req.body.changes[i]) {
                    case "p":
                        if (proveKey('passwordN', 'string', req.body) == false) {
                            counterErrors++
                        }
                        break;
                    case "u":
                        if (proveKey('usernameN', 'string', req.body) == false) {
                            counterErrors++
                        }
                        break;
                    case "f":
                        if (proveKey('fullSurnameN', 'string', req.body) == false) {
                            counterErrors++
                        }
                        break;
                    case "n":
                        if (proveKey('nameN', 'string', req.body) == false) {
                            counterErrors++
                        }
                        break;
                    default:
                        counterErrors++
                }
            }

            if (counterErrors == 0) {

                return await controllerDB.modifyUserData(req.body.nameN, req.body.fullSurnameN, req.body.usernameN, req.body.passwordN, userID)

            }
        } else {

            console.log("User data dont change - Reason: Username or password ins't correct")
            res.send("User data dont change - Reason: Username or password ins't correct")

        }
    },
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
    async createNewUser(req, res) {
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