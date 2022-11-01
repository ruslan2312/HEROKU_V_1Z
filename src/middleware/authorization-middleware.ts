import {NextFunction, Request, Response} from "express";
import {usersService} from "../service/users-service";

export const authTokenMW = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.send(401)
        return
    }
    const authType = req.headers.authorization.split(" ")[0]
    if (authType !== 'Bearer') return res.sendStatus(401)
    const token = req.headers.authorization.split(" ")[1]
    const userId = await usersService.getUserIdByAccessToken(token)
    const user = await usersService.findUserById(userId)
    if (user) {
        req.user = user
        return next()
    }
    res.send(401)
}
