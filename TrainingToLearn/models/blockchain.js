module.exports = (sequelize, DataTypes) => {
    const Blockchain = sequelize.define('Blockchain', {
        index: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        timestamp: {
            allowNull: false,
            type: DataTypes.DATE
        },
        uniReward: {
            allowNull: null,
            type: DataTypes.JSON
        },
        data: {
            allowNull: true,
            type: DataTypes.JSON
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