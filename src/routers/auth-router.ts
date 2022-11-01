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
import any = jasmine.any;

export const authRouter = Router()
authRouter.post('/login', authLoginValidation, authPasswordValidation, inputValidationMiddleware, async (req: Request, res: Response) => {
    const user = await usersService.checkCredentials(req.body.login, req.body.password)
    if (user) {
        const token = await jwtService.createJWT(user)
        res.cookie("refreshToken", token.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            },
        ).send({accessToken: token.accessToken})
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
    debugger
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
    const user = req.user
    if (user) {
        const token = await jwtService.createJWT(user)
        res.cookie("refreshToken", token.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production"
            },
        ).send({accessToken: token.accessToken})
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
authRouter.post('/logout', (req: Request, res: Response) => {
    const {token} = req.body;
    let refreshTokens = req.cookies.refreshToken
    refreshTokens.filter((t: any) => t !== t);
    res.send("Logout successful");
});