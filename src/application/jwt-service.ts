import {UserDbType} from "../types/usersType";
import jwt from 'jsonwebtoken'
import {settings} from "../settings";

export const jwtService = {
    async createJWT(user: UserDbType, userAgent: string) {
        const accessToken = jwt.sign({id: user.id, userAgent: userAgent}, settings.JWT_SECRET, {expiresIn: "10m"})
        const refreshToken = jwt.sign({id: user.id, userAgent:userAgent}, settings.JWT_REFRESH_SECRET, {expiresIn: "20m"})
        return {accessToken, refreshToken}
    },

}