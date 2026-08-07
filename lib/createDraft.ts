// Save this file as lib/createDraft.ts
//
// UPDATED (2026-08-06, multi-brand): `selectedSets: string[]` is
// replaced by `selectedGuangnaSets`/`selectedLanguoSets` (two separate
// arrays), matching create/page.tsx's split picker state. Everything
// else (photo persistence, size-limit behavior, save/load/clear API)
// is unchanged from the previous version.

const DRAFT_KEY = "cbs-create-draft";

export interface CreateDraft {
  photoBase64?: string;
  photoName?: string;
  photoType?: string;
  email?: string;
  level?: string;
  selectedGuangnaSets?: string[];
  selectedLanguoSets?: string[];
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