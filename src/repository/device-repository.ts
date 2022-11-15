import {DevicesCollection} from "./db";
import {DeviceResponseType} from "../types/devicesTypes";


export const deviceRepository = {
    async getAllUserDevice(userId: string): Promise<DeviceResponseType[]> {
        return DevicesCollection.find({userId: userId}, {projection: {_id: 0, refreshTokenActive: 0}}).toArray()
    },
    async addDevice(newDevice: any) {
        return await DevicesCollection.insertOne({...newDevice})
    },
    async updateRefreshTokenActive(userId: string, userAgent: string, iat: Date, exp: Date) {
        return await DevicesCollection.updateOne({
            userId,
            title: userAgent,
        }, {$set: {lastActiveDate: iat.toISOString(), exp: exp.toISOString()}})
    },
    async deleteDeviceByIdAndUserId(userAgent: string, userId: string): Promise<boolean> {
        const result = await DevicesCollection.deleteOne({title: userAgent, userId: userId})
        return result.deletedCount === 1
    },
    async deleteAllDevice() {
        await DevicesCollection.deleteMany({});
    },
    async checkDeviceByRepeat(userId: string, userAgent: string): Promise<boolean> {
        const result = await DevicesCollection.findOne({userId: userId, title: userAgent})
        return !!result;
    },

    async updateRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string, searchIat: Date): Promise<boolean> {
        const result = await DevicesCollection.updateOne({
            userId: userId,
            lastActiveDate: searchIat.toISOString(),
            deviceId: deviceId
        }, {$set: {lastActiveDate: iat.toISOString(), exp: exp.toISOString()}})
        debugger
        return result.matchedCount === 1
    },
    async checkRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string): Promise<DeviceResponseType | null> {
        debugger
        return await DevicesCollection.findOne({userId, lastActiveDate: iat.toISOString(), deviceId})
    }
}