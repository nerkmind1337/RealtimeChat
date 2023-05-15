import { Icon, Icons } from '@/components/icons';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import SignOutButton from '@/components/SignOutButton';
import FriendRequestSideBarOption from '@/components/FriendRequestSideBarOption';
import { fetchRedis } from '@/helpers/redis';
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id';
import SidebarChatList from '@/components/SidebarChatList';

interface LayoutProps {
    children: ReactNode;
}

interface SideBarOption {
    id: number;
    name: string;
    href: string;
    Icon: Icon;
}

const sideBarOptions: SideBarOption[] = [
    {
        id: 1,
        name: 'Add friend',
        href: '/dashboard/add',
        Icon: 'UserPlus'
    }
]
const Layout = async ({ children }: LayoutProps) => {

    const session = await getServerSession(authOptions);
    const unseenRequestCount = (
        await fetchRedis(
            'smembers', `user:${session?.user.id}:incoming_friend_requests`
        ) as User[]
    ).length;


    if (!session) notFound(); // this is a fallback, routes are also protected by the middleware

    const friends = await getFriendsByUserId(session.user.id);
    return (
        <div className='w-full flex h-screen'>
            <div className='flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6'>
                <Link href='/dashboard' className='flex h-16 shrink-0 items-center'>
                    <Icons.Logo className='h-8 w-auto text-indigo-600' />
                </Link>

                {friends.length > 0 ? <div className='text-xs font-semibold leading-6 text-gray-400'>
                    your chats
                </div> : null}

                <nav className='flex flex-1 flex-col'>
                    <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                        <li>
                            <SidebarChatList sessionId={session.user.id} friends={friends} />
                        </li>
                        <li>
                            <div className='text-xs font-semibold leading-6 text-gray-400'>
                                Overview
                            </div>
                            <ul role='list' className='-mx-2 mt-2 space-y-1'>
                                {sideBarOptions.map((option) => {
                                    const Icon = Icons[option.Icon];
                                    return (
                                        <li key={option.id}>
                                            <Link href={option.href} className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold '>
                                                <span className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:border-indigo-600 group-hover:text-indigo-600 flex w-6 h-6 shrink-0 items-center justify-center rounded-lg border-text-[0.625rem] font-medium bg-white'>
                                                    <Icon className='w-4 h-4' />
                                                </span>
                                                <span className='truncate'>{option.name}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                                <li>
                                    <FriendRequestSideBarOption
                                        sessionId={session.user.id}
                                        initialUnseenRequestCount={unseenRequestCount}
                                    />
                                </li>
                            </ul>
                        </li>


                        <li className='-mx-6 mt-auto flex items-center'>
                            <div className='flex flex-1 items-center gap-x-4 px-6 py-4 text-sm font-semibold leading-6 text-gray-900'>
                                <div className='relative h-8 w-8 bg-gray-50'>
                                    <Image
                                        fill
                                        referrerPolicy='no-referrer'
                                        className='rounded-full'
                                        src={session.user.image || ''}
                                        alt='Your Profile Picture'

                                    />
                                </div>
                                <span className='sr-only'>Your Profile</span>
                                <div className='flex flex-col'>
                                    <span aria-hidden='true'>{session.user.name}</span>
                                    <span className='text-xs text-zink-400' aria-hidden='true'>
                                        {session.user.email}
                                    </span>
                                </div>
                            </div>
                            <SignOutButton className='h-full aspect-square' />
                        </li>
                    </ul>
                </nav>
            </div>
            <aside className='max-h-screen container py-16 md:py12 w-full'> {children} </aside>

        </div>
    );
};
export default Layout;