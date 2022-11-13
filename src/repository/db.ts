import {MongoClient} from "mongodb"
import {CommentsType} from "../types/commentsType";
import {UserDbType} from "../types/usersType"
import {PostsType} from "../types/postsType"
import {BlogsType} from "../types/blogsType"
import {settings} from "../settings";
import {DeviceType} from "../types/devicesTypes";

const mongoUri = settings.MONGO_URI

const client = new MongoClient(mongoUri)

const db = client.db("Profile")
export const RefreshTokenCollection = db.collection<RefreshTokenType>('refreshToken')
export const CommentsCollection = db.collection<CommentsType>("comments")
export const BlogsCollection = db.collection<BlogsType>("blogs")
export const PostsCollection = db.collection<PostsType>("posts")
export const UsersCollection = db.collection <UserDbType>("users")
export const DevicesCollection = db.collection<DeviceType>("device")

export async function runDb() {
    try {
        await client.connect()
        await client.db('blogs').command({ping: 1})
    } catch {
        await client.close()
    }
}