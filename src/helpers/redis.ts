const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN;

type Command = 'zrange' | 'sismember' | 'get' | 'smembers'

export async function fetchRedis(
    command: Command,
    ...args: (string | number)[]
) {
    const commmandUrl = `${upstashRedisRestUrl}/${command}/${args.join('/')}`;
    const response = await fetch(commmandUrl, { headers: { Authorization: `Bearer ${authToken}` }, cache: 'no-store' })
    if (!response.ok) throw new Error(`Error executing redis command: ${response.statusText}`)
    const data = await response.json();
    return data.result;
}