import db from "../models/index";

let createNewSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !data.name ||
                !data.imageBase64 ||
                !data.descriptionHTML ||
                !data.descriptionMarkdown
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            } else {
                await db.Specialty.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                });
                resolve({
                    errCode: 0,
                    errMessage: "Create specialty successfully",
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let editSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !data.id ||
                !data.name ||
                !data.imageBase64 ||
                !data.descriptionHTML ||
                !data.descriptionMarkdown
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            } else {
                let specialty = await db.Specialty.findOne({
                    where: { id: data.id },
                    raw: false,
                });

                if (specialty) {
                    specialty.name = data.name;
                    specialty.image = data.imageBase64;
                    specialty.descriptionHTML = data.descriptionHTML;
                    specialty.descriptionMarkdown = data.descriptionMarkdown;
                    await specialty.save();

                    resolve({
                        errCode: 0,
                        errMessage: "Update specialty successfully",
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Specialty not found",
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

let deleteSpecialty = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameter",
                });
                return;
            }
            let specialty = await db.Specialty.findOne({
                where: { id: id },
                raw: false,
            });

            if (!specialty) {
                resolve({
                    errCode: 2,
                    errMessage: "Specialty not found",
                });
                return;
            }

            const hasLinkedDoctors = await db.Doctor_Clinic_Specialty.findOne({
                where: { specialtyId: id },
                attributes: ["id"],
            });

            if (hasLinkedDoctors) {
                resolve({
                    errCode: 3,
                    errMessage:
                        "Cannot delete specialty that has linked doctors!",
                });
                return;
            }
            await specialty.destroy();

            resolve({
                errCode: 0,
                errMessage: "Specialty deleted successfully",
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getAllSpecialty = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Specialty.findAll({
                attributes: {
                    exclude: ["createdAt", "updatedAt"],
                },
            });
            if (data && data.length > 0) {
                data = data.map((item) => {
                    item.image = Buffer.from(item.image, "base64").toString(
                        "binary"
                    );
                    return item;
                });
            }
            resolve({
                errCode: 0,
                errMessage: "OK",
                data: data,
            });
        } catch (error) {
            reject(error);
        }
    });
};

let getDetailSpecialtyById = (id, location) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id || !location) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            } else {
                let data = await db.Specialty.findOne({
                    where: { id: id },
                    attributes: ["descriptionHTML", "descriptionMarkdown"],
                });

                if (data) {
                    let specialtyDoctors = [];
                    if (location === "ALL") {
                        specialtyDoctors =
                            await db.Doctor_Clinic_Specialty.findAll({
                                where: {
                                    specialtyId: id,
                                },
                                attributes: ["doctorId", "provinceId"],
                            });
                    } else {
                        specialtyDoctors =
                            await db.Doctor_Clinic_Specialty.findAll({
                                where: {
                                    specialtyId: id,
                                    provinceId: location,
                                },
                                attributes: ["doctorId", "provinceId"],
                            });
                    }
                    data.specialtyDoctors = specialtyDoctors;
                } else {
                    data = {};
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
    createNewSpecialty,
    editSpecialty,
    deleteSpecialty,
    getAllSpecialty,
    getDetailSpecialtyById,
};
