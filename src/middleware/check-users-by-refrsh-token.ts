import {NextFunction, Request, Response} from "express";
import {usersService} from "../service/users-service";
import {deviceService} from "../service/device-service";

export const checkUsersByRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return res.sendStatus(401)
    const payload = await deviceService.getPayload(refreshToken)
    if (!payload) {
        return res.sendStatus(401)
    }
    const user = await usersService.findUserById(payload.userId)
    if (user) {
        req.user = user
        return next()
    }
    res.sendStatus(401)
}