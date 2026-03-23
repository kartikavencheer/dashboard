import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { modLogin } from "../api/moderatorApi";
import { isModLoggedIn, setModAuth } from "../utils/modAuth";

type LocationState = {
  from?: { pathname?: string };
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const redirectTo = useMemo(() => state?.from?.pathname || "/", [state]);

  const [emailaddress, setEmailaddress] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isModLoggedIn()) navigate(redirectTo, { replace: true });
  }, [navigate, redirectTo]);

  if (isModLoggedIn()) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      const payload = await modLogin(emailaddress.trim(), password);
      setModAuth(payload);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <div className="glass-panel w-full max-w-md rounded-[32px] p-6 md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="hero-chip mb-3">Moderator</div>
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="mt-2 text-sm text-white/65">
              Use your moderator credentials to access the dashboard.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-100">
            <Lock size={18} />
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">
              Email
            </div>
            <input
              className="form-control w-full"
              placeholder="name@company.com"
              autoComplete="username"
              value={emailaddress}
              onChange={(e) => setEmailaddress(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">
              Password
            </div>
            <input
              className="form-control w-full"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          <button
            disabled={submitting}
            className="primary-button w-full justify-center"
            type="submit"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
