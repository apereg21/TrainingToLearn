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
        typeTransaction: {
            allowNull: false,
            type: DataTypes.STRING
        },
        signature: {
            allowNull: false,
            type: DataTypes.STRING
        },
        money: {
            allowNull: true,
            type: DataTypes.INTEGER
        }
    }, {
        createdAt: false,
        updatedAt: false
    });
    Transactions.associate = function(models) {

    };
    return Transactions;
};