import db from "../models/index";
import emailService from "./emailService";
require("dotenv").config();

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
                // Send email notification
                await emailService.sendEmail({
                    receiverEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: "https://www.youtube.com/",
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

module.exports = {
    postBookAppointment,
};
