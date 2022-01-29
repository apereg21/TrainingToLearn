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
            allowNull: true,
            type: DataTypes.STRING,
        },
        imageUR: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        moneyExp: {
            allowNull: false,
            type: DataTypes.JSON,
            defaultValue: []
        }
    }, {});
    UniRewards.associate = function(models) {
        UniRewards.hasMany(models.Transactions, { onDelete: 'cascade' })
    };
    return UniRewards;
};