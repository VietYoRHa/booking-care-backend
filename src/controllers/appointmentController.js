import appointmentService from "../services/appointmentService";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

let completeAppointment = async (req, res) => {
    try {
        upload.single("file")(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    errCode: -1,
                    errMessage: "Error when uploading file: ",
                });
            } else if (err) {
                return res.status(500).json({
                    errCode: -1,
                    errMessage: "Error from server: " + err.message,
                });
            }
            let message = await appointmentService.completeAppointment({
                ...req.body,
                file: req.file,
            });

            return res.status(200).json(message);
        });
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let cancelAppointment = async (req, res) => {
    try {
        let message = await appointmentService.cancelAppointment(req.body);
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
    completeAppointment,
    cancelAppointment,
};
