import { Request } from "express-jwt";

var { expressjwt: jwt } = require("express-jwt");

const isAuthenticated = jwt({
    secret: process.env.JWT_SECRET || "d3f4ults3cr3t",
    algorithms: ["HS256"],
    requestProperty: "payload",
    getToken: getTokenFromHeaders
});

function getTokenFromHeaders(req: Request) {

    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {

        const token = req.headers.authorization.split(" ")[1];
        return token;
    }

    return null;
}

module.exports = {
    isAuthenticated
}