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
    }, {
        createdAt: false,
        updatedAt: false
    });
    UniPoints.associate = function(models) {

    };
    return UniPoints;
};