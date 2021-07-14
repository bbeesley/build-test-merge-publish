import {
  approvePR,
  isAutoMergeCandidate,
  isDependabotPRTarget,
  mergePR,
} from './utils';

export async function approveAndMerge(): Promise<void> {
  if (isDependabotPRTarget() || isAutoMergeCandidate()) {
    console.log('auto approving and merging');
    try {
      await approvePR();
      await mergePR();
    } catch (err) {
      console.log('unable to auto approve/merge PR', err.message);
    }
  }
}
