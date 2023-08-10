import { json, LoaderArgs } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({params}: LoaderArgs) => {
  const joke = await db.joke.findUnique({where: {id: params.jokeId}})

  if (!joke) {
    throw new Error('Joke not found')
  }

  return json({joke})
}
export default function JokeSingle() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{data.joke.name}</h1>
      <p>{data.joke.content}</p>
    </div>
  )
}
