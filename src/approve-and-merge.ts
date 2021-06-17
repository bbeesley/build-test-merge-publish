import * as github from '@actions/github';

import { approvePR, mergePR } from './utils';

// eslint-disable-next-line import/prefer-default-export
export async function approveAndMerge(): Promise<void> {
  if (
    github.context.eventName === 'pull_request_target' &&
    github.context.actor === 'dependabot[bot]'
  ) {
    console.log('detected dependabot PR, auto approving and merging');
    await approvePR();
    await mergePR();
  }
}
