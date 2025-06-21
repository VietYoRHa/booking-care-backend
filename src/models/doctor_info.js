"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Doctor_Info extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Doctor_Info.belongsTo(models.User, {
                foreignKey: "doctorId",
            });
        }
    }
    Doctor_Info.init(
        {
            doctorId: DataTypes.INTEGER,
            contentHTML: DataTypes.TEXT("long"),
            contentMarkdown: DataTypes.TEXT("long"),
            description: DataTypes.TEXT("long"),
            appointmentCount: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "Doctor_Info",
            freezeTableName: true,
        }
    );
    return Doctor_Info;
};
