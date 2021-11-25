module.exports = (sequelize, DataTypes) => {
    const Usuarios = sequelize.define('Usuarios', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        fullSurname: {
            allowNull: false,
            type: DataTypes.STRING
        },
        username: {
            allowNull: false,
            type: DataTypes.STRING
        },
        password: {
            allowNull: false,
            type: DataTypes.STRING
        }
    }, {
        createdAt: false,
        updatedAt: false
    });
    Usuarios.associate = function(models) {
        Usuarios.hasOne(models.Monederos);
        Usuarios.hasOne(models.Logropines);
    };
    return Usuarios;
};