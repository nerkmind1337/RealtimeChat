import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

        const session = await getServerSession(authOptions);
        if (!session) return new Response("Not authenticated", { status: 401 });
        if (idToAdd === session.user.id) return new Response("You can't add yourself", { status: 400 });

        //check if user is already a friend
        const isAlreadyAdded = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)
        if (isAlreadyAdded) return new Response("You already added this person", { status: 400 });

        const hasFriendRequst = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd)
        if (!hasFriendRequst) return new Response("You don't have a friend request from this person", { status: 400 });

        await db.sadd(`user:${session.user.id}:friends`, idToAdd);

        await db.sadd(`user:${idToAdd}:friends`, session.user.id);

        //await db.srem(`user:${session.user.id}:outbound_friend_requests`, session.user.id);
        db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd);
        return new Response('OK')


    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload', { status: 422 });
        }

        return new Response('Invalid request', { status: 400 });
    }
}