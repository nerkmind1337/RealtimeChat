'use client'

import { pusherClient } from '@/lib/pusher';
import { chatHrefConstructor, toPusherKey } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import UnseenChatToast from './UnseenChatToast';

interface SidebarChatListProps {
    friends: User[];
    sessionId: string;
}

interface ExtendedMessage extends Message {
    senderImg: string;
    senderName: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
    const router = useRouter();
    const pathName = usePathname();

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

        const newFriendHandler = () => {
            router.refresh();
        }

        const chatHandler = (message: ExtendedMessage) => {
            const shouldNotify =
                pathName !==
                `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`
            if (!shouldNotify) return;
            console.log('should notify', shouldNotify);
            //should be notified
            toast.custom((t) => (
                <UnseenChatToast
                    t={t}
                    senderId={message.senderId}
                    senderImage={message.senderImg}
                    senderMessage={message.text}
                    senderName={message.senderName}
                    sessionId={sessionId}
                />
            ));
            setUnseenMessages((prev) => [...prev, message]);
        }

        pusherClient.bind('new_message', chatHandler);
        pusherClient.bind('new_friend', newFriendHandler);

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
        }
    }, [pathName, sessionId, router])

    useEffect(() => {
        if (pathName?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathName.includes(msg.senderId))
            })
        }
    }, [pathName])

    return <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
        {friends.sort().map((friend) => {
            const unseenMessagesFromFriend = unseenMessages.filter((msg) => msg.senderId === friend.id).length;
            return (
                <li key={friend.id} className=''>
                    <a className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold' href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}>
                        {friend.email}
                        {unseenMessagesFromFriend > 0 ?
                            <div className='bg-indigo-600 front-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                                {unseenMessagesFromFriend}
                            </div> : null}
                    </a>
                </li>
            )
        })}
    </ul>
}


export default SidebarChatList