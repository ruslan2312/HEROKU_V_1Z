import {UsersModel} from "./db";
import {UserDbType, UserResponseType, UsersPaginationQueryType} from "../types/usersType";
import {Filter} from "mongodb";
import {paginationResult, PaginationResultType} from "../helpers/paginathion";


export const usersRepository = {
    async findUsers(queryData: UsersPaginationQueryType): Promise<PaginationResultType> {
        const filter = this._getFilterForQuery(queryData)
        return this._findUsersByFilters(filter, queryData)
    },
    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDbType | null> {
        return UsersModel.findOne({$or: [{'accountData.email': loginOrEmail}, {'accountData.login': loginOrEmail}]})
    },
    async findUserById(id: string): Promise<UserDbType | null> {
        return UsersModel.findOne({id: id}, {projection: {_id: 0}});
    },
    async createUser(user: UserDbType): Promise<UserDbType> {
        console.log(user)
        await UsersModel.insertMany([{...user}]);
        return user
    },
    async deleteUser(id: string): Promise<boolean> {
        const result = await UsersModel.deleteOne({id: id})
        return result.deletedCount === 1
    },
    async deleteAllUsers(): Promise<boolean> {
        const result = await UsersModel.deleteMany({})
        return result.deletedCount === 1
    },

    _getFilterForQuery(queryData: UsersPaginationQueryType): Filter<UserDbType> {
        if (!queryData.searchEmailTerm && queryData.searchLoginTerm) {
            return {login: {$regex: queryData.searchLoginTerm, $options: 'i'}}
        }
        if (queryData.searchEmailTerm && !queryData.searchLoginTerm) {
            return {email: {$regex: queryData.searchEmailTerm, $options: 'i'}}
        }
        if (queryData.searchEmailTerm && queryData.searchLoginTerm) {
            return {
                $or: [{
                    login: {
                        $regex: queryData.searchLoginTerm, $options: 'i'
                    }
                }, {email: {$regex: queryData.searchEmailTerm, $options: 'i'}}]
            }
        }
        return {}
    },
    async updateUserConfirmationCodeByEmail(email: string, confirmationCode: string): Promise<boolean> {
        const result = await UsersModel.updateOne({'accountData.email': email}, {$set: {'emailConfirmation.confirmationCode': confirmationCode}})
        return result.matchedCount === 1
    },
    async updateUserRecoveryPasswordCodeByEmail(email: string, recoveryPasswordCode: string): Promise<boolean> {
        const result = await UsersModel.updateOne({'accountData.email': email}, {$set: {'emailConfirmation.recoveryCode': recoveryPasswordCode}})
        return result.matchedCount === 1
    },
    async updateCheckConfirmCode(code: string): Promise<boolean> {
        const result = await UsersModel.updateOne({'emailConfirmation.confirmationCode': code}, {$set: {'emailConfirmation.isConfirmed': true}})
        return result.matchedCount === 1
    },
    async updatePasswordRecoveryCode(code: string, password: string): Promise<boolean> {
        const result = await UsersModel.updateOne({'emailConfirmation.recoveryCode': code}, {$set: {'accountData.passwordHash': password}})
        return result.matchedCount === 1
    },
    async findUserByCode(code: string): Promise<UserDbType | null> {
        return UsersModel.findOne({'emailConfirmation.confirmationCode': code}, {projection: {_id: 0}});
    },
    async _findUsersByFilters(filter: Filter<UserDbType>, queryData: UsersPaginationQueryType): Promise<PaginationResultType> {
        const totalCount = await UsersModel.countDocuments({filter})
        const page = Number(queryData.pageNumber)
        const pageSize = Number(queryData.pageSize)
        const result = await UsersModel.find({filter}, {
            projection: {
                _id: 0,
                'accountData.passwordHash': 0,
                'accountData.passwordSalt': 0,
                emailConfirmation: 0,
            },
        })
            .sort([[queryData.sortBy, queryData.sortDirection]])
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean() as []
        const items = this._mapUserDbToResponse(result)
        return paginationResult(page, pageSize, totalCount, items)
    },
    _mapUserDbToResponse(users: UserDbType[]): UserResponseType[] {
        return users.map(u => ({
            id: u.id,
            login: u.accountData.login,
            email: u.accountData.email,
            createdAt: u.accountData.createdAt
        }))
    },


}
