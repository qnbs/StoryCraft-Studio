// QNBS-v3: lightweight first-use flag backed by localStorage. Mirrors the LoRA onboarding
// dismiss pattern (features/lora/loraSlice) without a Redux/Zustand dependency, so any component
// can show a one-time coachmark that never reappears once dismissed.
import { useCallback, useState } from 'react';

const STORAGE_PREFIX = 'worldscript-hint-';

/**
 * Returns `[seen, markSeen]` for a one-time UI hint keyed by `key`.
 * Storage failures (private mode, blocked storage) degrade gracefully to in-session dismissal.
 */
export function useFirstUseFlag(key: string): [boolean, () => void] {
  const storageKey = `${STORAGE_PREFIX}${key}`;
  const [seen, setSeen] = useState<boolean>(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(storageKey) === '1';
    } catch {
      return false;
    }
  });

  const markSeen = useCallback(() => {
    setSeen(true);
    try {
      localStorage.setItem(storageKey, '1');
    } catch {
      // QNBS-v3: storage unavailable — keep the in-session dismissal from setSeen(true).
    }
  }, [storageKey]);

  return [seen, markSeen];
}
