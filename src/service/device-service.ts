import {deviceRepository} from "../repository/device-repository";
import {DeviceResponseType} from "../types/devicesTypes";

export const deviceService = {
    async getAllUserDevice(userId: string): Promise<DeviceResponseType[]> {
        return await deviceRepository.getAllUserDevice(userId)
    },
    async addDevice(userId: string, userAgent: string, ip: string): Promise<void> {
        const a = await this.checkDeviceByRepeat(userId, userAgent)
        if (a) {
            await deviceRepository.updateRefreshTokenActive(userId, userAgent)
            return
        }
        const newDevice = {
            userId: userId,
            title: userAgent,
            lastActiveDate: new Date().toISOString(),
            refreshTokenActive: true,
            ip: ip,
        }
        await deviceRepository.addDevice(newDevice)
    },
    async checkDeviceByRepeat(userId: string, userAgent: string): Promise<boolean> {
        return await deviceRepository.checkDeviceByRepeat(userId, userAgent);
    },
    async deleteDeviceByIdAndUserId(userAgent: string, userId: string): Promise<boolean> {
        return await deviceRepository.deleteDeviceByIdAndUserId(userAgent, userId)
    },
    async deleteAllDevice() {
        await deviceRepository.deleteAllDevice()
    },
    async checkValidRefreshTokenByDate() {
        const dateToken = await deviceRepository.checkRefreshTokenActiveByDate()
        dateToken.map(e => {
            debugger
            console.log(new Date(e.lastActiveDate).getTime() - new Date().getTime())
            return new Date(e.lastActiveDate).getTime() - new Date().getTime()
        })
        await deviceRepository.updateRefreshTokenActiveByDate()
    },

}
// setInterval(deviceService.checkValidRefreshTokenByDate, 1500);
