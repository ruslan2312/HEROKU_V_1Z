import {NextFunction, Request, Response} from "express";
import {usersService} from "../service/users-service";

export const refreshTokenUpdateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies
    const userId = await usersService.getUserIdByRefreshToken(cookies.refreshToken)
    if (!userId) {
        return res.sendStatus(401)
    }
    const user = await usersService.findUserById(userId)
    if (user) {
        req.user = user
        return next()
    }
    res.sendStatus(401)
}