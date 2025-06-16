import express from "express";
import userController from "../controllers/userController";
import doctorController from "../controllers/doctorController";
import appointmentController from "../controllers/appointmentController";
import specialtyController from "../controllers/specialtyController";
import clinicController from "../controllers/clinicController";
import {
    checkUserJWT,
    checkUserPermission,
} from "../middleware/authMiddleware";

const ROLES = {
    ADMIN: "R1",
    DOCTOR: "R2",
    PATIENT: "R3",
};

let router = express.Router();

let initWebRoutes = (app) => {
    // Routes không cần xác thực
    router.post("/api/login/", userController.handleLogin);

    // Routes cho bệnh nhân/người dùng chưa đăng nhập
    router.get("/api/top-doctor-home", doctorController.getTopDoctorHome);
    router.get("/api/get-all-doctors", doctorController.getAllDoctors);
    router.get(
        "/api/get-detail-doctor-by-id",
        doctorController.getDetailDoctorById
    );
    router.get(
        "/api/get-extra-doctor-info-by-id",
        doctorController.getExtraDoctorInfoById
    );
    router.get(
        "/api/get-profile-doctor-by-id",
        doctorController.getProfileDoctorById
    );
    router.get(
        "/api/get-schedule-doctor-by-date",
        doctorController.getScheduleDoctorByDate
    );
    router.get("/api/get-all-specialty", specialtyController.getAllSpecialty);
    router.get(
        "/api/get-detail-specialty-by-id",
        specialtyController.getDetailSpecialtyById
    );
    router.get("/api/get-all-clinic", clinicController.getAllClinic);
    router.get(
        "/api/get-detail-clinic-by-id",
        clinicController.getDetailClinicById
    );
    router.post(
        "/api/patient-book-appointment",
        appointmentController.postBookAppointment
    );
    router.post(
        "/api/verify-book-appointment",
        appointmentController.postVerifyBookAppointment
    );
    router.get("/api/allcode", userController.getAllCode);

    // Routes chỉ dành cho Admin
    router.get(
        "/api/get-all-users/",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        userController.getAllUsers
    );
    router.post(
        "/api/create-new-user/",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        userController.createNewUser
    );
    router.put(
        "/api/edit-user/",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        userController.editUser
    );
    router.delete(
        "/api/delete-user/",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        userController.deleteUser
    );
    router.post(
        "/api/create-new-specialty",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        specialtyController.createNewSpecialty
    );
    router.put(
        "/api/edit-specialty",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        specialtyController.editSpecialty
    );
    router.delete(
        "/api/delete-specialty",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        specialtyController.deleteSpecialty
    );
    router.post(
        "/api/create-new-clinic",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        clinicController.createNewClinic
    );
    router.put(
        "/api/edit-clinic",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        clinicController.editClinic
    );
    router.delete(
        "/api/delete-clinic",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        clinicController.deleteClinic
    );

    // Routes cho Admin và Bác sĩ

    router.post(
        "/api/save-info-doctor",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN, ROLES.DOCTOR]),
        doctorController.postInfoDoctor
    );
    router.post(
        "/api/bulk-create-schedule",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN, ROLES.DOCTOR]),
        doctorController.bulkCreateSchedule
    );

    // Routes chỉ dành cho bác sĩ
    router.get(
        "/api/get-list-patient-for-doctor",
        checkUserJWT,
        checkUserPermission([ROLES.DOCTOR]),
        doctorController.getListPatientForDoctor
    );
    router.post(
        "/api/complete-appointment",
        checkUserJWT,
        checkUserPermission([ROLES.DOCTOR]),
        appointmentController.completeAppointment
    );
    router.post(
        "/api/cancel-appointment",
        checkUserJWT,
        checkUserPermission([ROLES.DOCTOR]),
        appointmentController.cancelAppointment
    );

    return app.use("/", router);
};

module.exports = initWebRoutes;
