import { setFailed } from '@actions/core';

// eslint-disable-next-line @typescript-eslint/no-empty-function
async function pre(): Promise<void> {}

pre().catch((error) => {
  setFailed(error.message);
});
