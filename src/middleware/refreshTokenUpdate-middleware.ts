import {NextFunction, Request, Response} from "express";
import {usersService} from "../service/users-service";
import {jwtService} from "../application/jwt-service";


export const refreshTokenUpdateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    debugger
    const cookies = req.cookies
    const userId = await jwtService.getUserIdByRefreshToken(cookies.refreshToken)
    const user = await usersService.findUserById(userId)
    debugger
    if (user) {
        req.user = user
        return next()
    }
    res.sendStatus(401)
}