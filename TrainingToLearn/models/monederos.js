module.exports = (sequelize, DataTypes) => {
    const Monederos = sequelize.define('Monederos', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        address: {
            allowNull: false,
            type: DataTypes.STRING
        },
        money: {
            allowNull: true,
            type: DataTypes.INTEGER,
            defaultValue: 0,

        },
        idsLogroPines: {
            allowNull: true,
            type: DataTypes.STRING
        }
    }, {});
    Monederos.associate = function(models) {
        Monederos.hasMany(models.Logropines)
    };
    return Monederos;
};