module.exports = (sequelize, DataTypes) => {
    const UniRewards = sequelize.define('UniRewards', {
        id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER,
        },
        nameUR: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        descriptionUR: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        imageUR: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        cost: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        moneyExp: {
            allowNull: true,
            type: DataTypes.JSON,
            defaultValue: []
        },
        purchase: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        hash: {
            allowNull: true,
            type: DataTypes.STRING
        }
    }, {});
    UniRewards.associate = function(models) {
        UniRewards.hasMany(models.Transactions, { onDelete: 'cascade' })
        UniRewards.hasMany(models.UniPoints, { onDelete: 'cascade' })
        UniRewards.hasOne(models.SmartContract, { onDelete: 'cascade' })
    };
    return UniRewards;
};