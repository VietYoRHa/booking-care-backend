"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert("Users", [
            {
                email: "admin1@gmail.com",
                password:
                    "$2a$10$p5jjfAvR0ECtgxnRDWrs6O/.249JF35VjAz73oFT3PHRIvQb2fWP2",
                firstName: "Admin",
                lastName: "VitaBook",
                address: "Việt Nam",
                phoneNumber: "0123456789",
                gender: "M",
                roleId: "R1",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete("Users", null, {});
    },
};
