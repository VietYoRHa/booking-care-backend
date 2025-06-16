"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Appointment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Appointment.belongsTo(models.User, {
                foreignKey: "patientId",
                targetKey: "id",
                as: "patientData",
            });
            Appointment.belongsTo(models.Allcode, {
                foreignKey: "timeType",
                targetKey: "keyMap",
                as: "patientTimeTypeData",
            });
        }
    }
    Appointment.init(
        {
            statusId: DataTypes.STRING,
            doctorId: DataTypes.INTEGER,
            patientId: DataTypes.INTEGER,
            date: DataTypes.STRING,
            timeType: DataTypes.STRING,
            reason: DataTypes.STRING,
            token: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "Appointment",
        }
    );
    return Appointment;
};
