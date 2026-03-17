export const PREVIEW_WINDOW_NAME = "fanwall_scene_preview";
export const LIVE_WINDOW_NAME = "fanwall_live_screen";

export function openNamedWindow(url: string, name: string) {
  // Prefer reusing an existing named tab/window.
  // Opening an empty window first also keeps the call within the user gesture,
  // which reduces the chance of popup blockers when navigation happens later.
  let w: Window | null = null;
  try {
    w = window.open("", name);
  } catch {
    w = null;
  }

  if (!w) {
    try {
      w = window.open(url, name);
    } catch {
      w = null;
    }
  } else {
    try {
      const target = new URL(url, window.location.href).toString();
      // Use replace to avoid growing the history stack inside the named tab.
      w.location.replace(target);
    } catch {
      try {
        w.location.href = url;
      } catch {
        // ignore
      }
    }
  }

  if (w) {
    try {
      w.focus();
    } catch {
      // ignore
    }
  }
  return w;
}
