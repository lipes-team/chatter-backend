import { Request } from 'express-jwt';

import { expressjwt as jwt } from 'express-jwt';

export const isAuthenticated = jwt({
    secret: process.env.JWT_SECRET || 'd3f4ults3cr3t',
    algorithms: ['HS256'],
    requestProperty: 'payload',
    getToken: getTokenFromHeaders,
});

function getTokenFromHeaders(req: Request) {
    if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
        const token = req.headers.authorization.split(' ')[1];
        return token;
    }

    return undefined;
}