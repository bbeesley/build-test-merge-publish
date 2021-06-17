import { getInput } from '@actions/core';
import * as github from '@actions/github';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';

import { isDependabot, loggedExec } from './utils';

export async function install(): Promise<void> {
  // for dependabot PRs, check out PR head before install
  if (isDependabot()) {
    const requestPayload = github.context.payload as PullRequestEvent;
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

  // for dependabot PRs, check out base for build/test
  if (isDependabot()) {
    const requestPayload = github.context.payload as PullRequestEvent;
    const { ref } = requestPayload.pull_request.base;
    console.log(`checking out ref: ${ref}`);
    await loggedExec('git', ['checkout', ref]);
  }

  // build (if needed)
  const buildCommand = getInput('build-command');
  if (buildCommand && buildCommand.length > 0) {
    const buildCommandComponents = buildCommand.split(' ');
    const buildBin = buildCommandComponents.shift();
    if (buildBin) await loggedExec(buildBin, buildCommandComponents);
  }
}
