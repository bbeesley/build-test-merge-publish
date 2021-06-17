import * as cache from '@actions/cache';
import { getInput } from '@actions/core';
import { exec, ExecOptions } from '@actions/exec';
import * as github from '@actions/github';
import { PullRequestEvent } from '@octokit/webhooks-definitions/schema';

const defaultCachePaths = [
  'node_modules',
  'packages/*/node_modules/',
  'dist',
  'packages/*/dist',
];

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

export function getCachePaths(): string[] {
  const cachePaths = (getInput('cache-paths') ?? '')
    .split(',')
    .filter((e) => e.length > 0);
  return [...defaultCachePaths, ...cachePaths];
}

export function getCacheKey(): string {
  return `btmp-pre-${github.context.runId}`;
}

export async function saveCache(): Promise<void> {
  await cache.saveCache(getCachePaths(), getCacheKey());
}

export async function restoreCache(): Promise<void> {
  await cache.restoreCache(getCachePaths(), getCacheKey());
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
  const requestPayload = github.context.payload as PullRequestEvent;
  await ok.rest.pulls.merge({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: requestPayload.pull_request.number,
  });
}
