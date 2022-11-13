import {Request, Response, Router} from "express";
import {deviceService} from "../service/device-service";
import {DeviceResponseType} from "../types/devicesTypes";
import {authService} from "../service/auth-service";
import {refreshTokenUpdateMiddleware} from "../middleware/refreshTokenUpdate-middleware";
import {inputValidationMiddleware} from "../middleware/Input-validation-middleware";

export const devicesRouter = Router()

devicesRouter.get('/devices', refreshTokenUpdateMiddleware, inputValidationMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    const refreshToken = req.cookies.refreshToken
    const blackList = await authService.findRefreshTokenInBlackListByRT(refreshToken)
    if (blackList) {
        return res.sendStatus(401)
    }
    if (user) {
        const findDevice: DeviceResponseType[] = await deviceService.getAllUserDevice(user.id)
        res.send(findDevice)
    } else {
        res.sendStatus(401)
    }

})