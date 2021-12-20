module.exports = (sequelize, DataTypes) => {
    const Wallets = sequelize.define('Wallets', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        publicKey: {
            allowNull: false,
            type: DataTypes.STRING
        },
        privateKey: {
            allowNull: false,
            type: DataTypes.STRING
        },
        money: {
            allowNull: true,
            type: DataTypes.INTEGER,
            defaultValue: 0,

        },
        idsUniRewards: {
            allowNull: false,
            type: DataTypes.JSON,
            defaultValue: []
        },
        deleted: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        createdAt: false,
        updatedAt: false
    });
    Wallets.associate = function(models) {
        Wallets.hasMany(models.UniRewards, { onDelete: 'cascade' })
    };
    return Wallets;
};