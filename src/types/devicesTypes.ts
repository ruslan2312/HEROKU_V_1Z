import mongoose from "mongoose";

export type  DeviceType = {
    id: string,
    ip: string,
    title: string,
    lastActiveDate: string,
    exp: string
    deviceId: string,
}
export type DeviceResponseType = {
    ip: string,
    title: string,
    deviceId: string,
    lastActiveDate: string,
}

export const newDevicesScheme = new mongoose.Schema({
    id: String,
    ip: String,
    title: String,
    lastActiveDate: String,
    exp: String,
    deviceId: String,
})