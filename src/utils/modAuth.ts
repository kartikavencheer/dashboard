const MOD_AUTH_PAYLOAD_KEY = "fanwall_mod_auth_payload";
const MOD_AUTH_TOKEN_KEY = "fanwall_mod_auth_token";
const MOD_ROLE_ID_KEY = "fanwall_mod_role_id";
const MOD_SYSTEMUSER_ID_KEY = "fanwall_mod_systemuser_id";
const MOD_DISPLAY_NAME_KEY = "fanwall_mod_display_name";
const MOD_ROLE_LABEL_KEY = "fanwall_mod_role_label";

function extractRoleAndSystemUserId(payload: any): { roleId: string; systemUserId: string } {
  const candidates = [
    payload,
    payload?.data,
    payload?.value,
    payload?.data?.value,
    payload?.user,
    payload?.data?.user,
    payload?.result,
    payload?.data?.result,
  ];

  let roleId = "";
  let systemUserId = "";

  for (const obj of candidates) {
    if (!obj || typeof obj !== "object") continue;

    roleId =
      roleId ||
      String(
        obj.role_id ??
          obj.roleId ??
          obj.role ??
          obj.user_role_id ??
          obj.userRoleId ??
          "",
      );

    systemUserId =
      systemUserId ||
      String(
        obj.systemuser_id ??
          obj.systemuserId ??
          obj.system_user_id ??
          obj.systemUserId ??
          obj.id ??
          obj.user_id ??
          obj.userId ??
          "",
      );

    if (roleId && systemUserId) break;
  }

  return { roleId: roleId && roleId !== "undefined" ? roleId : "", systemUserId: systemUserId && systemUserId !== "undefined" ? systemUserId : "" };
}

function extractDisplayNameAndRoleLabel(payload: any): { displayName: string; roleLabel: string } {
  const candidates = [
    payload,
    payload?.data,
    payload?.value,
    payload?.data?.value,
    payload?.user,
    payload?.data?.user,
    payload?.result,
    payload?.data?.result,
  ];

  let displayName = "";
  let roleLabel = "";

  const pick = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const str = String(value).trim();
    if (!str || str === "undefined" || str === "null") return "";
    return str;
  };

  for (const obj of candidates) {
    if (!obj || typeof obj !== "object") continue;

    displayName =
      displayName ||
      pick(
        (obj as any).display_name ??
          (obj as any).displayName ??
          (obj as any).full_name ??
          (obj as any).fullName ??
          (obj as any).user_name ??
          (obj as any).userName ??
          (obj as any).username ??
          (obj as any).name ??
          (obj as any).email_address ??
          (obj as any).email ??
          (obj as any).emailaddress,
      );

    const roleCandidate =
      (obj as any).role_name ??
      (obj as any).roleName ??
      (obj as any).role_label ??
      (obj as any).roleLabel ??
      (obj as any).user_role ??
      (obj as any).userRole ??
      (obj as any).role ??
      (obj as any).role_title ??
      (obj as any).roleTitle;

    roleLabel =
      roleLabel ||
      (typeof roleCandidate === "object" && roleCandidate
        ? pick(
            (roleCandidate as any).role_name ??
              (roleCandidate as any).roleName ??
              (roleCandidate as any).name ??
              (roleCandidate as any).title ??
              (roleCandidate as any).label ??
              (roleCandidate as any).value,
          )
        : pick(roleCandidate));

    if (displayName && roleLabel) break;
  }

  return { displayName, roleLabel };
}

