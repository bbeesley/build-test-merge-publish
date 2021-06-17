import { getInput } from '@actions/core';
import * as github from '@actions/github';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';

import { loggedExec, restoreCache, saveCache } from './utils';

// eslint-disable-next-line import/prefer-default-export
export async function install(): Promise<void> {
  await restoreCache();
  if (
    github.context.eventName === 'pull_request_target' &&
    github.context.actor === 'dependabot[bot]'
  ) {
    const requestPayload = github.context.payload as PullRequestEvent;
    console.log(
      'detected dependabot PR',
      JSON.stringify(requestPayload, null, 2)
    );
    const { ref } = requestPayload.pull_request.head;
    console.log(`checking out ref: ${ref}`);
    await loggedExec('git', ['fetch']);
    await loggedExec('git', ['checkout', ref]);
  }
  // install deps
  const installCommand = getInput('install-command');
  const installCommandComponents = installCommand.split(' ');
  const installBin = installCommandComponents.shift() || 'npm';
  await loggedExec(installBin, installCommandComponents);

  // build (if needed)
  const buildCommand = getInput('build-command');
  if (buildCommand && buildCommand.length > 0) {
    const buildCommandComponents = buildCommand.split(' ');
    const buildBin = buildCommandComponents.shift();
    if (buildBin) await loggedExec(buildBin, buildCommandComponents);
  }
  await saveCache();
}
