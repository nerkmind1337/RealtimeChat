import { fetchRedis } from "./redis"

export const getFriendsByUserId = async (userId: string) => {
    const friendIds = await fetchRedis('smembers', `user:${userId}:friends`) as string[];
    const friends = await Promise.all(
        friendIds.map(async (friendId) => {
            const friend = JSON.parse(await fetchRedis('get', `user:${friendId}`) as string) as User;
            return friend;
        }))

    return friends;
}