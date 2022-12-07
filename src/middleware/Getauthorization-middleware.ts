import {NextFunction, Request, Response} from "express";
import {usersService} from "../service/users-service";

export const GetAuthTokenMW = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        return next()
    }
    const token = req.headers.authorization.split(" ")[1]
    const userId = await usersService.getUserIdByAccessToken(token)
    const user = await usersService.findUserById(userId)
    if (user) {
        req.user = user
        return next()
    }
    next()
}
