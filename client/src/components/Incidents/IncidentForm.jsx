import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetcher } from "../../hooks/useFetcher";
import "./incidents.css";

const EMPTY_FORM = {
  title: "",
  description: "",
  application: "",
  priority: "medium",
  severity: "s3",
  reportedBy: "",
  assignedTo: "",
  tags: "",
  resolution: "",
  estimatedResolutionTime: "",
};

const IncidentForm = () => {
  const { id } = useParams(); // present when editing
  const navigate = useNavigate();
  const { fetcher } = useFetcher();

  const [form, setForm] = useState(EMPTY_FORM);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load applications and users for dropdowns, and existing incident if editing
  useEffect(() => {
    const loadData = async () => {
      const [appsResult, usersResult] = await Promise.all([
        fetcher("/api/applications"),
        fetcher("/api/users"),
      ]);
      if (appsResult.success) setApplications(appsResult.data);
      if (usersResult.success) setUsers(usersResult.data);

      if (id) {
        const incResult = await fetcher(`/api/incidents/${id}`);
        if (incResult.success) {
          const inc = incResult.data;
          setForm({
            title: inc.title,
            description: inc.description,
            application: inc.application?._id ?? "",
            priority: inc.priority,
            severity: inc.severity,
            reportedBy: inc.reportedBy,
            assignedTo: inc.assignedTo?._id ?? "",
            tags: inc.tags?.join(", ") ?? "",
            resolution: inc.resolution ?? "",
            estimatedResolutionTime: inc.estimatedResolutionTime ?? "",
          });
        } else {
          setError(incResult.error);
        }
        setLoading(false);
      }
    };
    loadData();
  }, [fetcher, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      ...form,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      assignedTo: form.assignedTo || null,
      estimatedResolutionTime: form.estimatedResolutionTime
        ? Number(form.estimatedResolutionTime)
        : null,
    };

    const result = id
      ? await fetcher(`/api/incidents/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await fetcher("/api/incidents", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    if (result.success) {
      navigate(`/incidents/${result.data._id}`);
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="incident-detail__state">Loading…</div>;

  return (
    <div className="incident-form-page">
      <div className="incident-form-page__header">
        <button className="btn btn--ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{id ? "Edit Incident" : "New Incident"}</h1>
      </div>

      {error && <div className="incident-form__error">{error}</div>}

      <form className="incident-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="Brief summary of the incident"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            required
            value={form.description}
            onChange={handleChange}
            placeholder="Detailed description of the incident…"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="application">Application *</label>
            <select
              id="application"
              name="application"
              required
              value={form.application}
              onChange={handleChange}
            >
              <option value="">Select application…</option>
              {applications.map((app) => (
                <option key={app._id} value={app._id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reportedBy">Reported By (Client) *</label>
            <input
              id="reportedBy"
              name="reportedBy"
              type="text"
              required
              value={form.reportedBy}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              {["low", "medium", "high", "critical"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity</label>
            <select
              id="severity"
              name="severity"
              value={form.severity}
              onChange={handleChange}
            >
              {["s1", "s2", "s3", "s4"].map((s) => (
                <option key={s} value={s}>
                  {s.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="assignedTo">Assigned To</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.username})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="estimatedResolutionTime">
              Estimated Resolution Time (minutes)
            </label>
            <input
              id="estimatedResolutionTime"
              name="estimatedResolutionTime"
              type="number"
              min="0"
              value={form.estimatedResolutionTime}
              onChange={handleChange}
              placeholder="e.g. 120"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={form.tags}
              onChange={handleChange}
              placeholder="e.g. login, api, database"
            />
          </div>
        </div>

        {id && (
          <div className="form-group">
            <label htmlFor="resolution">Resolution Notes</label>
            <textarea
              id="resolution"
              name="resolution"
              rows={3}
              value={form.resolution}
              onChange={handleChange}
              placeholder="How was this incident resolved?"
            />
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? "Saving…" : id ? "Update Incident" : "Create Incident"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncidentForm;
