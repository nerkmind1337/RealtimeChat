import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { FC } from 'react'

interface pageProps {

}

const Page = async ({ }) => {

    const session = await getServerSession(authOptions)
    return <pre>dashboard</pre>
}

export default Page