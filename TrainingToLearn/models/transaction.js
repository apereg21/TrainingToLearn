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
        amount: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        signature: {
            allowNull: false,
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