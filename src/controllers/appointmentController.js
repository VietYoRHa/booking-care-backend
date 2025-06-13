import appointmentService from "../services/appointmentService";

let postBookAppointment = async (req, res) => {
    try {
        let message = await appointmentService.postBookAppointment(req.body);
        return res.status(200).json(message);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let postVerifyBookAppointment = async (req, res) => {
    try {
        let message = await appointmentService.postVerifyBookAppointment(
            req.body
        );
        return res.status(200).json(message);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

module.exports = {
    postBookAppointment,
    postVerifyBookAppointment,
};
