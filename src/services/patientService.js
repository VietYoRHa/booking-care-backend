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
        try {
            if (
                !data.email ||
                !data.doctorId ||
                !data.date ||
                !data.timeType ||
                !data.fullName
            ) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters",
                });
            } else {
                let token = uuidv4();
                // Send email notification
                await emailService.sendEmail({
                    receiverEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: buildRedirectLink(data.doctorId, token),
                });
                // Upsert patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: "R3",
                    },
                });
                // Create a new appointment
                if (user && user[0]) {
                    await db.Booking.findOrCreate({
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
                            token: token,
                        },
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
                let appointment = await db.Booking.findOne({
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

module.exports = {
    postBookAppointment,
    postVerifyBookAppointment,
};
