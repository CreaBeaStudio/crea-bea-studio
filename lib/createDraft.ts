// Save this file as lib/createDraft.ts
//
// The /create page's working state (most importantly the uploaded
// photo) used to vanish on any navigation away and back -- to
// /examples (which customers are actively encouraged to visit, to see
// the resolution comparison, before finishing their order) and via
// /confirm's "No, I want to make changes" button. Every OTHER field
// (email, level, sets, indPens) already survived because it round-trips
// through URL search params, but a File object fundamentally can't be
// encoded into a URL -- so the photo was always the one thing lost.
//
// This persists the whole in-progress draft to sessionStorage instead,
// with the photo base64-encoded. sessionStorage (not localStorage) is
// deliberate: the draft should survive normal navigation within the
// session but not linger indefinitely across visits.
//
// KNOWN LIMIT: sessionStorage has a per-origin size ceiling (commonly
// ~5MB across browsers) and base64 adds ~33% overhead on top of the
// photo's actual file size. A typical phone photo (3-8MB) can exceed
// that once encoded. saveDraft() below fails silently (console.warn,
// no crash, no user-facing error) if the quota is exceeded -- the
// draft just won't persist for that one oversized photo, same as
// today's behavior. If this turns out to bite often in practice, the
// fix is switching photoBase64's storage to IndexedDB (no realistic
// size ceiling) while keeping everything else here unchanged.

const DRAFT_KEY = "cbs-create-draft";

export interface CreateDraft {
  photoBase64?: string;
  photoName?: string;
  photoType?: string;
  email?: string;
  level?: string;
  selectedSets?: string[];
  individualPens?: string;
  wantsFullGuide?: boolean;
  previewSkipped?: boolean;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function base64ToFile(base64: string, name: string, type: string): Promise<File> {
  const res = await fetch(base64);
  const blob = await res.blob();
  return new File([blob], name, { type });
}

export function saveDraft(draft: CreateDraft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    // Most likely QuotaExceededError from a large photo -- see the
    // KNOWN LIMIT note above. Not fatal, just means this particular
    // draft won't survive a navigation away.
    console.warn("[createDraft] Could not save draft to sessionStorage (likely too large):", e);
  }
}

export function loadDraft(): CreateDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as CreateDraft) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {}
}
