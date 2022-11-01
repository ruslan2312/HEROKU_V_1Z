import {UserDbType} from "../types/usersType";
import jwt from 'jsonwebtoken'
import {settings} from "../settings";

export const jwtService = {
    async createJWT(user: UserDbType) {
        const accessToken = jwt.sign({id: user.id}, settings.JWT_SECRET, {expiresIn: "10s"})
        const refreshToken = jwt.sign({id: user.id}, settings.JWT_REFRESH_SECRET, {expiresIn: "20s"})
        return {accessToken, refreshToken}
    },

}