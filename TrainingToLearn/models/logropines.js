module.exports = (sequelize, DataTypes) => {
    const Logropines = sequelize.define('Logropines', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        nameLP: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        addressLP: {
            allowNull: false,
            type: DataTypes.STRING,
        },
    }, {});
    Logropines.associate = function(models) {

    };
    return Logropines;
};