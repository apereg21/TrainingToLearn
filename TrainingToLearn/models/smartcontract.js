module.exports = (sequelize, DataTypes) => {
    const SmartContract = sequelize.define('SmartContract', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        walletIdObserver: {
            allowNull: false,
            type: DataTypes.STRING
        },
        walletIdDemander: {
            allowNull: false,
            type: DataTypes.STRING
        },
        signatureObserver: {
            allowNull: true,
            type: DataTypes.STRING
        },
        signatureDemander: {
            allowNull: true,
            type: DataTypes.STRING
        },
        state: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        condition: {
            allowNull: false,
            type: DataTypes.JSON,
            defaultValue: []
        },
        deliveredUniPoints: {
            allowNull: true,
            type: DataTypes.JSON,
            defaultValue: []
        }
    }, {});
    SmartContract.associate = function(models) {

    };
    return SmartContract;
};