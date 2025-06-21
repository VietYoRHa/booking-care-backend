import db from "../models/index";
require("dotenv").config();
import _ from "lodash";

let getTopDoctorHome = (limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                limit: limit,
                order: [["createdAt", "DESC"]],
                where: { roleId: "R2" },
                attributes: {
                    exclude: ["password"],
                },
                include: [
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
                raw: true,
                nest: true,
            });
            if (doctors && doctors.length > 0) {
                doctors = doctors.map((item) => {
                    item.image = Buffer.from(item.image, "base64").toString(
                        "binary"
                    );
                    return item;
                });
            }
            resolve({
                errCode: 0,
                data: doctors,
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: { roleId: "R2" },
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
                raw: true,
                nest: true,
            });

            if (doctors && doctors.length > 0) {
                doctors = doctors.map((item) => {
                    item.image = Buffer.from(item.image, "base64").toString(
                        "binary"
                    );
                    return item;
                });
            }
            resolve({
                errCode: 0,
                data: doctors,
            });
        } catch (error) {
            reject(error);
        }
    });
};

let checkRequiredFields = (data) => {
    let fields = [
        "doctorId",
        "contentHTML",
        "contentMarkdown",
        "action",
        "selectedPrice",
        "selectedPayment",
        "selectedProvince",
        "selectedSpecialty",
    ];
    let isValid = true;
    let missingField = "";
    for (let field of fields) {
        if (!data[field]) {
            isValid = false;
            missingField = field;
            break;
        }
    }
    return {
        isValid: isValid,
        missingField: missingField,
    };
};

