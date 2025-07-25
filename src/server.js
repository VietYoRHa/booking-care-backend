import express from "express";
import bodyParser from "body-parser";
import initWebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import cors from "cors";

require("dotenv").config();

let app = express();
// app.use(cors({ credentials: true, origin: true }));
// Add headers before the routes are defined
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", process.env.URL_REACT);

    // Request methods you wish to allow
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    // Request headers you wish to allow
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type, Authorization"
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    // Pass to next layer of middleware
    next();
});

// Config app
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

initWebRoutes(app);

connectDB();

let port = process.env.PORT || 6969;
app.listen(port, () => {
    // Callback
    console.log("Backend Nodejs is running on port: " + port);
});
