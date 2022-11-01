import {MongoClient} from "mongodb"
import { CommentsType} from "../types/commentsType";
import {UserDbType} from "../types/usersType"
import {PostsResponseType} from "../types/postsType"
import {BlogsResponseType} from "../types/blogsType"
import {settings} from "../settings";

const mongoUri = settings.MONGO_URI

const client = new MongoClient(mongoUri)

const db = client.db("Profile")
export const CommentsCollection = db.collection<CommentsType>("comments")
export const BlogsCollection = db.collection<BlogsResponseType>("blogs")
export const PostsCollection = db.collection<PostsResponseType>("posts")
export const UsersCollection = db.collection <UserDbType>("users")

export async function runDb() {
    try {
        await client.connect()
        await client.db('blogs').command({ping: 1})
    } catch {
        await client.close()
    }
}