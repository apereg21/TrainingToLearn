module.exports = (sequelize, DataTypes) => {
    const UniPoints = sequelize.define('UniPoints', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        timestamp: {
            allowNull: false,
            type: DataTypes.DATE
        },
        alPurchase: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        createdAt: false,
        updatedAt: false
    });
    UniPoints.associate = function(models) {

    };
    return UniPoints;
};