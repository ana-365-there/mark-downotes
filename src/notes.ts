// notes.ts
const KEY = "note";

export function saveNote(content: string): void {
  localStorage.setItem(KEY, content);
}

export function loadNote(): string {
  return localStorage.getItem(KEY) ?? "";
}

export function clearNote(): void {
  localStorage.removeItem(KEY);
}