import { useEffect, useState, useCallback } from "react";
import { useFetcher } from "../../hooks/useFetcher";
import { useAuth } from "../../hooks/useAuth";
import "./applications.css";

const ENV_LABELS = {
  development: "Dev",
  staging: "Staging",
  production: "Prod",
  all: "All",
};

const STATUS_STYLES = {
  active: { background: "#d1fae5", color: "#065f46" },
  deprecated: { background: "#fee2e2", color: "#b91c1c" },
  maintenance: { background: "#fef3c7", color: "#b45309" },
};

const ApplicationList = () => {
  const { fetcher } = useFetcher();
  const { isUserAdmin } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    owner: "",
    version: "",
    environment: "production",
    status: "active",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadApps = useCallback(async (q = "") => {
    setLoading(true);
    const params = q ? `?search=${encodeURIComponent(q)}` : "";
    const result = await fetcher(`/api/applications${params}`);
    if (result.success) {
      setApplications(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [fetcher]);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    loadApps(val);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const result = await fetcher("/api/applications", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result.success) {
      setApplications((prev) => [...prev, result.data]);
      setShowForm(false);
      setForm({
        name: "",
        description: "",
        owner: "",
        version: "",
        environment: "production",
        status: "active",
        tags: "",
      });
    } else {
      setFormError(result.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this application?")) return;
    const result = await fetcher(`/api/applications/${id}`, { method: "DELETE" });
    if (result.success) {
      setApplications((prev) => prev.filter((a) => a._id !== id));
    }
  };

  return (
    <div className="app-list-page">
      <div className="app-list-page__header">
        <h1>Applications</h1>
        {isUserAdmin && (
          <button
            className="btn btn--primary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancel" : "+ Add Application"}
          </button>
        )}
      </div>

      {showForm && isUserAdmin && (
        <form className="app-form" onSubmit={handleCreate}>
          <h2 className="app-form__title">New Application</h2>
          {formError && <div className="app-form__error">{formError}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Customer Portal"
              />
            </div>
            <div className="form-group">
              <label>Owner</label>
              <input
                name="owner"
                value={form.owner}
                onChange={handleFormChange}
                placeholder="Team or individual"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows={2}
              value={form.description}
              onChange={handleFormChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Version</label>
              <input
                name="version"
                value={form.version}
                onChange={handleFormChange}
                placeholder="e.g. 2.4.1"
              />
            </div>
            <div className="form-group">
              <label>Environment</label>
              <select name="environment" value={form.environment} onChange={handleFormChange}>
                {["development", "staging", "production", "all"].map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleFormChange}>
                {["active", "deprecated", "maintenance"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleFormChange}
              placeholder="e.g. frontend, nodejs"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create Application"}
            </button>
          </div>
        </form>
      )}

      <input
        type="text"
        className="incident-filters__input app-search"
        placeholder="Search applications…"
        value={search}
        onChange={handleSearch}
      />

      {loading && <div className="app-list__state">Loading…</div>}
      {error && <div className="app-list__state app-list__state--error">{error}</div>}

      {!loading && !error && (
        <div className="app-cards">
          {applications.length === 0 ? (
            <p className="app-list__empty">No applications found.</p>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="app-card">
                <div className="app-card__header">
                  <h2 className="app-card__name">{app.name}</h2>
                  <span
                    className="app-card__status"
                    style={STATUS_STYLES[app.status] ?? {}}
                  >
                    {app.status}
                  </span>
                </div>
                {app.description && (
                  <p className="app-card__desc">{app.description}</p>
                )}
                <div className="app-card__meta">
                  {app.owner && <span>👤 {app.owner}</span>}
                  {app.version && <span>v{app.version}</span>}
                  <span>🌐 {ENV_LABELS[app.environment]}</span>
                </div>
                {app.tags?.length > 0 && (
                  <div className="incident-tags">
                    {app.tags.map((t) => (
                      <span key={t} className="incident-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {isUserAdmin && (
                  <button
                    className="btn btn--ghost app-card__delete"
                    onClick={() => handleDelete(app._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationList;
