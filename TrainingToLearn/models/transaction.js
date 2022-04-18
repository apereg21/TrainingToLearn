module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define('Transactions', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        fromAddress: {
            allowNull: false,
            type: DataTypes.STRING
        },
        toAddress: {
            allowNull: false,
            type: DataTypes.STRING
        },
        concept: {
            allowNull: false,
            type: DataTypes.STRING
        },
        typeTransaction: {
            allowNull: false,
            type: DataTypes.STRING
        },
        signature: {
            allowNull: false,
            type: DataTypes.STRING
        },
        money: {
            type: DataTypes.INTEGER
        },
        uniPointIds: {
            allowNull: true,
            type: DataTypes.JSON,
            defaultValue: []
        },
        idWalletFrom: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        idWalletTo: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        hash: {
            allowNull: true,
            type: DataTypes.STRING
        }
    }, {
        createdAt: false,
        updatedAt: false
    });
    Transactions.associate = function(models) {

    };
    return Transactions;
};