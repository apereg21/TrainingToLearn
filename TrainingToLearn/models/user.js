module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('Users', {
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
    Users.associate = function(models) {
        Users.hasOne(models.Wallets, { onDelete: 'cascade' });
        Users.hasMany(models.UniRewards, { onDelete: 'cascade' });
    };
    return Users;
};