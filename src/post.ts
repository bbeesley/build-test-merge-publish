import * as github from '@actions/github';

import { approvePR, mergePR, restoreCache } from './utils';

async function post(): Promise<void> {
  await restoreCache();
  if (
    github.context.eventName === 'pull_request_target' &&
    github.context.actor === 'dependabot[bot]'
  ) {
    await approvePR();
    await mergePR();
  }
}

post();
