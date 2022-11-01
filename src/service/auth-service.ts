import {emailAdapter} from "../adapter/email-adapter";
import {usersRepository} from "../repository/users-repository";
import {randomUUID} from "crypto";
import {jwtService} from "../application/jwt-service";
import jwt from "jsonwebtoken";
import {settings} from "../settings";
import {usersService} from "./users-service";

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
    async logout(refreshTokens: string): Promise<boolean> {
        const userId = await jwtService.getUserIdByRefreshToken(refreshTokens)
        const user = await usersService.findUserById(userId)
        if (user) {
            const r = await usersRepository.findRefreshTokenInBlackListByRT(refreshTokens);
            if(r) return false
            else  return  await usersRepository.addRefreshTokenByBlackList(refreshTokens)
        } else return false;
    }
}