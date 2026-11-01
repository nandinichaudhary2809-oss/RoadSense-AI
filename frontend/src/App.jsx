
import { useEffect, useMemo, useState } from "react";
import RoadMap from "./RoadMap";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const loadReports = async () => {
    try {
      setErrorMessage("");
      const response = await fetch(`${API_URL}/reports`);

      if (!response.ok) {
        throw new Error("Could not load reports from the server.");
      }

      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to connect to the backend.");
    } finally {
      setLoadingReports(false);
    }
  };

  const [theme, setTheme] = useState(
    () => localStorage.getItem("roadsense-theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("roadsense-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const highReports = reports.filter(
    (report) => report.severity?.toLowerCase() === "high"
  ).length;

  const mediumReports = reports.filter(
    (report) => report.severity?.toLowerCase() === "medium"
  ).length;

  const lowReports = reports.filter(
    (report) => report.severity?.toLowerCase() === "low"
  ).length;

  const pendingReports = reports.filter(
    (report) => (report.status || "Pending").toLowerCase() === "pending"
  ).length;

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const searchableText =
        `${report.location || ""} ${report.description || ""}`.toLowerCase();

      const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
      const matchesSeverity =
        severityFilter === "All" ||
        report.severity?.toLowerCase() === severityFilter.toLowerCase();

      return matchesSearch && matchesSeverity;
    });
  }, [reports, searchTerm, severityFilter]);

  const handleReportSubmit = async (event) => {
    event.preventDefault();

    if (!location.trim() || !description.trim()) {
      setErrorMessage("Please enter the location and report description.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const reportData = {
      location: location.trim(),
      severity,
      description: description.trim(),
      latitude: latitude.trim() ? Number(latitude) : null,
      longitude: longitude.trim() ? Number(longitude) : null,
    };

    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to submit your report.");
      }

      const savedReport = await response.json();

      setReports((previousReports) => [savedReport, ...previousReports]);

      setLocation("");
      setLatitude("");
      setLongitude("");
      setSeverity("Medium");
      setDescription("");
      setImage(null);
      event.target.reset();

      setSuccessMessage("Your road report has been submitted successfully.");
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to submit report. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Recently reported";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Recently reported";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const scrollToReport = () => {
    document.getElementById("report-form")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="app" data-theme={theme}>
      <nav className="navbar">
        <a href="#home" className="brand">
          <span className="brand-mark">R</span>
          <span>
            RoadSense <span className="brand-ai">AI</span>
          </span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#map">Road Map</a>
          <a href="#reports">Reports</a>
        </div>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          title="Switch theme"
        >
          {theme === "light" ? "☾" : "☀"}
        </button>

        <button className="nav-cta" onClick={scrollToReport}>
          Report a road issue <span>↗</span>
        </button>
      </nav>

      <main>

        <section className="hero hero-premium" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              INTELLIGENCE FOR BETTER ROADS
            </div>

            <h1>
              Making every road safer,
              <span> one report at a time.</span>
            </h1>

            <p className="hero-description">
              Detect road issues. Share local insights. Help prioritize
              safer infrastructure with RoadSense AI — a smarter,
              community-powered approach to road safety.
            </p>

            <div className="hero-actions">
              <button className="button-primary" onClick={scrollToReport}>
                Report a road issue <span>↗</span>
              </button>

              <a href="#map" className="button-text">
                Explore road map <span>→</span>
              </a>
            </div>

            <div className="hero-trust">
              <span className="hero-trust-line"></span>
              COMMUNITY POWERED · DATA INFORMED
            </div>
          </div>

          <div className="hero-info-panel">
            <div className="panel-top">
              <span>ROAD NETWORK OVERVIEW</span>
              <span className="panel-status">
                <i></i> SYSTEM ACTIVE
              </span>
            </div>

            <div className="panel-heading">
              <span>01 / LIVE INSIGHTS</span>
              <h2>Better data.<br />Better decisions.</h2>
              <p>Road conditions, brought into focus.</p>
            </div>

            <div className="panel-stat">
              <div>
                <span>Total road reports</span>
                <small>Community submissions</small>
              </div>
              <strong>{reports.length}</strong>
            </div>

            <div className="panel-stat">
              <div>
                <span>High priority</span>
                <small>Requires attention</small>
              </div>
              <strong className="panel-high">{highReports}</strong>
            </div>

            <div className="panel-stat">
              <div>
                <span>Pending reports</span>
                <small>Awaiting resolution</small>
              </div>
              <strong>{pendingReports}</strong>
            </div>

            <a href="#dashboard" className="panel-link">
              View full dashboard <span>↗</span>
            </a>
          </div>
        </section>

        <section className="overview-strip">
          <div className="overview-item">
            <span className="overview-label">TOTAL REPORTS</span>
            <strong>{reports.length}</strong>
            <span className="overview-note">Community submissions</span>
          </div>

          <div className="overview-item">
            <span className="overview-label">HIGH PRIORITY</span>
            <strong className="text-red">{highReports}</strong>
            <span className="overview-note">Requires attention</span>
          </div>

          <div className="overview-item">
            <span className="overview-label">MEDIUM PRIORITY</span>
            <strong className="text-orange">{mediumReports}</strong>
            <span className="overview-note">Needs monitoring</span>
          </div>

          <div className="overview-item">
            <span className="overview-label">LOW PRIORITY</span>
            <strong className="text-green">{lowReports}</strong>
            <span className="overview-note">Lower severity</span>
          </div>
        </section>

        <section className="section-padding" id="dashboard">
          <div className="section-header">
            <div>
              <div className="eyebrow">SYSTEM OVERVIEW</div>
              <h2>Road intelligence dashboard</h2>
              <p>Understand reported road conditions at a glance.</p>
            </div>

            <button className="button-outline" onClick={loadReports}>
              <span>↻</span> Refresh data
            </button>
          </div>

          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-card-top">
                <span className="analytics-label">Total road reports</span>
                <span className="analytics-symbol">↗</span>
              </div>
              <strong>{reports.length}</strong>
              <div className="analytics-line line-dark"></div>
              <span className="dashboard-footnote">All submitted reports</span>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-top">
                <span className="analytics-label">High severity</span>
                <span className="analytics-symbol">!</span>
              </div>
              <strong>{highReports}</strong>
              <div className="analytics-line line-red"></div>
              <span className="dashboard-footnote">Priority road issues</span>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-top">
                <span className="analytics-label">Medium severity</span>
                <span className="analytics-symbol">◉</span>
              </div>
              <strong>{mediumReports}</strong>
              <div className="analytics-line line-orange"></div>
              <span className="dashboard-footnote">Moderate road issues</span>
            </div>

            <div className="analytics-card">
              <div className="analytics-card-top">
                <span className="analytics-label">Pending reports</span>
                <span className="analytics-symbol">◷</span>
              </div>
              <strong>{pendingReports}</strong>
              <div className="analytics-line line-green"></div>
              <span className="dashboard-footnote">Awaiting resolution</span>
            </div>
          </div>
        </section>

        <section className="section-padding map-section" id="map">
          <div className="section-header">
            <div>
              <div className="eyebrow">GEOGRAPHIC INSIGHTS</div>
              <h2>Explore the road map</h2>
              <p>View reported road issues across their locations.</p>
            </div>

            <div className="map-legend">
              <span><i className="legend-red"></i> High</span>
              <span><i className="legend-orange"></i> Medium</span>
              <span><i className="legend-green"></i> Low</span>
            </div>
          </div>

          <div className="map-container">
            <RoadMap reports={reports} />
          </div>

          <p className="map-caption">
            Map markers are based on the location coordinates submitted with
            each report.
          </p>
        </section>

        <section className="section-padding report-section" id="report-form">
          <div className="report-intro">
            <div className="eyebrow">MAKE AN IMPACT</div>
            <h2>Spot a problem? Help make roads safer.</h2>
            <p>
              Share road damage details with the community. Every report
              contributes to better road awareness and repair planning.
            </p>

            <div className="report-points">
              <p><span>01</span> Share the road location</p>
              <p><span>02</span> Describe the road condition</p>
              <p><span>03</span> Help prioritize repairs</p>
            </div>
          </div>

          <div className="form-panel">
            <div className="form-heading">
              <div>
                <span className="form-kicker">NEW SUBMISSION</span>
                <h3>Report a road issue</h3>
              </div>
              <span className="form-number">01 / 03</span>
            </div>

            <form className="report-form" onSubmit={handleReportSubmit}>
              <div className="form-field">
                <label htmlFor="location">Road location *</label>
                <input
                  id="location"
                  type="text"
                  placeholder="Enter road name or area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="latitude">Latitude</label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 30.7046"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="longitude">Longitude</label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="e.g. 76.7179"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>

              <p className="field-note">
                Coordinates help display the report on the interactive map.
              </p>

              <div className="form-field">
                <label htmlFor="severity">Severity level *</label>
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="description">Issue description *</label>
                <textarea
                  id="description"
                  rows="4"
                  placeholder="Describe the pothole or road damage..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="form-field">
                <label htmlFor="image">Upload an image (optional)</label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
                <p className="field-note">
                  Image selection is currently for reference only; it is not
                  uploaded to the backend.
                </p>
              </div>

              <p className="required-note">* Required fields</p>

              {errorMessage && (
                <div className="form-alert error-alert">{errorMessage}</div>
              )}

              {successMessage && (
                <div className="form-alert success-alert">{successMessage}</div>
              )}

              <button className="button-primary form-submit" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit road report"}
                {!submitting && <span>↗</span>}
              </button>
            </form>
          </div>
        </section>

        <section className="section-padding reports-section" id="reports">
          <div className="section-header">
            <div>
              <div className="eyebrow">COMMUNITY DATA</div>
              <h2>Recently reported issues</h2>
              <p>Search and explore submitted road reports.</p>
            </div>
            <span className="report-count">{filteredReports.length} reports</span>
          </div>

          <div className="report-toolbar">
            <div className="search-control">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search by location or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="filter-control"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All severities</option>
              <option value="High">High severity</option>
              <option value="Medium">Medium severity</option>
              <option value="Low">Low severity</option>
            </select>
          </div>

          <div className="reports-list">
            {loadingReports ? (
              <div className="empty-state">Loading road reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="empty-state">
                No matching reports found. Try changing your search or filter.
              </div>
            ) : (
              filteredReports.map((report, index) => {
                const level = (report.severity || "Medium").toLowerCase();

                return (
                  <article className="report-row" key={report.id ?? index}>
                    <div className="report-row-main">
                      <span className="report-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <h3>{report.location || "Unknown location"}</h3>
                        <p>{report.description || "No description provided."}</p>
                        <div className="report-row-meta">
                          <span className={`severity-badge severity-${level}`}>
                            {report.severity || "Medium"}
                          </span>
                          <span className="report-status">
                            {report.status || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="report-date">
                      {formatDate(report.created_at)}
                    </span>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="section-padding process-section" id="process">
          <div className="section-header">
            <div>
              <div className="eyebrow">HOW IT WORKS</div>
              <h2>Small reports. Smarter decisions.</h2>
              <p>A simple process for better road intelligence.</p>
            </div>
          </div>

          <div className="process-grid">
            <div className="process-card">
              <span className="process-number">01</span>
              <h3>Report</h3>
              <p>Citizens submit road damage details and location information.</p>
            </div>

            <div className="process-card">
              <span className="process-number">02</span>
              <h3>Understand</h3>
              <p>Reports are organized to make road conditions easier to review.</p>
            </div>

            <div className="process-card">
              <span className="process-number">03</span>
              <h3>Prioritize</h3>
              <p>Severity insights help identify issues that need attention.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main">
          <a href="#home" className="brand footer-brand">
            <span className="brand-mark">R</span>
            <span>
              RoadSense <span className="brand-ai">AI</span>
            </span>
          </a>

          <p>Smarter roads begin with better information.</p>

          <a href="#home" className="footer-link">Back to top ↑</a>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} RoadSense AI</span>
          <span>AI-powered road intelligence</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