export function getModAuthPayload<T = any>(): T | null {
  try {
    const raw = localStorage.getItem(MOD_AUTH_PAYLOAD_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function getModAuthToken(): string {
  try {
    return localStorage.getItem(MOD_AUTH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function isModLoggedIn(): boolean {
  return Boolean(getModAuthToken());
}

export function setModAuth(payload: any) {
  try {
    localStorage.setItem(MOD_AUTH_PAYLOAD_KEY, JSON.stringify(payload ?? null));
  } catch {
    // ignore
  }

  const token =
    payload?.token ||
    payload?.accessToken ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    "";

  try {
    if (token) localStorage.setItem(MOD_AUTH_TOKEN_KEY, String(token));
  } catch {
    // ignore
  }

  const { roleId, systemUserId } = extractRoleAndSystemUserId(payload);
  const { displayName, roleLabel } = extractDisplayNameAndRoleLabel(payload);

  try {
    if (roleId) localStorage.setItem(MOD_ROLE_ID_KEY, String(roleId));
    if (systemUserId) localStorage.setItem(MOD_SYSTEMUSER_ID_KEY, String(systemUserId));
    if (displayName) localStorage.setItem(MOD_DISPLAY_NAME_KEY, String(displayName));
    if (roleLabel) localStorage.setItem(MOD_ROLE_LABEL_KEY, String(roleLabel));
  } catch {
    // ignore
  }
}

export function clearModAuth() {
  try {
    localStorage.removeItem(MOD_AUTH_PAYLOAD_KEY);
    localStorage.removeItem(MOD_AUTH_TOKEN_KEY);
    localStorage.removeItem(MOD_ROLE_ID_KEY);
    localStorage.removeItem(MOD_SYSTEMUSER_ID_KEY);
    localStorage.removeItem(MOD_DISPLAY_NAME_KEY);
    localStorage.removeItem(MOD_ROLE_LABEL_KEY);
  } catch {
    // ignore
  }
}

export function getModDisplayName(): string {
  try {
    const stored = localStorage.getItem(MOD_DISPLAY_NAME_KEY) || "";
    if (stored) return stored;

    const payload = getModAuthPayload();
    const extracted = extractDisplayNameAndRoleLabel(payload);
    if (extracted.displayName) localStorage.setItem(MOD_DISPLAY_NAME_KEY, extracted.displayName);
    return extracted.displayName || "";
  } catch {
    return "";
  }
}

export function getModRoleLabel(): string {
  try {
    const stored = localStorage.getItem(MOD_ROLE_LABEL_KEY) || "";
    if (stored) return stored;

    const payload = getModAuthPayload();
    const extracted = extractDisplayNameAndRoleLabel(payload);
    if (extracted.roleLabel) localStorage.setItem(MOD_ROLE_LABEL_KEY, extracted.roleLabel);
    return extracted.roleLabel || "";
  } catch {
    return "";
  }
}

export function getModLoggedInSummary(): { displayName: string; role: string } {
  const displayName = getModDisplayName() || getModSystemUserId();
  const roleLabel = getModRoleLabel();
  const roleId = getModRoleId();

  const role = roleLabel || roleId;
  return { displayName, role };
}

export function getModRoleId(): string {
  try {
    const stored = localStorage.getItem(MOD_ROLE_ID_KEY) || "";
    if (stored) return stored;
    const payload = getModAuthPayload();
    const extracted = extractRoleAndSystemUserId(payload);
    if (extracted.roleId) localStorage.setItem(MOD_ROLE_ID_KEY, extracted.roleId);
    if (extracted.systemUserId) localStorage.setItem(MOD_SYSTEMUSER_ID_KEY, extracted.systemUserId);
    return extracted.roleId || "";
  } catch {
    return "";
  }
}

export function getModSystemUserId(): string {
  try {
    const stored = localStorage.getItem(MOD_SYSTEMUSER_ID_KEY) || "";
    if (stored) return stored;
    const payload = getModAuthPayload();
    const extracted = extractRoleAndSystemUserId(payload);
    if (extracted.roleId) localStorage.setItem(MOD_ROLE_ID_KEY, extracted.roleId);
    if (extracted.systemUserId) localStorage.setItem(MOD_SYSTEMUSER_ID_KEY, extracted.systemUserId);
    return extracted.systemUserId || "";
  } catch {
    return "";
  }
}
