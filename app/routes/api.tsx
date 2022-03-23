import { ApiResponseError, TwitterApi } from 'twitter-api-v2';
import { TwitterApiRateLimitPlugin } from '@twitter-api-v2/plugin-rate-limit';
import type { LoaderFunction } from 'remix';

function doSomethingAsyncAndError() {
  return new Promise((res, rej) => {
    rej(new ApiResponseError('Fake Error', { code: 429 }));
  });
}

function doSomethingAsync() {
  return new Promise((res, rej) => {
    setTimeout(res, 500);
  });
}

async function getTwitterClient() {
  await doSomethingAsync();
  // Get rid of this plugin line and Remix's error catching works as expected.
  const plugin = new TwitterApiRateLimitPlugin();
  return new TwitterApi('INVALID_TOKEN', { plugins: [plugin] });
}

export const loader: LoaderFunction = async () => {
  await doSomethingAsync();
  const api = await getTwitterClient();
  await Promise.all(Array(5).fill(null).map(async () => {
    await doSomethingAsync();
    await api.v2.listTweets('INVALID_LIST_ID');
  }));
};
