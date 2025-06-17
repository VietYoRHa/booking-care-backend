"use strict";
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("doctor_info", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            doctorId: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            contentHTML: {
                type: Sequelize.TEXT("long"),
                allowNull: false,
            },
            contentMarkdown: {
                type: Sequelize.TEXT("long"),
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT("long"),
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("doctor_info");
    },
};
