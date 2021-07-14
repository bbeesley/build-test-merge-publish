import { getInput, setSecret } from '@actions/core';
import { exec, ExecOptions } from '@actions/exec';
import * as github from '@actions/github';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';

import { MergeMethod, PullRequest, SimplePullRequest } from './@types';
import { EnableAutoMerge } from './generated/graphql';

export async function loggedExec(
  commandLine: string,
  args?: string[],
  options: ExecOptions = {}
): Promise<void> {
  let errors = '';
  const res = await exec(commandLine, args, {
    env: { ...(process.env as Record<string, string>) },
    listeners: {
      stderr: (data: Buffer) => {
        errors += data.toString();
      },
    },
    ...options,
  });
  if (res > 0) throw new Error(`Failed to run operation ${errors}`);
}

export async function npmAuth(): Promise<void> {
  const privateRegistry = getInput('private-npm-registry');
  const privateRegistryToken = getInput('private-npm-token');
  const npmToken = process.env.NPM_TOKEN;
  if (npmToken || (privateRegistryToken && privateRegistry)) {
    if (privateRegistryToken && privateRegistry) {
      setSecret(privateRegistryToken);
      console.log('authenticating with registry', privateRegistry);
      await exec(
        `/bin/bash -c "echo //${privateRegistry}/:_authToken=${privateRegistryToken} >> .npmrc"`
      );
    }
    if (npmToken && npmToken.length > 0) {
      await exec(
        `/bin/bash -c "echo //registry.npmjs.org/:_authToken=${npmToken} >> .npmrc"`
      );
    }
    await exec('cp', [`.npmrc`, `${process.env.HOME}/.npmrc`]);
  }
}

function getMergeMethod(): MergeMethod {
  const mergeMethod = getInput('merge-method');
  const result = Object.values(MergeMethod).find(
    (m) => m.toLowerCase() === mergeMethod.toLowerCase()
  );
  return result ?? MergeMethod.Rebase;
}

export async function getPRByNumber(): Promise<PullRequest> {
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

async function getPrByCommitRef(
  commitId: string
): Promise<SimplePullRequest | undefined> {
  const { repo, owner } = github.context.repo;
  const ok = github.getOctokit(
    process.env.GITHUB_TOKEN ?? (process.env.GH_TOKEN as string)
  );
  const response = await ok.rest.pulls.list({
    owner,
    repo,
    sort: 'updated',
    direction: 'desc',
    state: 'open',
  });

  return response.data.find((pr) => pr.head.sha === commitId);
}

function getPr(): Promise<SimplePullRequest | PullRequest | undefined> {
  if (github.context.payload.pull_request?.number) {
    return getPRByNumber();
  }
  return getPrByCommitRef(github.context.sha);
}

export async function approvePR() {
  const ok = github.getOctokit(
    process.env.GITHUB_TOKEN ?? (process.env.GH_TOKEN as string)
  );
  const pullRequest = await getPr();
  if (pullRequest) {
    await ok.rest.pulls.createReview({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: pullRequest.number,
      event: 'APPROVE',
    });
  } else {
    console.log(`no pull request found for ref ${github.context.sha}`);
  }
}

export async function mergePR() {
  const ok = github.getOctokit(
    process.env.GITHUB_TOKEN ?? (process.env.GH_TOKEN as string)
  );
  const query = EnableAutoMerge.loc!.source!.body;
  const pullRequest = await getPr();
  if (pullRequest) {
    const res = await ok.graphql({
      query,
      pullRequestId: pullRequest.node_id,
      mergeMethod: getMergeMethod(),
    });
    console.log('automerge response', JSON.stringify(res));
  } else {
    console.log(`no pull request found for ref ${github.context.sha}`);
  }
}

export function isDependabot(): boolean {
  const dependabot = github.context.actor === 'dependabot[bot]';
  if (dependabot) console.log('detected dependabot actor');
  return dependabot;
}

export function isDependabotPRTarget(): boolean {
  const dependabot =
    github.context.eventName === 'pull_request_target' && isDependabot();
  if (dependabot) console.log('detected dependabot PR');
  return dependabot;
}

export function isAutoMergeCandidate(): boolean {
  const autoMergeUser = getInput('auto-merge-bot');
  const shouldAutoMerge =
    github.context.eventName === 'push' &&
    github.context.actor === autoMergeUser;
  if (shouldAutoMerge) console.log('detected auto merge PR candidate');
  if (shouldAutoMerge)
    console.log(
      `actor: ${github.context.actor}, auto-merge-bot: ${autoMergeUser}`
    );
  return shouldAutoMerge;
}
