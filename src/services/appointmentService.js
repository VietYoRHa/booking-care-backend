import db from "../models/index";
import emailService from "./emailService";
import { v4 as uuidv4 } from "uuid";
require("dotenv").config();

let buildRedirectLink = (doctorId, token) => {
    let redirectLink = `${process.env.URL_REACT}/verify-booking?id=${doctorId}&token=${token}`;
    return redirectLink;
};

let postBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        let isSendEmail = true;
        try {
            if (
                !data.email ||
                !data.doctorId ||
                !data.date ||
                !data.timeType ||
                !data.firstName ||
                !data.lastName ||
                !data.fullName ||
                !data.selectedGender ||
                !data.address ||
                !data.phoneNumber ||
                !data.reason
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            } else {
                let token = uuidv4();

                // Upsert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: "R3",
                        firstName: data.firstName,
                        lastName: data.lastName,
                        gender: data.selectedGender,
                        address: data.address,
                        phoneNumber: data.phoneNumber,
                    },
                    raw: false,
                });

                if (
                    user &&
                    user[0] &&
                    user[0].firstName !== data.firstName &&
                    user[0].lastName !== data.lastName
                ) {
                    return resolve({
                        errCode: 3,
                        errMessage:
                            "Email already exists with a different name",
                    });
                }
                // If the user already exists, we can update their information
                if (user && user[0]) {
                    user[0].address = data.address;
                    user[0].gender = data.selectedGender;
                    user[0].phoneNumber = data.phoneNumber;
                    await user[0].save();
                }

                // Create a new appointment
                if (user && user[0]) {
                    let appointment = await db.Appointment.findOrCreate({
                        where: {
                            patientId: user[0].id,
                            doctorId: data.doctorId,
                            date: data.date,
                            timeType: data.timeType,
                        },
                        defaults: {
                            statusId: "S1",
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            reason: data.reason,
                            token: token,
                        },
                        raw: false,
                    });
                    if (
                        appointment &&
                        appointment[0] &&
                        appointment[0].statusId === "S1"
                    ) {
                        appointment[0].reason = data.reason;
                        appointment[0].token = token;
                        await appointment[0].save();
                    }
                    if (
                        appointment &&
                        appointment[0] &&
                        appointment[0].statusId === "S2"
                    ) {
                        isSendEmail = false;
                        resolve({
                            errCode: 4,
                            errMessage:
                                "Appointment already booked in this time slot",
                        });
                    }
                }
                if (isSendEmail === true) {
                    // Send email notification
                    emailService
                        .sendEmail({
                            receiverEmail: data.email,
                            patientName: data.fullName,
                            time: data.timeString,
                            doctorName: data.doctorName,
                            language: data.language,
                            redirectLink: buildRedirectLink(
                                data.doctorId,
                                token
                            ),
                        })
                        .catch((error) => {
                            resolve({
                                errCode: 2,
                                errMessage: "Error sending email notification",
                            });
                        });
                }
                resolve({
                    errCode: 0,
                    errMessage: "Booking successful",
                });
            }
        } catch (error) {
            reject(error);
        }
    });
};

let postVerifyBookAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.token || !data.doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            } else {
                let appointment = await db.Appointment.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: "S1",
                    },
                    raw: false,
                });

                if (appointment) {
                    appointment.statusId = "S2"; // Change status to confirmed
                    await appointment.save();
                    resolve({
                        errCode: 0,
                        errMessage: "Booking confirmed successfully",
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Booking not found or already confirmed",
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

let completeAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            } else {
                let appointment = await db.Appointment.findOne({
                    where: { id: data.id, date: data.date, statusId: "S2" },
                    raw: false,
                });

                if (appointment) {
                    appointment.statusId = "S3";
                    await appointment.save();
                    emailService
                        .sendCompleteEmail({
                            receiverEmail: data.email,
                            patientName: data.fullName,
                            time: data.timeString,
                            doctorName: data.doctorName,
                            language: data.language,
                            file: data.file,
                            fileName: data.fileName,
                        })
                        .catch((error) => {
                            resolve({
                                errCode: 2,
                                errMessage: "Error sending cancellation email",
                            });
                        });
                    resolve({
                        errCode: 0,
                        errMessage: "Appointment status updated successfully",
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Appointment not found",
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

let cancelAppointment = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            } else {
                let appointment = await db.Appointment.findOne({
                    where: { id: data.id, date: data.date, statusId: "S2" },
                    raw: false,
                });

                if (appointment) {
                    appointment.statusId = "S4";
                    await appointment.save();
                    emailService
                        .sendCancelEmail({
                            receiverEmail: data.email,
                            patientName: data.fullName,
                            time: data.timeString,
                            doctorName: data.doctorName,
                            language: data.language,
                            cancelReason: data.cancelReason,
                        })
                        .catch((error) => {
                            resolve({
                                errCode: 2,
                                errMessage: "Error sending cancellation email",
                            });
                        });
                    resolve({
                        errCode: 0,
                        errMessage: "Appointment cancelled successfully",
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: "Appointment not found",
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    postBookAppointment,
    postVerifyBookAppointment,
    completeAppointment,
    cancelAppointment,
};