let saveDetailInfoDoctor = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let checkFields = checkRequiredFields(data);
            if (checkFields.isValid === false) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing parameter: ${checkFields.missingField}`,
                });
            } else {
                // Upsert Doctor_Info table
                if (data.action === "CREATE") {
                    await db.Doctor_Info.create({
                        contentHTML: data.contentHTML,
                        contentMarkdown: data.contentMarkdown,
                        doctorId: data.doctorId,
                        description: data.description,
                        appointmentCount: 0,
                    });
                } else if (data.action === "EDIT") {
                    let doctorMarkdown = await db.Doctor_Info.findOne({
                        where: { doctorId: data.doctorId },
                        raw: false,
                    });
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = data.contentHTML;
                        doctorMarkdown.contentMarkdown = data.contentMarkdown;
                        doctorMarkdown.description = data.description;
                        await doctorMarkdown.save();
                    }
                }

                // Upsert Doctor_Clinic_Specialty table
                let doctorInfo = await db.Doctor_Clinic_Specialty.findOne({
                    where: { doctorId: data.doctorId },
                    raw: false,
                });
                if (doctorInfo) {
                    // Update existing record
                    doctorInfo.doctorId = data.doctorId;
                    doctorInfo.specialtyId = data.selectedSpecialty;
                    doctorInfo.clinicId = data.selectedClinic;
                    doctorInfo.priceId = data.selectedPrice;
                    doctorInfo.paymentId = data.selectedPayment;
                    doctorInfo.provinceId = data.selectedProvince;
                    doctorInfo.note = data.note;
                    await doctorInfo.save();
                } else {
                    // Create new record
                    await db.Doctor_Clinic_Specialty.create({
                        doctorId: data.doctorId,
                        specialtyId: data.selectedSpecialty,
                        clinicId: data.selectedClinic,
                        priceId: data.selectedPrice,
                        paymentId: data.selectedPayment,
                        provinceId: data.selectedProvince,
                        note: data.note,
                    });
                }

                resolve({
                    errCode: 0,
                    errMessage: "Save info succeed",
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getDetailDoctorById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            } else {
                let data = await db.User.findOne({
                    where: { id: id },
                    attributes: {
                        exclude: ["password"],
                    },
                    include: [
                        {
                            model: db.Doctor_Info,
                            attributes: [
                                "description",
                                "contentHTML",
                                "contentMarkdown",
                            ],
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
                        {
                            model: db.Doctor_Clinic_Specialty,
                            attributes: {
                                exclude: [
                                    "id",
                                    "doctorId",
                                    "createdAt",
                                    "updatedAt",
                                ],
                            },
                            include: [
                                {
                                    model: db.Allcode,
                                    as: "priceTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                                {
                                    model: db.Allcode,
                                    as: "provinceTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                                {
                                    model: db.Allcode,
                                    as: "paymentTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                            ],
                        },
                    ],
                    raw: false,
                    nest: true,
                });

                if (data && data.image) {
                    data.image = Buffer.from(data.image, "base64").toString(
                        "binary"
                    );
                }

                if (!data) {
                    data = {};
                }

                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getExtraDoctorInfoById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            } else {
                let data = await db.Doctor_Clinic_Specialty.findOne({
                    where: { doctorId: id },
                    attributes: {
                        exclude: ["id", "doctorId", "createdAt", "updatedAt"],
                    },
                    include: [
                        {
                            model: db.Allcode,
                            as: "priceTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.Allcode,
                            as: "paymentTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.Clinic,
                            as: "clinicData",
                            attributes: ["name", "address"],
                        },
                    ],

                    raw: false,
                    nest: true,
                });

                if (!data) {
                    data = {};
                }

                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getProfileDoctorById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            } else {
                let data = await db.User.findOne({
                    where: { id: id },
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
                            model: db.Doctor_Clinic_Specialty,
                            attributes: {
                                exclude: [
                                    "id",
                                    "doctorId",
                                    "createdAt",
                                    "updatedAt",
                                ],
                            },
                            include: [
                                {
                                    model: db.Allcode,
                                    as: "priceTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                                {
                                    model: db.Allcode,
                                    as: "provinceTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                                {
                                    model: db.Allcode,
                                    as: "paymentTypeData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                            ],
                        },
                    ],
                    raw: false,
                    nest: true,
                });

                if (data && data.image) {
                    data.image = Buffer.from(data.image, "base64").toString(
                        "binary"
                    );
                }

                if (!data) {
                    data = {};
                }

                resolve({
                    errCode: 0,
                    data: data,
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let createSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            } else {
                let schedule = data.arrSchedule;

                // Check if the doctor exists
                let existing = await db.Schedule.findAll({
                    where: {
                        doctorId: data.doctorId,
                        date: data.date,
                    },
                    attributes: ["id", "date", "timeType", "doctorId"],
                    raw: true,
                });

                // If schedule is not provided, delete all existing schedules for the doctor on that date
                if (data.arrSchedule.length === 0) {
                    await db.Schedule.destroy({
                        where: {
                            doctorId: data.doctorId,
                            date: data.date,
                        },
                        force: true,
                    });
                    resolve({
                        errCode: 0,
                        errMessage: "OK",
                    });
                    return;
                }

                // Find schedules that need to be created
                let toCreate = _.differenceWith(
                    schedule,
                    existing,
                    (a, b) => a.timeType === b.timeType && +a.date === +b.date
                );

                // Find schedules that need to be deleted
                let toDelete = _.differenceWith(
                    existing,
                    schedule,
                    (a, b) => a.timeType === b.timeType && +a.date === +b.date
                );

                if (toDelete && toDelete.length > 0) {
                    let idsToDelete = toDelete.map((item) => item.id);
                    await db.Schedule.destroy({
                        where: { id: idsToDelete },
                        force: true,
                    });
                }

                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate);
                }

                resolve({
                    errCode: 0,
                    errMessage: "OK",
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getScheduleDoctorByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: { doctorId: doctorId, date: date },
                    include: [
                        {
                            model: db.Allcode,
                            as: "timeTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                        {
                            model: db.User,
                            as: "doctorData",
                            attributes: ["firstName", "lastName"],
                        },
                    ],
                    raw: false,
                    nest: true,
                });

                if (!dataSchedule) {
                    dataSchedule = [];
                }

                resolve({
                    errCode: 0,
                    data: dataSchedule,
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getListPatientForDoctor = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing parameter",
                });
            } else {
                let data = await db.Appointment.findAll({
                    where: { statusId: "S2", doctorId: doctorId, date: date },
                    attributes: {
                        exclude: ["token", "createdAt", "updatedAt"],
                    },
                    include: [
                        {
                            model: db.User,
                            as: "patientData",
                            attributes: [
                                "email",
                                "firstName",
                                "lastName",
                                "phoneNumber",
                                "address",
                                "gender",
                            ],
                            include: [
                                {
                                    model: db.Allcode,
                                    as: "genderData",
                                    attributes: ["valueEn", "valueVi"],
                                },
                            ],
                        },
                        {
                            model: db.Allcode,
                            as: "patientTimeTypeData",
                            attributes: ["valueEn", "valueVi"],
                        },
                    ],
                    raw: false,
                    nest: true,
                });

                if (!data) {
                    data = [];
                }

                resolve({
                    errCode: 0,
                    errMessage: "OK",
                    data: data,
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    getTopDoctorHome: getTopDoctorHome,
    getAllDoctors: getAllDoctors,
    saveDetailInfoDoctor: saveDetailInfoDoctor,
    getDetailDoctorById: getDetailDoctorById,
    getExtraDoctorInfoById: getExtraDoctorInfoById,
    getProfileDoctorById: getProfileDoctorById,
    createSchedule: createSchedule,
    getScheduleDoctorByDate: getScheduleDoctorByDate,
    getListPatientForDoctor: getListPatientForDoctor,
};
