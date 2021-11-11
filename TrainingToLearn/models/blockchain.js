module.exports = (sequelize, DataTypes) => {
    const Blockchain = sequelize.define('Blockchain', {
        index: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        timestamp: {
            allowNull: false,
            type: DataTypes.DATE
        },
        logroPin: {
            allowNull: null,
            type: DataTypes.JSON
        },
        data: {
            allowNull: true,
            type: DataTypes.STRING
        },
        hash: {
            allowNull: false,
            type: DataTypes.STRING
        },
        hashPrev: {
            allowNull: false,
            type: DataTypes.STRING
        },

    }, {
        createdAt: false,
        updatedAt: false
    });
    Blockchain.associate = function(models) {

    };
    return Blockchain;
};