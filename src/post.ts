import { setFailed } from '@actions/core';

// eslint-disable-next-line @typescript-eslint/no-empty-function
async function post(): Promise<void> {}

post().catch((error) => {
  setFailed(error.message);
});
