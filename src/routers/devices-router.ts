import {Request, Response, Router} from "express";
import {deviceService} from "../service/device-service";
import {DeviceResponseType} from "../types/devicesTypes";
import {checkUsersByRefreshToken} from "../middleware/check-users-by-refrsh-token";
import {inputValidationMiddleware} from "../middleware/Input-validation-middleware";
import {usersService} from "../service/users-service";

export const devicesRouter = Router()

devicesRouter.get('/devices', checkUsersByRefreshToken, inputValidationMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    const refreshToken = req.cookies.refreshToken
    const payload: any = await deviceService.getPayload(refreshToken)
    if (!payload) return res.sendStatus(401)
    if (user) {
        const findDevice: DeviceResponseType[] = await deviceService.getAllUserDevice(payload.userId)
        res.send(findDevice).status(200)
    } else {
        res.sendStatus(401)
    }
})
devicesRouter.delete('/devices/', checkUsersByRefreshToken, inputValidationMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    const refreshToken = req.cookies.refreshToken
    if (!user) return res.sendStatus(401)
    const payload: any = await deviceService.getPayload(refreshToken)
    if (!payload) return res.sendStatus(401)
    const deleteDevice = await deviceService.deleteDeviceByIdAdnDate(payload.userId, payload.iat)
    if (deleteDevice) {
        return res.sendStatus(204)
    }
    res.sendStatus(401)
})
devicesRouter.delete('/devices/:deviceId', checkUsersByRefreshToken, inputValidationMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    const refreshToken = req.cookies.refreshToken
    if (!user) return res.sendStatus(401)
    const payload: any = await deviceService.getPayload(refreshToken)
    if (!payload) return res.sendStatus(401)
    const checkUserForDevice = await deviceService.checkUserForDevice(user.id!)
    if (!checkUserForDevice) return res.sendStatus(403)
    const deleteDevice = await deviceService.deleteDeviceByDeviceId(payload.userId, payload.iat, req.params.deviceId!)
    if (deleteDevice) {
        return res.sendStatus(204)
    }
    res.sendStatus(404)
})