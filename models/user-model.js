module.exports = (sequelize, DataTypes)=>{
    var User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              len: [1, 255]
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [4, 72]
              }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              len: [1, 255]
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
              len: [3]
            }
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false 
        }
    });
  
    return User;
};