import { getInput } from '@actions/core';
import { exec } from '@actions/exec';
import * as github from '@actions/github';
import { PushEvent } from '@octokit/webhooks-definitions/schema';
import { restoreCache } from './utils';

async function main(): Promise<void> {
  await restoreCache();
  await exec('npm', ['test']);
  if (github.context.eventName === 'push') {
    const mainBranch = getInput('mainBranch');
    const pushPayload = github.context.payload as PushEvent;
    if (pushPayload.ref.split('/').pop() === mainBranch) {
      const releaseCommand = getInput('releaseCommand');
      const releaseCommandComponents = releaseCommand.split(' ');
      const releaseBin = releaseCommandComponents.shift() || 'npm';
      await exec(releaseBin, releaseCommandComponents);
    }
  }
}

main();
