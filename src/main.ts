import { getInput } from '@actions/core';
import * as github from '@actions/github';
import { PushEvent } from '@octokit/webhooks-definitions/schema';

import { install } from './install';
import { loggedExec, restoreCache } from './utils';

async function main(): Promise<void> {
  await install();
  await restoreCache();
  await loggedExec('npm', ['test']);
  if (github.context.eventName === 'push') {
    const mainBranch = getInput('main-branch');
    const pushPayload = github.context.payload as PushEvent;
    if (pushPayload.ref.split('/').pop() === mainBranch) {
      const releaseCommand = getInput('release-command');
      const releaseCommandComponents = releaseCommand.split(' ');
      const releaseBin = releaseCommandComponents.shift() || 'npm';
      await loggedExec(releaseBin, releaseCommandComponents);
    }
  }
}

main();
