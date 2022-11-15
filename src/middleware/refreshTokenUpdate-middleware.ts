import {NextFunction, Request, Response} from "express";
import {usersService} from "../service/users-service";

export const refreshTokenUpdateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return res.sendStatus(401)
    const token = await usersService.getTokenPayload(refreshToken)
    if (!token) {
        return res.sendStatus(401)
    }
    const user = await usersService.findUserById(token.id)
    if (user) {
        req.user = user
        return next()
    }
    res.sendStatus(401)
}