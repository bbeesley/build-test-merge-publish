import { getInput, setFailed } from '@actions/core';
import * as github from '@actions/github';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';

import { loggedExec } from './utils';

async function pre(): Promise<void> {
}

pre().catch(error => {
  setFailed(error.message);
});
