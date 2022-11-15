import {Request, Response, Router} from "express";
import {usersService} from "../service/users-service";
import {jwtService} from "../application/jwt-service";
import {
    authLoginValidation, authPasswordValidation, authRegistrationConfirm,
    usersEmailValidation,
    usersEmailValidationResending,
    usersLoginValidation,
    usersPasswordValidation
} from "../common/validator";
import {inputValidationMiddleware} from "../middleware/Input-validation-middleware";
import {authTokenMW} from "../middleware/authorization-middleware";
import {authService} from "../service/auth-service";
import {refreshTokenUpdateMiddleware} from "../middleware/refreshTokenUpdate-middleware";
import {deviceService} from "../service/device-service";
import {randomUUID} from "crypto";
import {settings} from "../settings";
import {verify} from "jsonwebtoken";
import jwt from "jsonwebtoken";
import {deviceRepository} from "../repository/device-repository";
import {log} from "util";

export const authRouter = Router()

authRouter.post('/login', authLoginValidation, authPasswordValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    const user = await usersService.checkCredentials(req.body.login, req.body.password)
    if (user) {
        const ip = req.ip
        const deviceId = randomUUID()
        const userAgent = req.headers["user-agent"]
        const token = await jwtService.createJWT(user, deviceId)
        const time = await deviceService.getIatAndExpToken(token.refreshToken)
        await deviceService.addDevice(user.id, userAgent!, ip, deviceId, time.iat, time.exp)
        res.cookie("refreshToken", token.refreshToken, {
                httpOnly: true,
                secure: false
            },
        ).status(200).send({accessToken: token.accessToken})
    } else {
        res.sendStatus(401)
    }
})

authRouter.post('/registration', usersLoginValidation, usersPasswordValidation, usersEmailValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    const login = req.body.login
    const password = req.body.password
    const email = req.body.email
    const user = await usersService.createUser(login, email, password)
    if (user) {
        res.sendStatus(204)
    } else {
        res.sendStatus(400)
    }
})

authRouter.post('/registration-email-resending', usersEmailValidationResending, inputValidationMiddleware, async (req: Request, res: Response) => {
    const email = req.body.email
    const resendingEmail = await authService.resentEmail(email)
    if (resendingEmail) {
        res.sendStatus(204)
    } else return res.sendStatus(400)
})

authRouter.post('/registration-confirmation', authRegistrationConfirm, inputValidationMiddleware, async (req: Request, res: Response) => {
    const code = req.body.code
    const registrationConfirm = await authService.registrationConfirm(code)
    if (registrationConfirm) {
        res.sendStatus(204)
    } else res.sendStatus(400)
})

authRouter.post('/refresh-token', refreshTokenUpdateMiddleware, inputValidationMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    const refreshToken = req.cookies.refreshToken
    const payload: any = await deviceService.getPayload(refreshToken)
    const checkRefreshToken = await deviceService.checkRefreshToken(user.id, payload.iat, payload.exp, payload.deviceId)
    debugger
    if (checkRefreshToken) {
        const token = await jwtService.createJWT(user, payload.deviceId!)
        res.cookie("refreshToken", token.refreshToken, {
                httpOnly: true,
                secure: false
            },
        ).send({accessToken: token.accessToken}).status(200)
        const payload2: any = await deviceService.getPayload(token.refreshToken)
        debugger
        const updateRefreshToken = await deviceService.updateRefreshToken(user.id, payload2.iat, payload2.exp, payload2.deviceId, payload.iat)
    } else {
        res.sendStatus(401)
    }
})

authRouter.get('/me', authTokenMW, async (req: Request, res: Response) => {
    const email = req.user.email
    const login = req.user.login;
    const userId = req.user.id
    if (email && login && userId) {
        res.send({email, login, userId})
    } else {
        res.sendStatus(401)
    }
})

authRouter.post('/logout', async (req: Request, res: Response) => {
    const refreshTokens = req.cookies.refreshToken
    const userAgent = req.headers["user-agent"]
    const logout = await authService.logout(refreshTokens, userAgent!)
    if (logout) {
        res.sendStatus(204)
    } else res.sendStatus(401)
});