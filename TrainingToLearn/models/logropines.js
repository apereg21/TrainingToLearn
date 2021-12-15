module.exports = (sequelize, DataTypes) => {
    const Logropines = sequelize.define('Logropines', {
        id: {
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
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
        },
        deleted: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {});
    Logropines.associate = function(models) {
        Logropines.hasMany(models.Transactions, { onDelete: 'cascade' })
    };
    return Logropines;
};