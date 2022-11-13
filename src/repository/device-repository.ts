import { DevicesCollection} from "./db";
import {DeviceResponseType} from "../types/devicesTypes";


export const deviceRepository = {
    async getAllUserDevice(userId: string): Promise<DeviceResponseType[]> {
        return DevicesCollection.find({userId: userId}, {projection: {_id: 0, refreshTokenActive:0}}).toArray()
    },
    async addDevice(newDevice: any) {
        return await DevicesCollection.insertOne({...newDevice})
    },
    async updateRefreshTokenActive(userId: string, userAgent: string) {
        return await DevicesCollection.updateOne({userId, title: userAgent}, {$set: {refreshTokenActive: true}})
    },
    async deleteDeviceByIdAndUserId(userAgent: string, userId: string): Promise<boolean> {
        const result = await DevicesCollection.deleteOne({title: userAgent, userId: userId})
        return result.deletedCount === 1
    },
    async deleteAllDevice() {
        const result = await DevicesCollection.deleteMany({})
    },
    async checkDeviceByRepeat(userId: string, userAgent: string): Promise<boolean> {
        const result = await DevicesCollection.findOne({userId: userId, title: userAgent})
        return !!result;
    },
    async checkRefreshTokenActiveByDate() {
        return DevicesCollection.find({refreshTokenActive: true});
    },
    async updateRefreshTokenActiveByDate() {
        const filter = {refreshTokenActive: true}
        return await DevicesCollection.updateMany(filter, {$set: {refreshTokenActive: false}})
    },

}