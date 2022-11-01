import {UserDbType} from "../types/usersType";
import jwt from 'jsonwebtoken'
import {settings} from "../settings";

export const jwtService = {
    async createJWT(user: UserDbType) {
        const accessToken = jwt.sign({id: user.id}, settings.JWT_SECRET, {expiresIn: "10s"})
        const refreshToken = jwt.sign({id: user.id}, settings.JWT_REFRESH_SECRET, {expiresIn: "20ыs"})
        return {accessToken, refreshToken}
    },

    async getUserIdByAccessToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return result.id
        } catch (error) {
            return null
        }
    },

    async getUserIdByRefreshToken(token: string) {
        try {
            debugger
            const result: any = jwt.verify(token, settings.JWT_REFRESH_SECRET)
            return result.id
        } catch (error) {
            return null
        }
    },
}