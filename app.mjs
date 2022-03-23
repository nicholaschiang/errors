import { TwitterApiRateLimitPlugin } from '@twitter-api-v2/plugin-rate-limit';
import { TwitterApi } from 'twitter-api-v2';
import express from 'express';

function doSomethingAsync() {
  return new Promise((res, rej) => setTimeout(res, 500));
}

async function getTwitterClient() {
  await doSomethingAsync();
  // Get rid of this plugin and the error catches as expected.
  const plugin = new TwitterApiRateLimitPlugin();
  return new TwitterApi('INVALID_TOKEN', { plugins: [plugin] });
}

const app = express();
const port = 3001;

app.get('/error', async (req, res) => {
  try {
    await doSomethingAsync();
    const api = await getTwitterClient();
    await Promise.all(Array(5).fill(null).map(async () => {
      await doSomethingAsync();
      await api.v2.listTweets('INVALID_LIST_ID');
    }));
    res.status(200).send('Success');
  } catch (e) {
    // When the plugin is used, this still catches but an error is emitted
    // down the line causing the Node.js process to exit with code 1.
    console.error('Caught error:', e.stack);
    res.status(500).send('Error');
  }
});

app.listen(port, () => console.log(`API listening on port ${port}`));
