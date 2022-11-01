export type UsersPaginationQueryType = {
    searchLoginTerm: string,
    searchEmailTerm: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: "asc" | "desc";
}
export type UserType = {
    id: string,
    login: string,
    email: string,
    createdAt: string,
    passwordHash: string,
    passwordSalt: string,
}

export type UserDbType = {
    id: string
    accountData: {
        login: string,
        email: string,
        passwordHash: string,
        passwordSalt: string,
        createdAt: string,
    },
    emailConfirmation: {
        confirmationCode: any,
        expirationData: Date,
        isConfirmed: boolean,
    }
}
export type UserResponseType = {
    id: string,
    login: string,
    email: string,
    createdAt: string,
}

