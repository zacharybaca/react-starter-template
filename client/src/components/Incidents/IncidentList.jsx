import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useFetcher } from "../../hooks/useFetcher";
import StatusBadge from "../Utility/StatusBadge";
import PriorityBadge from "../Utility/PriorityBadge";
import "./incidents.css";

const STATUSES = ["", "open", "in_progress", "resolved", "closed"];
const PRIORITIES = ["", "low", "medium", "high", "critical"];

const IncidentList = () => {
  const { fetcher } = useFetcher();
  const navigate = useNavigate();

  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
    page: 1,
    sortBy: "createdAt",
    order: "desc",
  });

  const loadIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "") params.set(k, v);
    });

    const result = await fetcher(`/api/incidents?${params.toString()}`);
    if (result.success) {
      setIncidents(result.data.incidents);
      setTotal(result.data.total);
      setPages(result.data.pages);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [fetcher, filters]);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSort = (field) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      order: prev.sortBy === field && prev.order === "desc" ? "asc" : "desc",
      page: 1,
    }));
  };

  const sortIndicator = (field) => {
    if (filters.sortBy !== field) return "";
    return filters.order === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="incident-list-page">
      <div className="incident-list-page__header">
        <h1>Incidents</h1>
        <button className="btn btn--primary" onClick={() => navigate("/incidents/new")}>
          + New Incident
        </button>
      </div>

      {/* Filters */}
      <div className="incident-filters">
        <input
          type="text"
          name="search"
          placeholder="Search title or description…"
          value={filters.search}
          onChange={handleFilterChange}
          className="incident-filters__input"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="incident-filters__select"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s ? s.replace("_", " ") : "All Statuses"}
            </option>
          ))}
        </select>
        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          className="incident-filters__select"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p || "All Priorities"}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="incident-list__state">Loading…</div>}
      {error && <div className="incident-list__state incident-list__state--error">{error}</div>}

      {!loading && !error && (
        <>
          <p className="incident-list__count">{total} incident{total !== 1 ? "s" : ""} found</p>

          <div className="incident-table-wrapper">
            <table className="incident-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("title")} className="sortable">
                    Title{sortIndicator("title")}
                  </th>
                  <th>Application</th>
                  <th onClick={() => handleSort("status")} className="sortable">
                    Status{sortIndicator("status")}
                  </th>
                  <th onClick={() => handleSort("priority")} className="sortable">
                    Priority{sortIndicator("priority")}
                  </th>
                  <th>Reported By</th>
                  <th>Assigned To</th>
                  <th onClick={() => handleSort("createdAt")} className="sortable">
                    Created{sortIndicator("createdAt")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="incident-table__empty">
                      No incidents found.
                    </td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
                    <tr
                      key={inc._id}
                      className="incident-table__row"
                      onClick={() => navigate(`/incidents/${inc._id}`)}
                    >
                      <td className="incident-table__title">{inc.title}</td>
                      <td>{inc.application?.name ?? "—"}</td>
                      <td>
                        <StatusBadge status={inc.status} />
                      </td>
                      <td>
                        <PriorityBadge priority={inc.priority} />
                      </td>
                      <td>{inc.reportedBy}</td>
                      <td>{inc.assignedTo?.name ?? <span className="muted">Unassigned</span>}</td>
                      <td className="muted">
                        {format(new Date(inc.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button
                disabled={filters.page <= 1}
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                className="btn btn--secondary"
              >
                ← Prev
              </button>
              <span className="pagination__info">
                Page {filters.page} of {pages}
              </span>
              <button
                disabled={filters.page >= pages}
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                className="btn btn--secondary"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IncidentList;
