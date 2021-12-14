module.exports = (sequelize, DataTypes) => {
    const Monederos = sequelize.define('Monederos', {
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
        idsLogroPins: {
            allowNull: false,
            type: DataTypes.JSON,
            defaultValue: []
        }
    }, {
        createdAt: false,
        updatedAt: false
    });
    Monederos.associate = function(models) {
        Monederos.hasMany(models.Logropines, { onDelete: 'cascade' })
    };
    return Monederos;
};