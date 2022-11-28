import {requestDbModel} from "./db";

export const requestDbRepo = {
    async getRequestsCountPer10sec(ip: string, url: string, date: Date): Promise<number> {
        const item = await requestDbModel.find({ip, url, date: {$gt: date}}).lean()
        return item.length
    },
    async createRequestRow(ip: string, url: string, date: Date) {
        return await requestDbModel.insertMany([{ip, url, date}])
    },
    async deleteAllRequest() {
        return requestDbModel.deleteMany({});
    }
}