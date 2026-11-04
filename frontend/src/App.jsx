import { useEffect, useMemo, useState } from "react";
import LocationPicker from "./LocationPicker";
import AuthPage from "./AuthPage";
import RoadMap from "./RoadMap";
import "./App.css";

const API_URL = "https://roadsense-ai-h736.onrender.com";

const NAV_ITEMS = [
  { id: "overview", href: "#overview", label: "Overview" },
  { id: "dashboard", href: "#dashboard", label: "Dashboard" },
  { id: "map", href: "#map", label: "Road Map" },
  { id: "report-form", href: "#report-form", label: "Report Issues" },
  { id: "reports", href: "#reports", label: "All Reports" },
];

const PAGE_META = {
  overview: {
    title: "Overview",
    crumb: "Road intelligence",
    subtitle: "Live community reports and network status",
  },
  dashboard: {
    title: "Dashboard",
    crumb: "Analytics",
    subtitle: "Severity mix from submitted reports",
  },
  map: {
    title: "Road Map",
    crumb: "Geographic view",
    subtitle: "Mapped issues with valid coordinates",
  },
  "report-form": {
    title: "Report Issues",
    crumb: "New submission",
    subtitle: "Share a road condition with the network",
  },
  reports: {
    title: "All Reports",
    crumb: "Records",
    subtitle: "Search and filter every submitted issue",
  },
};

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
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadReports = async () => {
    try {
      setErrorMessage("");
      setLoadingReports(true);
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
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("roadsense-user") || "null");
    } catch {
      return null;
    }
  });

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

  useEffect(() => {
    if (!currentUser) return;

    const ids = NAV_ITEMS.map((item) => item.id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-18% 0px -55% 0px",
        threshold: [0.12, 0.35, 0.6],
      }
    );

    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [currentUser]);
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

  const mappedReports = reports.filter(
    (report) =>
      Number.isFinite(Number(report.latitude)) &&
      Number.isFinite(Number(report.longitude)) &&
      report.latitude !== null &&
      report.longitude !== null
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
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const selectMapLocation = async (lat, lng) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setSelectedPosition([lat, lng]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );

      if (response.ok) {
        const data = await response.json();
        setLocation(data.display_name || `${lat}, ${lng}`);
      }
    } catch (error) {
      console.error("Address lookup failed:", error);
      setLocation(`${lat}, ${lng}`);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Your browser does not support GPS location.");
      return;
    }

    setGettingLocation(true);
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        selectMapLocation(
          position.coords.latitude,
          position.coords.longitude
        );
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        setErrorMessage(
          "Unable to get location. Please allow location permission."
        );
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };
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
      setSelectedPosition(null);
      setSeverity("Medium");
      setDescription("");
      setImage(null);

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

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
    setActiveSection(id);
    setSidebarOpen(false);
  };

  const scrollToReport = () => {
    scrollToSection("report-form");
  };

  const goToReports = () => {
    scrollToSection("reports");
  };

  const page = PAGE_META[activeSection] || PAGE_META.overview;
  const handleLogout = () => {
    sessionStorage.removeItem("roadsense-token");
    sessionStorage.removeItem("roadsense-user");
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthPage onLogin={setCurrentUser} />;
  }
  const total = reports.length || 0;
  const severityBars = [
    { label: "High", value: highReports, tone: "high" },
    { label: "Medium", value: mediumReports, tone: "medium" },
    { label: "Low", value: lowReports, tone: "low" },
  ];

  return (
    <div className={`app ${sidebarOpen ? "sidebar-open" : ""}`} data-theme={theme}>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className="sidebar">
        <a href="#overview" className="brand" onClick={() => scrollToSection("overview")}>
          <span className="brand-mark">RS</span>
          <span className="brand-copy">
            <strong>RoadSense AI</strong>
            <small>Road intelligence</small>
          </span>
        </a>

        <nav className="sidebar-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={activeSection === item.id ? "is-active" : ""}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Switch theme"
          >
            {theme === "light" ? "Dark mode" : "Light mode"}
          </button>
          <p>Community-powered road data</p>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label="Open navigation"
            >
              Menu
            </button>
            <div>
              <p className="breadcrumb">
                RoadSense AI <span>/</span> {page.crumb}
              </p>
              <h1>{page.title}</h1>
              <p className="page-subtitle">{page.subtitle}</p>
            </div>
          </div>

          <div className="topbar-actions">
            <label className="header-search">
              <span className="sr-only">Search reports</span>
              <input
                type="search"
                placeholder="Search location or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={goToReports}
              />
            </label>

            <button className="button-outline" onClick={loadReports} disabled={loadingReports}>
              {loadingReports ? "Refreshing..." : "Refresh"}
            </button>

            <button className="button-primary" onClick={scrollToReport}>
              Report Issue
            </button>
            <button
              className="button-outline"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>
        </header>

        {errorMessage && (
          <div className="global-alert" role="alert">
            {errorMessage}
          </div>
        )}

        <main>
          <section className="panel" id="overview">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Overview</p>
                <h2>Road network snapshot</h2>
                <p>Counts below are calculated from the live reports API.</p>
              </div>
            </div>

            <div className="stat-grid">
              <article className="stat-card">
                <span>Total reports</span>
                <strong>{reports.length}</strong>
                <small>All submitted records</small>
              </article>
              <article className="stat-card">
                <span>High severity</span>
                <strong className="text-high">{highReports}</strong>
                <small>Requires attention</small>
              </article>
              <article className="stat-card">
                <span>Pending</span>
                <strong>{pendingReports}</strong>
                <small>Awaiting resolution</small>
              </article>
              <article className="stat-card">
                <span>Mapped</span>
                <strong>{mappedReports}</strong>
                <small>Reports with coordinates</small>
              </article>
            </div>

            <div className="process-grid">
              <article className="content-card">
                <span className="step">01</span>
                <h3>Report</h3>
                <p>Citizens submit road damage details and location information.</p>
              </article>
              <article className="content-card">
                <span className="step">02</span>
                <h3>Understand</h3>
                <p>Reports are organized to make road conditions easier to review.</p>
              </article>
              <article className="content-card">
                <span className="step">03</span>
                <h3>Prioritize</h3>
                <p>Severity insights help identify issues that need attention.</p>
              </article>
            </div>
          </section>

          <section className="panel" id="dashboard">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Dashboard</p>
                <h2>Road intelligence dashboard</h2>
                <p>Understand reported road conditions at a glance.</p>
              </div>
            </div>

            <div className="stat-grid five">
              <article className="stat-card">
                <span>Total Reports</span>
                <strong>{reports.length}</strong>
                <small>All submitted reports</small>
              </article>
              <article className="stat-card">
                <span>High Severity Reports</span>
                <strong className="text-high">{highReports}</strong>
                <small>Priority road issues</small>
              </article>
              <article className="stat-card">
                <span>Medium Severity Reports</span>
                <strong className="text-medium">{mediumReports}</strong>
                <small>Needs monitoring</small>
              </article>
              <article className="stat-card">
                <span>Low Severity Reports</span>
                <strong className="text-low">{lowReports}</strong>
                <small>Lower severity</small>
              </article>
              <article className="stat-card">
                <span>Pending Reports</span>
                <strong>{pendingReports}</strong>
                <small>Awaiting resolution</small>
              </article>
            </div>

            <div className="chart-card">
              <div className="chart-heading">
                <h3>Severity distribution</h3>
                <p>Bars use live counts only. No estimated values are shown.</p>
              </div>

              {total === 0 ? (
                <p className="empty-state">No reports yet, so there is no chart data to display.</p>
              ) : (
                <ul className="severity-chart">
                  {severityBars.map((bar) => (
                    <li key={bar.label}>
                      <div className="chart-label">
                        <span>{bar.label}</span>
                        <strong>
                          {bar.value} · {Math.round((bar.value / total) * 100)}%
                        </strong>
                      </div>
                      <div className="chart-track" aria-hidden="true">
                        <span
                          className={`chart-fill ${bar.tone}`}
                          style={{ width: `${(bar.value / total) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="panel" id="map">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Road Map</p>
                <h2>Explore reported locations</h2>
                <p>View reported road issues across their coordinates.</p>
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
              each report. {mappedReports} of {reports.length} reports currently have coordinates.
            </p>
          </section>

          <section className="panel report-section" id="report-form">
            <div className="report-layout">
              <div className="report-intro">
                <p className="eyebrow">Report Issues</p>
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
                    <span className="form-kicker">New submission</span>
                    <h3>Report a road issue</h3>
                  </div>
                </div>

                <form className="report-form" onSubmit={handleReportSubmit}>
                  <div className="form-field">
                    <label>Choose road location *</label>

                    <button
                      type="button"
                      className="button-outline"
                      onClick={useCurrentLocation}
                      disabled={gettingLocation}
                    >
                      {gettingLocation ? "Getting location..." : "📍 Use My Current Location"}
                    </button>

                    <LocationPicker
                      position={selectedPosition}
                      onSelect={selectMapLocation}
                    />

                    <label htmlFor="location">Selected address</label>
                    <input
                      id="location"
                      type="text"
                      placeholder="Select a location on the map"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />

                    <div className="form-row">
                      <div className="form-field">
                        <label>Latitude</label>
                        <input value={latitude} readOnly placeholder="Auto-filled" />
                      </div>

                      <div className="form-field">
                        <label>Longitude</label>
                        <input value={longitude} readOnly placeholder="Auto-filled" />
                      </div>
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
                  </button>
                </form>
              </div>
            </div>
          </section>

          <section className="panel" id="reports">
            <div className="section-heading">
              <div>
                <p className="eyebrow">All Reports</p>
                <h2>Recently reported issues</h2>
                <p>Search and explore submitted road reports.</p>
              </div>
              <span className="report-count">{filteredReports.length} reports</span>
            </div>

            <div className="report-toolbar">
              <div className="search-control">
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

            <div className="table-wrap desktop-table">
              {loadingReports ? (
                <div className="empty-state">Loading road reports...</div>
              ) : filteredReports.length === 0 ? (
                <div className="empty-state">
                  No matching reports found. Try changing your search or filter.
                </div>
              ) : (
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Severity</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report, index) => {
                      const level = (report.severity || "Medium").toLowerCase();

                      return (
                        <tr key={report.id ?? index}>
                          <td>{report.location || "Unknown location"}</td>
                          <td>
                            <span className={`severity-badge severity-${level}`}>
                              {report.severity || "Medium"}
                            </span>
                          </td>
                          <td>{report.description || "No description provided."}</td>
                          <td>{report.status || "Pending"}</td>
                          <td>{formatDate(report.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="reports-list mobile-cards">
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
                    <article className="report-row" key={report.id ?? `card-${index}`}>
                      <div className="report-row-main">
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
        </main>

        <footer className="footer">
          <span>© {new Date().getFullYear()} RoadSense AI</span>
          <span>AI-powered road intelligence</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
