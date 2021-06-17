import * as cache from '@actions/cache';
import { getInput } from '@actions/core';
import { exec, ExecOptions } from '@actions/exec';
import * as github from '@actions/github';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';
import { PullRequest, MergeMethod } from './@types';

import { EnableAutoMerge } from './generated/graphql';

export async function loggedExec(commandLine: string, args?: string[], options?: ExecOptions): Promise<void> {
  let errors = '';
  const res = await exec(commandLine, args, {
    listeners: {
      stdout: (data: Buffer) => {
        console.log(data.toString());
      },
      stderr: (data: Buffer) => {
        errors += data.toString();
        console.error(data.toString());
      }
    }
  });
  if (res > 0) throw new Error(`Failed to run operation ${errors}`);
}

export async function getPR(): Promise<PullRequest> {
  const requestPayload = github.context.payload as PullRequestEvent;
  const ok = github.getOctokit(
    process.env.GITHUB_TOKEN ?? (process.env.GH_TOKEN as string)
  );
  const res = await ok.rest.pulls.get({
    ...github.context.repo,
    pull_number: requestPayload.pull_request.number,
  });
  return res.data;
}

export async function approvePR() {
  const ok = github.getOctokit(
    process.env.GITHUB_TOKEN ?? (process.env.GH_TOKEN as string)
  );
  const requestPayload = github.context.payload as PullRequestEvent;
  await ok.rest.pulls.createReview({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: requestPayload.pull_request.number,
    event: 'APPROVE',
  });
}

export async function mergePR() {
  const ok = github.getOctokit(
    process.env.GITHUB_TOKEN ?? (process.env.GH_TOKEN as string)
  );
  const query = EnableAutoMerge.loc!.source!.body
  const pullRequest = await getPR();
  await ok.graphql({
      query,
      pullRequestId: pullRequest.node_id,
      mergeMethod: 'rebase',
    });
}

export function isDependabot(): boolean {
  const isDependabot = github.context.eventName === 'pull_request_target' &&
    github.context.actor === 'dependabot[bot]';
  if (isDependabot) console.log('detected dependabot PR');
    return isDependabot;
}
