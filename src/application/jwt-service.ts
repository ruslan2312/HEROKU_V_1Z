import {UserDbType} from "../types/usersType";
import jwt from 'jsonwebtoken'
import {settings} from "../settings";

export const jwtService = {
    async createJWT(user: UserDbType, deviceId: string) {
        const accessToken = jwt.sign({id: user.id, deviceId: deviceId}, settings.JWT_SECRET, {expiresIn: "100m"})
        const refreshToken = jwt.sign({id: user.id, deviceId:deviceId}, settings.JWT_REFRESH_SECRET, {expiresIn: "1000m"})
        return {accessToken, refreshToken}
    },

}