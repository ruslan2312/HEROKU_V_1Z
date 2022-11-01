export type BlogsResponseType = {
    id: string,
    name: string,
    youtubeUrl: string,
    createdAt: string;
}
export type BlogPaginationQueryType = {
    searchNameTerm: string,
    pageSize: number,
    pageNumber: number,
    sortBy: string,
    sortDirection: "asc" | "desc"; //todo Enum
}

