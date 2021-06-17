import { getInput } from '@actions/core';
import { exec } from '@actions/exec';
import * as github from '@actions/github';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';
import { saveCache } from './utils';

async function pre(): Promise<void> {
  if (
    github.context.eventName === 'pull_request_target' &&
    github.context.actor === 'dependabot[bot]'
  ) {
    const requestPayload = github.context.payload as PullRequestEvent;
    const { ref } = requestPayload.pull_request.head;
    await exec('git', ['fetch']);
    await exec('git', ['checkout', ref]);
  }
  // install deps
  const installCommand = getInput('install-command');
  const installCommandComponents = installCommand.split(' ');
  const installBin = installCommandComponents.shift() || 'npm';
  await exec(installBin, installCommandComponents);

  // build (if needed)
  const buildCommand = getInput('build-command');
  if (buildCommand && buildCommand.length > 0) {
    const buildCommandComponents = buildCommand.split(' ');
    const buildBin = buildCommandComponents.shift();
    if (buildBin) await exec(buildBin, buildCommandComponents);
  }
  await saveCache();
}

pre();
