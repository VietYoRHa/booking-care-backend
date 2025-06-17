import userService from "../services/userService";

let handleLogin = async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password) {
        return res.status(500).json({
            errCode: 1,
            message: "Missing input parameter!",
        });
    }
    let userData = await userService.handleUserLogin(email, password);
    // Check email exist
    // Check password
    // return user info
    // access_token: jwt
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.errMessage,
        user: userData.user ? userData.user : {},
    });
};

let getAllUsers = async (req, res) => {
    let id = req.query.id;
    if (!id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: "Missing required parameters",
            users: [],
        });
    }
    let users = await userService.getAllUsers(id);
    return res.status(200).json({
        errCode: 0,
        errMessage: "OK",
        users,
    });
};

let createNewUser = async (req, res) => {
    let message = await userService.createNewUser(req.body);
    return res.status(200).json(message);
};

let editUser = async (req, res) => {
    let data = req.body;
    let message = await userService.updateUser(data);
    return res.status(200).json(message);
};

let deleteUser = async (req, res) => {
    if (!req.body.id) {
        return res.status(200).json({
            errCode: 1,
            errMessage: "Missing required parameter!",
        });
    }
    let message = await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
};

let getAllCode = async (req, res) => {
    try {
        let data = await userService.getAllCodeService(req.query.type);
        return res.status(200).json(data);
    } catch (e) {
        return res.status(200).json({
            errCode: -1,
            errMessage: "Error from server",
        });
    }
};

let search = async (req, res) => {
    try {
        let keyword = req.query.keyword;
        let data = await userService.search(keyword);
        return res.status(200).json(data);
    } catch (e) {
        console.error("Error from service search: ", e);
        return res.status(200).json({
            errCode: -1,
            message: "Error from server",
            doctors: [],
            specialties: [],
            clinics: [],
        });
    }
};

module.exports = {
    handleLogin: handleLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    editUser: editUser,
    deleteUser: deleteUser,
    getAllCode: getAllCode,
    search: search,
};
