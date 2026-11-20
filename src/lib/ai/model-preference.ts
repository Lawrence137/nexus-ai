const MODEL_STORAGE_KEY = "nexus-selected-model";

export function getSavedModel(): string | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(MODEL_STORAGE_KEY);
}

export function saveSelectedModel(modelId: string): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(MODEL_STORAGE_KEY, modelId);
}