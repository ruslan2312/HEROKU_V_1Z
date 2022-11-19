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
            return await emailAdapter.sendMail(email, "Resending", newConfirmationCode)
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
            const r = await authRepository.findRefreshTokenInBlackListByRT(refreshTokens);
            if (r) return false
            else {
                await deviceRepository.deleteDeviceByIdAndUserAgent(payload.userId, payload.iat, userAgent,)
                return await authRepository.addRefreshTokenByBlackList(refreshTokens)
            }
        } else return false;
    },
}