export const PREVIEW_WINDOW_NAME = "fanwall_scene_preview";

export function openNamedWindow(url: string, name: string) {
  const w = window.open(url, name);
  if (w) {
    try {
      w.focus();
    } catch {
      // ignore
    }
  }
  return w;
}

