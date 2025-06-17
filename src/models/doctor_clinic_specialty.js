"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Doctor_Clinic_Specialty extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Doctor_Clinic_Specialty.belongsTo(models.User, {
                foreignKey: "doctorId",
            });
            Doctor_Clinic_Specialty.belongsTo(models.Allcode, {
                foreignKey: "priceId",
                targetKey: "keyMap",
                as: "priceTypeData",
            });
            Doctor_Clinic_Specialty.belongsTo(models.Allcode, {
                foreignKey: "provinceId",
                targetKey: "keyMap",
                as: "provinceTypeData",
            });
            Doctor_Clinic_Specialty.belongsTo(models.Allcode, {
                foreignKey: "paymentId",
                targetKey: "keyMap",
                as: "paymentTypeData",
            });
            Doctor_Clinic_Specialty.belongsTo(models.Clinic, {
                foreignKey: "clinicId",
                targetKey: "id",
                as: "clinicData",
            });
        }
    }
    Doctor_Clinic_Specialty.init(
        {
            doctorId: DataTypes.INTEGER,
            specialtyId: DataTypes.INTEGER,
            clinicId: DataTypes.INTEGER,
            priceId: DataTypes.STRING,
            provinceId: DataTypes.STRING,
            paymentId: DataTypes.STRING,
            note: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "Doctor_Clinic_Specialty",
            freezeTableName: true,
        }
    );
    return Doctor_Clinic_Specialty;
};
