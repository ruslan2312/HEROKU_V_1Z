import {emailAdapter} from "../adapter/email-adapter";
import {usersRepository} from "../repository/users-repository";
import {randomUUID} from "crypto";
import {usersService} from "./users-service";
import {deviceService} from "./device-service";
import {deviceRepository} from "../repository/device-repository";
import bcrypt from "bcrypt";

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
            return await deviceRepository.deleteDeviceByIdAndUserAgent(payload.userId, payload.iat, userAgent,)
        } else return false;
    },
    async passwordRecovery(email: string): Promise<boolean> {
        const user = await usersRepository.findByLoginOrEmail(email)
        if (user?.emailConfirmation.isConfirmed === true) throw new Error()
        if (!user) return true
        const NewRecoveryCode = randomUUID()
        await usersRepository.updateUserRecoveryPasswordCodeByEmail(email, NewRecoveryCode);
        await emailAdapter.sendMailRecoveryPassword(email, "RecoveryPassword", NewRecoveryCode)
        return true
    },
    async passwordRecoveryConfirm(code: string, password: string): Promise<boolean | null> {
        const newPassword = await bcrypt.hash(password, 10)
        const updateIsConfirmed = await usersRepository.updatePasswordRecoveryCode(code, newPassword)
        if (updateIsConfirmed) {
            return true
        } else return null
    },
}