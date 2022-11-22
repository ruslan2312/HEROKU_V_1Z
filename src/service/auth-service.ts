import {emailAdapter} from "../adapter/email-adapter";
import {usersRepository} from "../repository/users-repository";
import {randomUUID} from "crypto";
import {usersService} from "./users-service";
import {authRepository} from "../repository/auth-repository";
import {deviceService} from "./device-service";
import {deviceRepository} from "../repository/device-repository";
import rateLimit from 'express-rate-limit'


export const authService = {
    async resentEmail(email: string): Promise<boolean | null> {
        const newConfirmationCode = randomUUID()
        const updateUserConfirmCodeByEmail = await usersRepository.updateUserConfirmationCodeByEmail(email, newConfirmationCode);
        if (updateUserConfirmCodeByEmail) {
            const res = await emailAdapter.sendMail(email, "Resending", newConfirmationCode)
            return res
        } else return null
    },
    async registrationConfirm(code: string): Promise<boolean | null> {
        const updateIsConfirmed = await usersRepository.updateCheckConfirmCode(code)
        if (updateIsConfirmed) {
            return true
        } else return null
    },
    async logout(refreshTokens: string, userAgent: string): Promise<boolean> {
        if (!refreshTokens) return false
        const payload = await deviceService.getPayload(refreshTokens)
        if (!payload) return false
        const user = await usersService.findUserById(payload.userId)
        if (user) {
            await deviceRepository.deleteDeviceByIdAndUserAgent(payload.userId, payload.iat, userAgent,)
            return await authRepository.addRefreshTokenByBlackList(refreshTokens)
        } else return false;
    },
}