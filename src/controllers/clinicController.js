import clinicService from "../services/clinicService.js";

let createNewClinic = async (req, res) => {
    try {
        let message = await clinicService.createNewClinic(req.body);
        return res.status(200).json(message);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let editClinic = async (req, res) => {
    try {
        let message = await clinicService.editClinic(req.body);
        return res.status(200).json(message);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let deleteClinic = async (req, res) => {
    try {
        let message = await clinicService.deleteClinic(req.body.id);
        return res.status(200).json(message);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let getAllClinic = async (req, res) => {
    try {
        let data = await clinicService.getAllClinic();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let getDetailClinicById = async (req, res) => {
    try {
        let data = await clinicService.getDetailClinicById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

module.exports = {
    createNewClinic,
    editClinic,
    deleteClinic,
    getAllClinic,
    getDetailClinicById,
};
