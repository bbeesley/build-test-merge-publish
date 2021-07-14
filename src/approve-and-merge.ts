import {
  approvePR,
  isAutoMergeCandidate,
  isDependabotPRTarget,
  mergePR,
} from './utils';

export async function approveAndMerge(): Promise<void> {
  if (isDependabotPRTarget() || isAutoMergeCandidate()) {
    console.log('auto approving and merging');
    await approvePR();
    await mergePR();
  }
}
