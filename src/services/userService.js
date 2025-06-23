import db from "../models/index";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { createJWT } from "../middleware/authMiddleware";
import { APPOINTMENT_STATUS, USER_ROLES } from "../constants/constant";

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    });
};

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};
            let isExist = await checkUserEmail(email);
            if (isExist) {
                // User already exists
                let user = await db.User.findOne({
                    attributes: [
                        "id",
                        "email",
                        "roleId",
                        "password",
                        "firstName",
                        "lastName",
                    ],
                    where: { email: email },
                    raw: true,
                });
                if (user) {
                    // Check password
                    let check = await bcrypt.compareSync(
                        password,
                        user.password
                    );
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = "Login successfully";
                        const payload = {
                            id: user.id,
                            email: user.email,
                            roleId: user.roleId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        };

                        const token = createJWT(payload);
                        delete user.password;
                        userData.user = {
                            ...user,
                            accessToken: token,
                        };
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = "Wrong password";
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = "User not found";
                }
            } else {
                userData.errCode = 1;
                userData.errMessage = "Email does not exist";
            }
            resolve(userData);
        } catch (error) {
            reject(error);
        }
    });
};

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail },
            });
            if (user) {
                resolve(true);
            } else {
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = "";
            if (userId === "ALL") {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ["password"],
                    },
                });
            }
            if (userId && userId !== "ALL") {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ["password"],
                    },
                });
            }

            if (users && users.length > 0) {
                users = users.map((item) => {
                    if (item.image) {
                        item.image = Buffer.from(item.image, "base64").toString(
                            "binary"
                        );
                    }
                    return item;
                });
            }
            resolve(users);
        } catch (error) {
            reject(error);
        }
    });
};

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Check email is existed
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage:
                        "Email is already in used. Please try another email!",
                });
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(
                    data.password
                );
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phoneNumber: data.phoneNumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar,
                });
                resolve({
                    errCode: 0,
                    message: "OK",
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let foundUser = await db.User.findOne({
                where: {
                    id: userId,
                },
                raw: false,
            });
            if (!foundUser) {
                resolve({
                    errCode: 2,
                    errMessage: "User is not existed!",
                });
                return;
            }

            if (foundUser.roleId === USER_ROLES.DOCTOR) {
                const hasConfirmedAppointments = await db.Appointment.findOne({
                    where: {
                        doctorId: userId,
                        statusId: APPOINTMENT_STATUS.CONFIRMED,
                    },
                    attributes: ["id"],
                });

                if (hasConfirmedAppointments) {
                    resolve({
                        errCode: 3,
                        errMessage:
                            "Cannot delete doctor with confirmed appointments!",
                    });
                    return;
                }

                const hasPendingAppointments = await db.Appointment.findOne({
                    where: {
                        doctorId: userId,
                        statusId: APPOINTMENT_STATUS.NEW,
                    },
                    attributes: ["id"],
                });

                if (hasPendingAppointments) {
                    resolve({
                        errCode: 4,
                        errMessage:
                            "Cannot delete doctor with pending appointments!",
                    });
                    return;
                }

                await db.Doctor_Clinic_Specialty.destroy({
                    where: {
                        doctorId: userId,
                    },
                });

                await db.Doctor_Info.destroy({
                    where: {
                        doctorId: userId,
                    },
                });

                await db.Schedule.destroy({
                    where: {
                        doctorId: userId,
                    },
                });

                await db.Appointment.update(
                    {
                        doctorId: null,
                        updatedAt: new Date(),
                    },
                    {
                        where: {
                            doctorId: userId,
                            statusId: [
                                APPOINTMENT_STATUS.DONE,
                                APPOINTMENT_STATUS.CANCEL,
                            ],
                        },
                    }
                );
            }

            await foundUser.destroy();

            resolve({
                errCode: 0,
                errMessage: "User is deleted successfully!",
            });
        } catch (error) {
            reject(error);
        }
    });
};

let updateUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.roleId || !data.gender) {
                resolve({
                    errCode: 2,
                    errMessage: "Missing required parameter!",
                });
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false,
            });
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phoneNumber = data.phoneNumber;
                if (data.avatar) {
                    user.image = data.avatar;
                }
                await user.save();

                resolve({
                    errCode: 0,
                    message: "Update user successfully!",
                });
            } else {
                resolve({
                    errCode: 1,
                    errMessage: "User not found!",
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getAllCodeService = (typeInput) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter!",
                });
            } else {
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: { type: typeInput },
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    });
};

let search = (keyword) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!keyword) {
                resolve({
                    errCode: 1,
                    message: "Missing keyword parameter",
                    doctors: [],
                    specialties: [],
                    clinics: [],
                });
            } else {
                let doctors = await db.User.findAll({
                    where: {
                        roleId: "R2",
                        [Op.or]: [
                            { firstName: { [Op.like]: `%${keyword}%` } },
                            { lastName: { [Op.like]: `%${keyword}%` } },
                        ],
                    },
                    attributes: {
                        exclude: ["password"],
                    },
                    include: [
                        {
                            model: db.Doctor_Info,
                            attributes: ["description"],
                        },
                        {
                            model: db.Allcode,
                            as: "positionData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.Allcode,
                            as: "genderData",
                            attributes: ["valueEn", "valueVi"],
                        },
                    ],
                    raw: false,
                    nest: true,
                });

                if (doctors && doctors.length > 0) {
                    doctors = doctors.map((item) => {
                        if (item.image) {
                            item.image = Buffer.from(
                                item.image,
                                "base64"
                            ).toString("binary");
                        }
                        return item;
                    });
                }

                let specialties = await db.Specialty.findAll({
                    where: {
                        name: { [Op.like]: `%${keyword}%` },
                    },
                });
                if (specialties && specialties.length > 0) {
                    specialties = specialties.map((item) => {
                        if (item.image) {
                            item.image = Buffer.from(
                                item.image,
                                "base64"
                            ).toString("binary");
                        }
                        return item;
                    });
                }

                let clinics = await db.Clinic.findAll({
                    where: {
                        [Op.or]: [
                            { name: { [Op.like]: `%${keyword}%` } },
                            { address: { [Op.like]: `%${keyword}%` } },
                        ],
                    },
                });
                if (clinics && clinics.length > 0) {
                    clinics = clinics.map((item) => {
                        if (item.image) {
                            item.image = Buffer.from(
                                item.image,
                                "base64"
                            ).toString("binary");
                        }
                        return item;
                    });
                }
                resolve({
                    errCode: 0,
                    message: "OK",
                    doctors,
                    specialties,
                    clinics,
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUser: updateUser,
    getAllCodeService: getAllCodeService,
    search: search,
};
