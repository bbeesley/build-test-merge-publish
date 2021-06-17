import { approvePR, isDependabot, mergePR } from './utils';

export async function approveAndMerge(): Promise<void> {
  if (isDependabot()) {
    console.log('auto approving and merging');
    await approvePR();
    await mergePR();
  }
}
