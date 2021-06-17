import { setFailed } from '@actions/core';
import * as github from '@actions/github';

import { approvePR, mergePR } from './utils';

async function post(): Promise<void> {
}

post().catch(error => {
  setFailed(error.message);
});
