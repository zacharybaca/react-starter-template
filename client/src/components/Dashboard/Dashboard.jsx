import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import useFetcher from "../../hooks/useFetcher";
import "./dashboard.css";

const STATUS_COLORS = {
  open: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#10b981",
  closed: "#94a3b8",
};

const PRIORITY_COLORS = {
  low: "#38bdf8",
  medium: "#fbbf24",
  high: "#f87171",
  critical: "#7f1d1d",
};

const KpiCard = ({ label, value, color }) => (
  <div className="kpi-card" style={{ borderTopColor: color }}>
    <span className="kpi-card__value">{value ?? 0}</span>
    <span className="kpi-card__label">{label}</span>
  </div>
);

const Dashboard = () => {
  const { fetcher } = useFetcher();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetcher("/api/incidents/stats");
        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetcher]);

  if (loading) return <div className="dashboard__loading">Loading dashboard…</div>;
  if (error) return <div className="dashboard__error">Error: {error}</div>;

  const statusData = Object.entries(stats.byStatus ?? {}).map(([name, value]) => ({
    name: name.replace("_", " "),
    value,
    fill: STATUS_COLORS[name] ?? "#94a3b8",
  }));

  const priorityData = Object.entries(stats.byPriority ?? {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Incident Dashboard</h1>

      {/* KPI Cards */}
      <section className="kpi-grid">
        <KpiCard label="Total Incidents" value={stats.total} color="#6366f1" />
        <KpiCard
          label="Open / In Progress"
          value={stats.openAndInProgress}
          color="#f59e0b"
        />
        <KpiCard label="Resolved" value={stats.byStatus?.resolved} color="#10b981" />
        <KpiCard label="Closed" value={stats.byStatus?.closed} color="#94a3b8" />
      </section>

      {/* Charts */}
      <section className="charts-grid">
        <div className="chart-card">
          <h2 className="chart-card__title">Incidents by Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2 className="chart-card__title">Incidents by Priority</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priorityData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Incidents" radius={[4, 4, 0, 0]}>
                {priorityData.map((entry, i) => (
                  <Cell key={i} fill={PRIORITY_COLORS[entry.name] ?? "#6366f1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
