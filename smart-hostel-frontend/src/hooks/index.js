// src/hooks/index.js — All reusable hooks

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// useFetch
// Generic data-loading hook. Re-fetches whenever deps change.
//
// Usage:
//   const { data, loading, error, refetch } = useFetch(() => getStudents(), []);
// ─────────────────────────────────────────────────────────────
export function useFetch(apiFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const run = useCallback(() => {
    setLoading(true);
    setError("");
    apiFn()
      .then(r  => setData(r.data?.data ?? r.data))
      .catch(e => setError(e.message || "Something went wrong"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

// ─────────────────────────────────────────────────────────────
// useForm
// Controlled form state with named-field helpers.
//
// Usage:
//   const { form, set, fill, reset } = useForm({ name:"", email:"" });
//   <input value={form.name} onChange={e => set("name", e.target.value)} />
// ─────────────────────────────────────────────────────────────
export function useForm(initial) {
  const [form, setForm] = useState(initial);

  // Set a single field by name
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Merge an object into form (for edit-mode pre-fill)
  const fill = (obj) => setForm(prev => ({ ...prev, ...obj }));

  // Reset to initial
  const reset = () => setForm(initial);

  return { form, setForm, set, fill, reset };
}

// ─────────────────────────────────────────────────────────────
// useAsync
// Wraps an async API call with loading / error / success states.
//
// Usage:
//   const { run, loading, error, success, clear } = useAsync();
//   await run(() => createStudent(form));
// ─────────────────────────────────────────────────────────────
export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const run = async (asyncFn) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await asyncFn();
      // Try common message fields from backend
      const msg = res?.data?.message || "Success!";
      setSuccess(msg);
      return res;
    } catch (err) {
      // Axios errors: err.message is set by our interceptor in api.js
      const msg = err?.message || err?.error || "An error occurred";
      setError(msg);
      throw err; // re-throw so caller can also react
    } finally {
      setLoading(false);
    }
  };

  const clear = () => { setError(""); setSuccess(""); };

  return { run, loading, error, success, clear };
}
