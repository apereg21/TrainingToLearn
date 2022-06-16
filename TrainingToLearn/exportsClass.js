let flag;

const setFlag = (newFlag) => flag = newFlag;

const getFlag = () => flag;

const proveKey = (nameKey, variableType, reqJson) => {

    var objJson = Object(reqJson)
    let isKeyExist = objJson.hasOwnProperty(nameKey)
    console.log("Prove the key: " + nameKey)
    console.log("Is this key in json request body? " + isKeyExist)

    if (isKeyExist) {

        console.log("Is this key with the correct type? " + isKeyExist)
        console.log(typeof reqJson[nameKey] + " = " + variableType)

        if (typeof reqJson[nameKey] == variableType) {

            if (typeof reqJson[nameKey] == 'string') {

                var isCorrect = proveNormalString(reqJson[nameKey], nameKey)

                if (reqJson[nameKey].length > 0 && isCorrect == true) {
                    console.log("Correct Type - Can continue\n")
                    return true
                } else {

                    if (reqJson[nameKey].length <= 0) {
                        console.log("Incorrect Type - Reason: Length of " + nameKey + "\n")
                        return false
                    } else {
                        console.log("Incorrect Type - Reason: The structure of string, ins't correct\n")
                        return false
                    }
                }
            } else {

                if (typeof reqJson[nameKey] == 'number') {

                    if (reqJson[nameKey] >= 0) {
                        if(!(reqJson[nameKey] > 10000 )){
                            console.log("Correct Type - Can continue\n")
                            return true
                        }else{
                            console.log("Incorrect Type - Reason: The structure of number, it's a high value\n")
                            return false
                        }
                    } else {
                        console.log("Incorrect Type - Reason: The structure of number, ins't correct. Positive values\n")
                        return false
                    }
                } else {
                    console.log("Correct Type - Can continue\n")
                    return true
                }
            }
        } else {
            console.log("Incorrect Type - Reason: Not correct type for key: " + nameKey + " \n")
            return false
        }
    } else {
        console.log("Incorrect Type - Reason: Not exist key\n")
        return false
    }
}

const proveNormalString = (string, nameKey) => {
    console.log("Prove " + nameKey + " : " + string + " with regular expresion")
    if (nameKey == "password" || nameKey == "passwordN") {
        return true
    } else {
        var cadena = string;
        var result = !/^\s|^\d/.test(cadena);
        return result
    }
}

module.exports = {
    setFlag,
    getFlag,
    proveKey, 
    proveNormalString
}