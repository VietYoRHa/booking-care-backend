import specialtyService from "../services/specialtyService.js";

let createNewSpecialty = async (req, res) => {
    try {
        let message = await specialtyService.createNewSpecialty(req.body);
        return res.status(200).json(message);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let editSpecialty = async (req, res) => {
    try {
        let message = await specialtyService.editSpecialty(req.body);
        return res.status(200).json(message);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let deleteSpecialty = async (req, res) => {
    try {
        let message = await specialtyService.deleteSpecialty(req.body.id);
        return res.status(200).json(message);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let getAllSpecialty = async (req, res) => {
    try {
        let data = await specialtyService.getAllSpecialty();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let getDetailSpecialtyById = async (req, res) => {
    try {
        let data = await specialtyService.getDetailSpecialtyById(
            req.query.id,
            req.query.location
        );
        return res.status(200).json(data);
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

module.exports = {
    createNewSpecialty,
    editSpecialty,
    deleteSpecialty,
    getAllSpecialty,
    getDetailSpecialtyById,
};
