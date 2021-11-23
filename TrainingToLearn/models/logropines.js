module.exports = (sequelize, DataTypes) => {
    const Logropines = sequelize.define('Logropines', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        nameLP: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        descriptionLP: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        imageLP: {
            allowNull: true,
            type: DataTypes.STRING,
        }
    }, {});
    Logropines.associate = function(models) {
        Logropines.hasMany(models.Transactions)
    };
    return Logropines;
};