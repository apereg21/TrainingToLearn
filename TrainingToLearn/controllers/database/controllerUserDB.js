const db = require('../../models')

module.exports = {
    async getUsername(userId) {
        return db.Users.findOne({
            where: {
                id: userId
            }
        }).then((result) => {
            if (result != null) {
                return result.username
            } else {
                return null
            }
        })
    },

    async getAllUsers() {
        return db.Users.findAll({ where: { deleted: false } }).then((result) => {
            return result
        })
    },
    async createUser(req) {
        return db.Users.create({
            name: req.name,
            fullSurname: req.fullSurname,
            username: req.username,
            password: req.password,
            typeUser: req.typeUser
        }).then(() => {
            console.log("Created")
        }).catch((val) => {
            console.log("Something go wrong with user creation: " + val);
        });
    },
    async createSystem(req) {
        return db.Users.create({
            name: req.name,
            fullSurname: req.fullSurname,
            username: req.username,
            password: req.password,
            typeUser: req.typeUser
        }).then(() => {
            console.log("Created")
        }).catch((val) => {
            console.log("Something go wrong with user creation: " + val);
        });
    },
    deleteUser(id) {
        db.Users.update({
            deleted: true
        }, {
            where: {
                id: id
            }
        }).then((result) => {
            console.log("OK User with id:" + id + " eliminated")
            db.Wallets.update({
                deleted: true
            }, {
                where: {
                    id: id
                }
            }).then(() => {
                console.log("OK Wallet with id:" + id + " eliminated")

            }).catch((val) => {
                console.log("Error" + val.name);
            });
        }).catch((val) => {
            console.log("Error" + val.name);
        });
    },

    async obtainDeleteField(idObject, opc) {
        if (opc == 0) {
            return db.Users.findOne({
                where: {
                    id: idObject
                }
            }).then((result) => {
                if (result != null) {
                    console.log("Deleted field is: " + result.deleted)
                    return result.deleted
                } else {
                    console.log("Deleted field is: " + false)
                    return false
                }
            })
        } else if (opc == 1) {
            return db.Wallets.findOne({
                where: {
                    id: idObject
                }
            }).then((result) => {
                if (result != null) {
                    console.log("Deleted field is: " + result.deleted)
                    return result.deleted
                } else {
                    console.log("Deleted field is: " + false)
                    return false
                }
            })
        } else if (opc == 2) {
            return db.UniRewards.findOne({
                where: {
                    id: idObject
                }
            }).then((result) => {
                if (result != null) {
                    console.log("Deleted field is: " + result.deleted)
                    return result.deleted
                } else {
                    console.log("Deleted field is: " + false)
                    return false
                }
            })
        }
    },
    async obtainUserPassword(id) {
        return db.Users.findOne({
            where: {
                id: id
            }
        }).then((result) => {
            console.log(result.password)
            return result.password
        })
    },
    async userIdExists(id) {
        return db.Users.findOne({
            where: {
                id: id
            }
        }).then((result) => {
            if (result != null) {
                console.log("User id exists")
                return true
            } else {
                console.log("User id dosent exists")
                return false
            }
        })
    },

    async obtainUserId(usName, usPass) {
        return db.Users.findOne({
            where: {
                username: usName,
                password: usPass
            }
        }).then((result) => {
            if (result != null) {
                console.log("User find it")
                return result.id
            } else {
                console.log("User not find it")
                return null
            }
        })
    },

    async obtainUserType(idUser) {
        return db.Users.findOne({
            where: {
                id: idUser
            }
        }).then((result) => {
            if (result != null) {
                console.log("User find it")
                return result.typeUser
            } else {
                console.log("User not find it")
                return null
            }
        })
    },

    async isUserCreated(usName) {
        return db.Users.findOne({
            where: {
                username: usName
            }
        }).then((result) => {
            if (result != null) {
                console.log("User find it")
                if (result.delete == true) {
                    console.log("User can created")
                    return false
                } else {
                    console.log("User can't created")
                    return true
                }
            } else {
                console.log("User not find it")
                return false
            }
        })
    },
    async isUserDeleted(idUser) {
        if (typeof idUser == 'number') {
            return db.Users.findOne({
                where: {
                    id: idUser
                }
            }).then((result) => {
                if (result.deleted == true) {
                    console.log("User is Deleted")
                    return true
                } else {
                    console.log("User is not Deleted")
                    return false
                }
            })
        } else {
            console.log("idUser isn't a number")
            return null
        }

    },
    async getUserData(idUser) {
        if (typeof idUser == 'number') {
            return db.Users.findOne({
                where: {
                    id: idUser
                }
            }).then((result) => {
                if (result != null) {
                    console.log("User data find it")
                    return result
                } else {
                    console.log("User data not find it")
                    return null
                }
            })
        } else {
            console.log("idUser isn't a number")
            return null
        }
    },

    async getSpecificUserID(usName, usPass) {
        return db.Users.findOne({
            where: {
                username: usName,
                password: usPass
            }
        }).then((result) => {
            if (result != null) {
                console.log("User data find it")
                return result.id
            } else {
                console.log("User data not find it")
                return null
            }
        }).catch((val) => {
            console.log("Error: " + val);
        });
    },

    async modifyUserData(usNameN, usFullSurnameN, usUserNameN, usPasswordN, userId) {
        let user = await this.getUserData(userId)
        if (usPasswordN == "" || usPasswordN == user.password) {
            console.log("User's password don't change")
            usPasswordN = user.password
        }
        if (usUserNameN == "" || usUserNameN == user.username) {
            console.log("User's username don't change")
            usUserNameN = user.username
        }

        if (usFullSurnameN == "" || usFullSurnameN == user.fullSurname) {
            console.log("User's full surname don't change")
            usFullSurnameN = user.fullSurname
        }
        if (usNameN == "" || usNameN == user.name) {
            console.log("User's name don't change")
            usNameN == user.name
        }
        if (usUserNameN != user.username) {
            console.log("Usernames are diferent, can create user")
            console.log(usUserNameN + "" + user.username)
            return db.Users.update({
                name: usNameN,
                fullSurname: usFullSurnameN,
                username: usUserNameN,
                password: usPasswordN,
            }, {
                where: {
                    id: userId
                }
            }).then(() => {
                console.log("User changed")
                return true
            }).catch((val) => {
                console.log("Error: " + val);
            });
        } else {
            console.log("Usernames aren't diferent, can't create user")
            return false
        }
    },
    async getUserID(username) {
        return db.Users.findOne({
            where: {
                username: username
            }
        }).then((result) => {
            if (result != null) {
                console.log("User data find it")
                return result.id
            } else {
                console.log("User data not find it")
                return null
            }
        }).catch((val) => {
            console.log("Error: " + val);
        });
    },
}