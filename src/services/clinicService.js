import db from "../models/index";

let createNewClinic = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (
                !data.name ||
                !data.address ||
                !data.descriptionHTML ||
                !data.descriptionMarkdown ||
                !data.imageBase64
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                    image: data.imageBase64,
                });
                resolve({
                    errCode: 0,
                    errMessage: "Create clinic successfully",
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let getAllClinic = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll({
                attributes: {
                    exclude: ["createdAt", "updatedAt"],
                },
            });
            if (data && data.length > 0) {
                data.map((item) => {
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

let getDetailClinicById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            } else {
                let data = await db.Clinic.findOne({
                    where: { id: id },
                    attributes: {
                        exclude: ["id", "image", "createdAt", "updatedAt"],
                    },
                });

                if (data) {
                    let doctors = await db.Doctor_Info.findAll({
                        where: {
                            clinicId: id,
                        },
                        attributes: ["doctorId"],
                    });
                    data.doctor = doctors;
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
    createNewClinic,
    getAllClinic,
    getDetailClinicById,
};
