const Wallet = require('../../wallet');
const controllerUserDB = require("../database/controllerUserDB");
const controllerWalletDB = require("../database/controllerWalletDB");
var exportsC = require('../../exportsClass')
module.exports = {
    async modifyUserData(req, res) {
        const userID = await controllerUserDB.obtainUserId(req.body.username, req.body.password)

        if (userID != null && typeof userID != 'string') {

            const userData = await controllerUserDB.getUserData(userID)
            if (!userData.deleted) {
                let counterErrors = 0

                for (let i = 0; i < req.body.changes.length; i++) {

                    switch (req.body.changes[i]) {
                        case "p":
                            if (exportsC.proveKey('passwordN', 'string', req.body) == false) {
                                counterErrors++
                            }
                            break;
                        case "u":
                            if (exportsC.proveKey('usernameN', 'string', req.body) == false) {
                                counterErrors++
                            }
                            break;
                        case "f":
                            if (exportsC.proveKey('fullSurnameN', 'string', req.body) == false) {
                                counterErrors++
                            }
                            break;
                        case "n":
                            if (exportsC.proveKey('nameN', 'string', req.body) == false) {
                                counterErrors++
                            }
                            break;
                        default:
                            counterErrors++
                    }
                }

                if (counterErrors == 0) {

                    return await controllerUserDB.modifyUserData(req.body.nameN, req.body.fullSurnameN, req.body.usernameN, req.body.passwordN, userID, req.body.changes, res)

                } else {
                    console.log("User data dont change - Reason: Data to change are not correct")
                    res.send("User data dont change - Reason: Data to change are not correct")
                }
            } else {

                console.log("User data dont change - Reason: Username or password ins't correct")
                res.send("User data dont change - Reason: Username or password ins't correct")

            }

        } else {
            if (typeof userID == "string") {
                return "error"
            } else {
                return false
            }



        }
    },
    async deleteUser(req, res) {
        var user = await controllerUserDB.getUserData(req.body.id)
        if (user != null) {
            if (!user.deleted) {
                controllerUserDB.deleteUser(user.id)
                console.log("OK - " + user.username + "'s data eliminated")
                res.send(user.username)
            } else {
                console.log(user.username + "'s data can't be eliminated - Reason: Already deleted")
                res.send(user.username + "'s data can't be eliminated - Reason: Already deleted")
            }

        } else {
            if (user == null) {
                console.log("You need to fill the DB to continue working. You can do it manually typing localhost:3000/maintenance/restoreDB")
                res.send("User data don't loaded - Reason: The database isn't correct, try to restore DB")
            } else {
                console.log(user.username + "'s data can't be eliminated - Reason: User Not Exist")
                res.send(user.username + "'s data can't be eliminated - Reason: User Not Exist")
            }

        }
    },
    async createNewUser(req, res) {
        let userAlreadyCreated = await controllerUserDB.isUserCreated(req.body.username)

        if (userAlreadyCreated == false) {

            if (req.body.typeUser == "N" || req.body.typeUser == "I") {

                await controllerUserDB.createUser(req.body)
                console.log("OK - User created")
                const ownerId = await controllerUserDB.obtainUserId(req.body.username, req.body.password)
                const hasWallet = await controllerWalletDB.userHasWallet(ownerId)

                const newWallet = new Wallet(ownerId)
                controllerWalletDB.createWallet(newWallet)
                console.log("OK - Wallet Created")
                res.send("OK - Acount created")

            } else {
                console.log("User not created dont created - Reason: User role invalid")
                res.send("User not created dont created - Reason: User role invalid")
            }

        } else {
            if (userAlreadyCreated != true) {
                console.log("Can't login - Reason: The database isn't correct, try to restore DB")
                res.send("Can't login - Reason: The database isn't correct, try to restore DB")
            } else {
                console.log("Acount dont created - Reason: Username already is used")
                res.send("Acount dont created - Reason: Username already is used")
            }

        }
    }
}