import {DevicesCollection} from "./db";
import {DeviceResponseType} from "../types/devicesTypes";

export const deviceRepository = {
    async getAllUserDevice(userId: string): Promise<DeviceResponseType[]> {
        return DevicesCollection.find({userId: userId}, {
            projection: {
                _id: 0,
                exp: 0,
                refreshTokenActive: 0,
                userId: 0
            }
        }).toArray()
    },
    async addDevice(newDevice: any) {
        return DevicesCollection.insertOne({...newDevice})
    },
    async checkDeviceByRepeat(userId: string, userAgent: string): Promise<boolean> {
        const result = await DevicesCollection.findOne({userId: userId, title: userAgent})
        return !!result;
    },
    async updateRefreshTokenActive(userId: string, userAgent: string, iat: Date, exp: Date, deviceId: string) {
        return DevicesCollection.updateOne({
            userId,
            title: userAgent,
        }, {$set: {lastActiveDate: iat.toISOString(), exp: exp.toISOString(), deviceId: deviceId}})
    },
    async updateRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string, searchIat: Date): Promise<boolean> {
        const result = await DevicesCollection.updateOne({
            userId: userId,
            lastActiveDate: searchIat.toISOString(),
            deviceId: deviceId
        }, {$set: {lastActiveDate: iat.toISOString(), exp: exp.toISOString()}})
        return result.matchedCount === 1
    },
    async checkRefreshToken(userId: string, iat: Date, exp: Date, deviceId: string): Promise<DeviceResponseType | null> {
        return await DevicesCollection.findOne({userId, lastActiveDate: iat.toISOString(), deviceId})
    },
    async deleteDeviceByIdAndUserAgent(userId: string, iat: Date, userAgent: string): Promise<boolean> {
        const result = await DevicesCollection.deleteOne({
            userId: userId,
            lastActiveDate: iat.toISOString(),
            title: userAgent
        })
        return result.deletedCount === 1
    },
    async deleteDeviceByIdAndIat(userId: string, deviceId: string): Promise<boolean> {
        const findDevice = await DevicesCollection.find({userId}).toArray()
        if (findDevice.length === 1) return true
        console.log(userId, deviceId)
        const result = await DevicesCollection.deleteMany({userId: userId, deviceId: {$ne: deviceId}})
        if (result) {
            return true
        }
        return false
    },
    async deleteAllDevice() {
        return await DevicesCollection.deleteMany({});
    },
    async deleteDeviceByDeviceId(userId: string, deviceId: string): Promise<boolean> {
        const result = await DevicesCollection.deleteOne({userId: userId, deviceId: deviceId})
        return result.deletedCount === 1
    },
    async checkUserForDevice(userId: string): Promise<DeviceResponseType | null> {
        return DevicesCollection.findOne({userId}, {
            projection: {
                _id: 0,
                exp: 0,
                refreshTokenActive: 0,
                userId: 0
            }
        })
    },
    async findDeviceById(deviceId: string): Promise<any> {
        return await DevicesCollection.findOne({deviceId}, {
            projection: {
                _id: 0,
                exp: 0,
                refreshTokenActive: 0,
            }
        });
    }

}