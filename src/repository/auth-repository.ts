import {RefreshTokenCollection} from "./db";

export const authRepository = {
    async addRefreshTokenByBlackList(refreshTokens: string): Promise<boolean> {
        debugger
        const result = await RefreshTokenCollection.insertOne({refreshToken: refreshTokens})
        return result.acknowledged
    },
    async findRefreshTokenInBlackListByRT(refreshTokens: string): Promise<boolean> {
        const result = await RefreshTokenCollection.findOne({refreshToken: refreshTokens})
        if (result) {
            return true
        } else return false
    }
}