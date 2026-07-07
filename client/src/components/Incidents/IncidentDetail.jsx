import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useFetcher } from "../../hooks/useFetcher";
import { useAuth } from "../../hooks/useAuth";
import StatusBadge from "../Utility/StatusBadge";
import PriorityBadge from "../Utility/PriorityBadge";
import "./incidents.css";

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetcher } = useFetcher();
  const { user } = useAuth();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentBody, setCommentBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const result = await fetcher(`/api/incidents/${id}`);
      if (result.success) {
        setIncident(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };
    load();
  }, [fetcher, id]);

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    const result = await fetcher(`/api/incidents/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    if (result.success) {
      setIncident(result.data);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmitting(true);
    const result = await fetcher(`/api/incidents/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ body: commentBody }),
    });
    if (result.success) {
      setIncident((prev) => ({
        ...prev,
        comments: [...prev.comments, result.data],
      }));
      setCommentBody("");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="incident-detail__state">Loading…</div>;
  if (error) return <div className="incident-detail__state--error">Error: {error}</div>;
  if (!incident) return null;

  return (
    <div className="incident-detail">
      {/* Header */}
      <div className="incident-detail__header">
        <button className="btn btn--ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="incident-detail__badges">
          <StatusBadge status={incident.status} />
          <PriorityBadge priority={incident.priority} />
        </div>
        <button
          className="btn btn--secondary"
          onClick={() => navigate(`/incidents/${id}/edit`)}
        >
          Edit
        </button>
      </div>

      <h1 className="incident-detail__title">{incident.title}</h1>

      {/* Meta grid */}
      <dl className="incident-meta">
        <div>
          <dt>Application</dt>
          <dd>{incident.application?.name ?? "—"}</dd>
        </div>
        <div>
          <dt>Severity</dt>
          <dd>{incident.severity?.toUpperCase()}</dd>
        </div>
        <div>
          <dt>Reported By</dt>
          <dd>{incident.reportedBy}</dd>
        </div>
        <div>
          <dt>Assigned To</dt>
          <dd>{incident.assignedTo?.name ?? <span className="muted">Unassigned</span>}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{format(new Date(incident.createdAt), "PPpp")}</dd>
        </div>
        {incident.resolvedAt && (
          <div>
            <dt>Resolved</dt>
            <dd>{format(new Date(incident.resolvedAt), "PPpp")}</dd>
          </div>
        )}
        <div>
          <dt>Change Status</dt>
          <dd>
            <select
              value={incident.status}
              onChange={handleStatusChange}
              className="incident-filters__select"
            >
              {["open", "in_progress", "resolved", "closed"].map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </dd>
        </div>
      </dl>

      {/* Description */}
      <section className="incident-section">
        <h2>Description</h2>
        <p className="incident-section__body">{incident.description}</p>
      </section>

      {/* Resolution */}
      {incident.resolution && (
        <section className="incident-section incident-section--resolution">
          <h2>Resolution</h2>
          <p className="incident-section__body">{incident.resolution}</p>
        </section>
      )}

      {/* Tags */}
      {incident.tags?.length > 0 && (
        <section className="incident-section">
          <h2>Tags</h2>
          <div className="incident-tags">
            {incident.tags.map((tag) => (
              <span key={tag} className="incident-tag">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Comments */}
      <section className="incident-section">
        <h2>Comments ({incident.comments.length})</h2>
        <div className="comment-list">
          {incident.comments.length === 0 ? (
            <p className="muted">No comments yet.</p>
          ) : (
            incident.comments.map((c) => (
              <div key={c._id} className="comment">
                <div className="comment__meta">
                  <strong>{c.author?.name ?? "Unknown"}</strong>
                  <span className="muted">{format(new Date(c.createdAt), "PPpp")}</span>
                </div>
                <p className="comment__body">{c.body}</p>
              </div>
            ))
          )}
        </div>

        {user && (
          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              className="comment-form__textarea"
              rows={3}
              placeholder="Add a comment…"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="btn btn--primary"
            >
              {submitting ? "Posting…" : "Post Comment"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

export default IncidentDetail;
