import {emailAdapter} from "../adapter/email-adapter";
import {usersRepository} from "../repository/users-repository";
import {randomUUID} from "crypto";
import {usersService} from "./users-service";
import {authRepository} from "../repository/auth-repository";
import {deviceService} from "./device-service";

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
        const payload = await usersService.getTokenPayload(refreshTokens)
        const user = await usersService.findUserById(payload.id)
        if (user) {
            const r = await authRepository.findRefreshTokenInBlackListByRT(refreshTokens);
            if (r) return false
            else {
               await deviceService.deleteDeviceByIdAndUserId(userAgent, user.id,)
                return await authRepository.addRefreshTokenByBlackList(refreshTokens)
            }
        } else return false;
    },
    async findRefreshTokenInBlackListByRT(refreshTokens: string): Promise<boolean> {
        return await authRepository.findRefreshTokenInBlackListByRT(refreshTokens)
    },
    async addRefreshTokenByBlackList(refreshTokens: string): Promise<boolean> {
        return await authRepository.addRefreshTokenByBlackList(refreshTokens)
    },
}