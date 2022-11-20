import {requestDbCollection} from "./db";

export const requestDbRepo = {
    async getRequestsCountPer10sec(ip: string, url: string, date: Date): Promise<number> {
        const item = await requestDbCollection.find({ip, url, date: {$gt: date}}).toArray()
        return item.length
    },
    async createRequestRow(ip: string, url: string, date: Date) {
        return await requestDbCollection.insertOne({ip, url, date})
    },
    async deleteAllRequest() {
        return await requestDbCollection.deleteMany({})
    }
}