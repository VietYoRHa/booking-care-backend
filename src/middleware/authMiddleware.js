import jwt from "jsonwebtoken";
require("dotenv").config();

const createJWT = (payload) => {
    let key = process.env.JWT_SECRET;
    let token = null;
    try {
        token = jwt.sign(payload, key, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
    } catch (e) {
        console.log(e);
    }
    return token;
};

const verifyToken = (token) => {
    let key = process.env.JWT_SECRET;
    let decoded = null;
    try {
        decoded = jwt.verify(token, key);
    } catch (e) {
        console.log(e);
    }
    return decoded;
};

const extractToken = (req) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
};

const checkUserJWT = (req, res, next) => {
    let tokenFromHeader = extractToken(req);

    if (tokenFromHeader) {
        let decoded = verifyToken(tokenFromHeader);
        if (decoded) {
            req.user = decoded;
            next();
        } else {
            return res.status(401).json({
                errCode: -1,
                errMessage: "Invalid token or token expired",
            });
        }
    } else {
        return res.status(401).json({
            errCode: -1,
            errMessage: "Authentication required",
        });
    }
};

const checkUserPermission = (requiredRoles) => {
    return (req, res, next) => {
        if (req.user) {
            const { roleId } = req.user;
            if (requiredRoles.includes(roleId)) {
                next();
            } else {
                return res.status(403).json({
                    errCode: -1,
                    errMessage:
                        "You don't have permission to access this resource",
                });
            }
        } else {
            return res.status(401).json({
                errCode: -1,
                errMessage: "Authentication required",
            });
        }
    };
};

module.exports = {
    createJWT,
    verifyToken,
    checkUserJWT,
    checkUserPermission,
};
