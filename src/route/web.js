import express from "express";
import homeController from "../controllers/homeController";
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
    // router.get("/", homeController.getHomePage);
    // router.get("/about", homeController.getAboutPage);
    // router.get("/crud", homeController.getCRUD);

    // router.post("/post-crud", homeController.postCRUD);
    // router.get("/get-crud", homeController.displayGetCRUD);
    // router.get("/edit-crud", homeController.getEditCRUD);
    // router.post("/put-crud", homeController.putCRUD);
    // router.get("/delete-crud", homeController.deleteCRUD);

    // router.post("/api/login/", userController.handleLogin);
    // router.get("/api/get-all-users/", userController.getAllUsers);
    // router.post("/api/create-new-user/", userController.createNewUser);
    // router.put("/api/edit-user/", userController.editUser);
    // router.delete("/api/delete-user/", userController.deleteUser);
    // router.get("/api/allcode", userController.getAllCode);

    // router.get("/api/top-doctor-home", doctorController.getTopDoctorHome);
    // router.get("/api/get-all-doctors", doctorController.getAllDoctors);
    // router.post("/api/save-info-doctor", doctorController.postInfoDoctor);
    // router.get(
    //     "/api/get-detail-doctor-by-id",
    //     doctorController.getDetailDoctorById
    // );
    // router.get(
    //     "/api/get-extra-doctor-info-by-id",
    //     doctorController.getExtraDoctorInfoById
    // );
    // router.get(
    //     "/api/get-profile-doctor-by-id",
    //     doctorController.getProfileDoctorById
    // );
    // router.post(
    //     "/api/bulk-create-schedule",
    //     doctorController.bulkCreateSchedule
    // );
    // router.get(
    //     "/api/get-schedule-doctor-by-date",
    //     doctorController.getScheduleDoctorByDate
    // );
    // router.get(
    //     "/api/get-list-patient-for-doctor",
    //     doctorController.getListPatientForDoctor
    // );

    // router.post(
    //     "/api/patient-book-appointment",
    //     appointmentController.postBookAppointment
    // );
    // router.post(
    //     "/api/verify-book-appointment",
    //     appointmentController.postVerifyBookAppointment
    // );

    // router.post(
    //     "/api/create-new-specialty",
    //     specialtyController.createNewSpecialty
    // );
    // router.get("/api/get-all-specialty", specialtyController.getAllSpecialty);
    // router.get(
    //     "/api/get-detail-specialty-by-id",
    //     specialtyController.getDetailSpecialtyById
    // );

    // router.post("/api/create-new-clinic", clinicController.createNewClinic);
    // router.get("/api/get-all-clinic", clinicController.getAllClinic);
    // router.get(
    //     "/api/get-detail-clinic-by-id",
    //     clinicController.getDetailClinicById
    // );

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
    router.post(
        "/api/create-new-clinic",
        checkUserJWT,
        checkUserPermission([ROLES.ADMIN]),
        clinicController.createNewClinic
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

    return app.use("/", router);
};

module.exports = initWebRoutes;
