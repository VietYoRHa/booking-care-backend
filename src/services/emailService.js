require("dotenv").config();
import nodemailer from "nodemailer";

let sendEmail = async (data) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === "true" ? true : false,
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    let info = await transporter.sendMail({
        from: `"${process.env.EMAIL_APP_NAME}" <${process.env.EMAIL_APP}>`,
        to: data.receiverEmail,
        subject: "Xác nhận lịch hẹn khám bệnh",
        html: `
            <h3>Xin chào ${data.patientName}!</h3>
            <p>Bạn nhận được Email này vì đã đặt lịch khám bệnh online trên VitaBook</p>
            <p>Thông tin lịch hẹn khám bệnh của bạn:</p>
            <div><b>Thời gian: </b>${data.time}</div>
            <div><b>Bác sĩ: </b>${data.doctorName}</div>
            <p>Nếu thông tin chính xác, vui lòng click vào link bên dưới để xác nhận lịch hẹn.</p>
            <div>
                <a href="${data.redirectLink}" target="_blank" >
                    Xác nhận lịch hẹn
                </a>
            </div>
            <p>Xin chân thành cảm ơn!</p>
            <p>Trân trọng!</p>
            <p>Hệ thống quản lý khám bệnh</p>
            <p><b>Ghi chú:</b> Đây là email tự động, vui lòng không trả lời email này.</p>
        `,
    });
};

module.exports = {
    sendEmail,
};
