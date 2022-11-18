import {deviceRepository} from "../repository/device-repository";
import {DeviceResponseType} from "../types/devicesTypes";
import jwt, {JwtPayload} from "jsonwebtoken";
import {settings} from "../settings";

export const deviceService = {
    async getAllUserDevice(userId: string): Promise<DeviceResponseType[]> {
        return await deviceRepository.getAllUserDevice(userId)
    },
    async addDevice(userId: string, userAgent: string, ip: string, deviceId: string, iat: Date, exp: Date,): Promise<void> {
        const a = await this.checkDeviceByRepeat(userId, userAgent)
        if (a) {
            await deviceRepository.updateRefreshTokenActive(userId, userAgent, iat, exp ,deviceId)
            return
        }
        const newDevice = {
            userId: userId,
            title: userAgent,
            lastActiveDate: iat.toISOString(),
            exp: exp.toISOString(),
            ip: ip,
            deviceId: deviceId,
        }
        await deviceRepository.addDevice(newDevice)
    },
    async checkDeviceByRepeat(userId: string, userAgent: string): Promise<boolean> {
        return await deviceRepository.checkDeviceByRepeat(userId, userAgent);
    },

    async getIatAndExpToken(refreshToken: string): Promise<any> {
        const payload: any = jwt.decode(refreshToken)
        const iat = new Date(payload.iat * 1000)
        const exp = new Date(payload.exp * 1000)
        return {iat, exp}
    },

    async updateRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string, searchIat: Date): Promise<boolean> {
        debugger
        return deviceRepository.updateRefreshToken(userId, iat, exp, deviceId, searchIat)
    },

    async getPayload(refreshToken: string): Promise<any> {
        try {
            const payload: any = jwt.verify(refreshToken, settings.JWT_REFRESH_SECRET)
            const userId = payload.id
            const deviceId = payload.deviceId
            const iat = new Date(payload.iat * 1000)
            const exp = new Date(payload.exp * 1000)
            return {deviceId, iat, exp, userId}
        } catch (error) {
            return null
        }
    },
    async checkRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string): Promise<boolean> {
        const result = await deviceRepository.checkRefreshToken(userId, iat, exp, deviceId)
        if (!result) return false
        return true
    },
    async deleteDeviceByIdAdnDate(userId: string, iat: Date): Promise<boolean> {
        return await deviceRepository.deleteDeviceByIdAndIat(userId, iat)
    },
    async deleteAllDevice() {
        await deviceRepository.deleteAllDevice()
    },
    async deleteDeviceByDeviceId(userId: string, iat: Date, deviceId: string): Promise<boolean> {
        return await deviceRepository.deleteDeviceByDeviceId(userId, iat, deviceId)
    },
}
