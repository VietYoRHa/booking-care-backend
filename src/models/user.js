"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.belongsTo(models.Allcode, {
                foreignKey: "positionId",
                targetKey: "keyMap",
                as: "positionData",
            });
            User.belongsTo(models.Allcode, {
                foreignKey: "gender",
                targetKey: "keyMap",
                as: "genderData",
            });
            User.hasOne(models.Doctor_Info, {
                foreignKey: "doctorId",
            });
            User.hasOne(models.Doctor_Clinic_Specialty, {
                foreignKey: "doctorId",
            });
            User.hasMany(models.Schedule, {
                foreignKey: "doctorId",
                as: "doctorData",
            });
            User.hasMany(models.Appointment, {
                foreignKey: "patientId",
                as: "patientData",
            });
        }
    }
    User.init(
        {
            email: DataTypes.STRING,
            password: DataTypes.STRING,
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            address: DataTypes.STRING,
            phoneNumber: DataTypes.STRING,
            gender: DataTypes.STRING,
            image: DataTypes.BLOB("long"),
            roleId: DataTypes.STRING,
            positionId: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "User",
        }
    );
    return User;
};
