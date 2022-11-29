import {Request, Response, Router} from "express";
import {usersService} from "../service/users-service";
import {jwtService} from "../application/jwt-service";
import {
    authLoginValidation, authRegistrationConfirm, codeValidator, passwordRecoveryEmail,
    usersEmailValidation,
    usersEmailValidationResending,
    usersLoginValidation,
    usersPasswordValidation
} from "../common/validator";
import {inputValidationMiddleware} from "../middleware/Input-validation-middleware";
import {authTokenMW} from "../middleware/authorization-middleware";
import {authService} from "../service/auth-service";
import {checkUsersByRefreshToken} from "../middleware/check-users-by-refrsh-token";
import {deviceService} from "../service/device-service";
import {randomUUID} from "crypto";
import {responseCountMiddleware} from "../middleware/createAccountLimiter";

export const authRouter = Router()

authRouter.post('/login', responseCountMiddleware, authLoginValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password)
    if (user) {
        const deviceId = randomUUID()
        const token = await jwtService.createJWT(user, deviceId)
        const time = await deviceService.getIatAndExpToken(token.refreshToken)
        await deviceService.addDevice(user.id, req.headers["user-agent"]!, req.ip, deviceId, time.iat, time.exp)
        res.cookie("refreshToken", token.refreshToken, {
                httpOnly: true,
                secure: true
            },
        ).status(200).send({accessToken: token.accessToken})
    } else {
        res.sendStatus(401)
    }
})

authRouter.post('/registration', responseCountMiddleware, usersLoginValidation, usersPasswordValidation, usersEmailValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
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
authRouter.post('/password-recovery', responseCountMiddleware, passwordRecoveryEmail, inputValidationMiddleware, async (req: Request, res: Response) => {
    const email = req.body.email
    const passwordRecovery = await authService.passwordRecovery(email)
    console.log(passwordRecovery)
    if (passwordRecovery) {
        res.sendStatus(204)
    } else return res.sendStatus(400)
})
authRouter.post('/new-password', responseCountMiddleware, codeValidator, inputValidationMiddleware, async (req: Request, res: Response) => {
    const code = req.body.code
    const password = req.body.password
    const registrationConfirm = await authService.passwordRecoveryConfirm(code, password)
    if (registrationConfirm) {
        res.sendStatus(204)
    } else res.sendStatus(400)
})
authRouter.post('/registration-email-resending', responseCountMiddleware, usersEmailValidationResending, inputValidationMiddleware, async (req: Request, res: Response) => {
    const email = req.body.email
    const resendingEmail = await authService.resentEmail(email)
    console.log(resendingEmail)
    if (resendingEmail) {
        res.sendStatus(204)
    } else return res.sendStatus(400)
})
authRouter.post('/registration-confirmation', responseCountMiddleware, authRegistrationConfirm, inputValidationMiddleware, async (req: Request, res: Response) => {
    const code = req.body.code
    const registrationConfirm = await authService.registrationConfirm(code)
    if (registrationConfirm) {
        res.sendStatus(204)
    } else res.sendStatus(400)
})

authRouter.post('/refresh-token', checkUsersByRefreshToken, inputValidationMiddleware, async (req: Request, res: Response) => {
    const user = req.user!
    const refreshToken = req.cookies.refreshToken
    const payload: any = await deviceService.getPayload(refreshToken)
    const checkRefreshToken = await deviceService.checkRefreshToken(user.id, payload.iat, payload.exp, payload.deviceId)
    if (checkRefreshToken) {
        const token = await jwtService.createJWT(user, payload.deviceId!)
        res.cookie("refreshToken", token.refreshToken, {
                httpOnly: true,
                secure: true
            },
        ).send({accessToken: token.accessToken}).status(200)
        const payload2: any = await deviceService.getPayload(token.refreshToken)
        await deviceService.updateRefreshToken(user.id, payload2.iat, payload2.exp, payload2.deviceId, payload.iat)
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
    console.log(logout)
    if (logout) {
        res.sendStatus(204)
    } else res.sendStatus(401)
});