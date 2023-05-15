import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { email: emailToAdd } = addFriendValidator.parse(body.email);

        const idToAdd = await fetchRedis('get', `user:email:${emailToAdd}`) as string;


        if (!idToAdd) return new NextResponse("This person does not exist", { status: 400 });
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse("Not authenticated", { status: 401 });
        if (idToAdd === session.user.id) return new NextResponse("You can't add yourself", { status: 400 });

        //check if user is already a friend
        const isAlreadyAdded = await fetchRedis(
            "sismember", `user:${idToAdd}:incoming_friend_requests`,
            session.user.id
        ) as 0 | 1;
        if (isAlreadyAdded) return new NextResponse("You already added this person", { status: 400 });

        const isAlreadyFriends = await fetchRedis(
            "sismember", `user:${session.user.id}:friends`,
            idToAdd
        ) as 0 | 1;
        if (isAlreadyFriends) return new NextResponse("You already added this person", { status: 400 });
        //valid request, send req

        pusherServer.trigger(toPusherKey(`user:${idToAdd}:incoming_friend_requests`), 'incoming_friend_request', {
            senderId: session.user.id,
            senderEmail: session.user.email
        })

        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);
        return new NextResponse("Friend request sent", { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse('Invalid request payload', { status: 422 });
        };
        return new NextResponse('Invalid request', { status: 400 });
    }
}