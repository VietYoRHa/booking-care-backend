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
        subject:
            data.language === "vi"
                ? "Xác nhận lịch hẹn khám bệnh"
                : "Confirm your medical appointment",
        html: buildEmailHTMLTemplate(data),
    });
};

let buildEmailHTMLTemplate = (data) => {
    let content = ``;
    if (data.language === "vi") {
        content = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px; background-color: #f9f9f9;">
                <h2 style="color: #2c7be5;">Xin chào ${data.patientName}!</h2>
                <p>Bạn nhận được email này vì đã đặt lịch khám bệnh trực tuyến trên <strong>VitaBook</strong>.</p>
    
                <p><strong>Thông tin lịch hẹn khám bệnh của bạn:</strong></p>
                <ul style="list-style: none; padding-left: 0;">
                    <li><strong>🕒 Thời gian:</strong> ${data.time}</li>
                    <li><strong>👨‍⚕️ Bác sĩ:</strong> ${data.doctorName}</li>
                </ul>
    
                <p>Nếu thông tin trên là chính xác, vui lòng nhấn vào nút bên dưới để xác nhận lịch hẹn:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${data.redirectLink}" target="_blank" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">✅ Xác nhận lịch hẹn</a>
                </div>
    
                <p>Xin chân thành cảm ơn!</p>
                <p>Trân trọng,</p>
                <p><em>Đội ngũ VitaBook</em></p>
                <hr>
                <p style="font-size: 0.9em; color: #999;"><strong>Ghi chú:</strong> Đây là email tự động, vui lòng không phản hồi lại email này.</p>
            </div>
        `;
    }
    if (data.language === "en") {
        content = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px; background-color: #f9f9f9;">
                <h2 style="color: #2c7be5;">Hello ${data.patientName},</h2>
                <p>You received this email because you booked a medical appointment online through <strong>VitaBook</strong>.</p>
            
                <p><strong>Your appointment details:</strong></p>
                <ul style="list-style: none; padding-left: 0;">
                    <li><strong>🕒 Time:</strong> ${data.time}</li>
                    <li><strong>👨‍⚕️ Doctor:</strong> ${data.doctorName}</li>
                </ul>
            
                <p>If the above information is correct, please click the button below to confirm your appointment:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${data.redirectLink}" target="_blank" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">✅ Confirm Appointment</a>
                </div>
            
                <p>Thank you very much!</p>
                <p>Sincerely,</p>
                <p><em>The VitaBook Team</em></p>
            <hr>
            <p style="font-size: 0.9em; color: #999;"><strong>Note:</strong> This is an automated email. Please do not reply to it.</p>
        </div>
        `;
    }
    return content;
};

let sendCancelEmail = async (data) => {
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
        subject:
            data.language === "vi"
                ? "Thông báo hủy lịch hẹn khám bệnh"
                : "Appointment Cancellation Notification",
        html: buildCancelEmailHTMLTemplate(data),
    });
};

let buildCancelEmailHTMLTemplate = (data) => {
    let content = ``;
    if (data.language === "vi") {
        content = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px; background-color: #f9f9f9;">
                <h2 style="color: #e74c3c;">Xin chào ${data.patientName}!</h2>
                <p>Chúng tôi rất tiếc phải thông báo rằng lịch hẹn khám bệnh của bạn đã bị hủy.</p>
    
                <p><strong>Thông tin lịch hẹn:</strong></p>
                <ul style="list-style: none; padding-left: 0;">
                    <li><strong>🕒 Thời gian:</strong> ${data.time}</li>
                    <li><strong>👨‍⚕️ Bác sĩ:</strong> ${data.doctorName}</li>
                    <li><strong>❌ Lí do hủy:</strong> ${data.cancelReason}</li>
                </ul>
    
                <p>Nếu bạn có bất kỳ câu hỏi nào hoặc muốn đặt lại lịch hẹn, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại.</p>
    
                <p>Xin chân thành cảm ơn!</p>
                <p>Trân trọng,</p>
                <p><em>Đội ngũ VitaBook</em></p>
            </div>
        `;
    }
    if (data.language === "en") {
        content = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 6px; background-color: #f9f9f9;">
                <h2 style="color: #e74c3c;">Hello ${data.patientName},</h2>
                <p>We regret to inform you that your medical appointment has been canceled.</p>
            
                <p><strong>Your appointment details:</strong></p>
                <ul style="list-style: none; padding-left: 0;">
                    <li><strong>🕒 Time:</strong> ${data.time}</li>
                    <li><strong>👨‍⚕️ Doctor:</strong> ${data.doctorName}</li>
                    <li><strong>❌ Reason:</strong> ${data.cancelReason}</li>
                </ul>
                <p>If you have any questions or would like to reschedule, please contact us via email or phone.</p>
                <p>Thank you very much!</p>
                <p>Sincerely,</p>
                <p><em>The VitaBook Team</em></p>
            </div>
        `;
    }
    return content;
};

module.exports = {
    sendEmail,
    sendCancelEmail,
};
