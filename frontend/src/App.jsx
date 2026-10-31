import { useState, useEffect } from "react";
import "./App.css";
import RoadMap from "./RoadMap";

const API_URL = "http://127.0.0.1:8000";

function App() {
  // Form states
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  // Reports and loading states
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  // Load saved reports from backend
  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch(`${API_URL}/reports`);

        if (!response.ok) {
          throw new Error("Failed to load reports");
        }

        const data = await response.json();
        setReports(data);
        setErrorMessage("");
      } catch (error) {
        console.error("Error loading reports:", error);
        setErrorMessage(
          "Could not connect to the backend. Please check whether the server is running."
        );
      } finally {
        setLoadingReports(false);
      }
    }

    loadReports();
  }, []);

  // Submit a pothole report to the backend
  const handleReportSubmit = async (event) => {
    event.preventDefault();

    const reportData = {
      location: location.trim(),
      severity,
      description: description.trim(),
      latitude: latitude === "" ? null : Number(latitude),
      longitude: longitude === "" ? null : Number(longitude),
    };

    if (!reportData.location || !reportData.description) {
      alert("Please enter the location and description.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to submit report");
      }

      const savedReport = await response.json();

      setReports((previousReports) => [
        savedReport,
        ...previousReports,
      ]);

      setLocation("");
      setSeverity("Medium");
      setDescription("");
      setImage(null);
      setLatitude("");
      setLongitude("");

      // Reset the file input
      event.target.reset();

      alert("Pothole report submitted successfully!");
    } catch (error) {
      console.error("Report submission error:", error);
      setErrorMessage(
        "Report submit nahi hui. Please check that the backend is running."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Scroll to a section
  function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
    });
  }

  const pendingReports = reports.filter(
    (report) => report.status === "Pending"
  ).length;
  const highReports = reports.filter(
    (report) => report.severity === "High"
  ).length;

  const mediumReports = reports.filter(
    (report) => report.severity === "Medium"
  ).length;

  const lowReports = reports.filter(
    (report) => report.severity === "Low"
  ).length;
  const refreshReports = async () => {
    try {
      setLoadingReports(true);

      const response = await fetch(`${API_URL}/reports`);

      if (!response.ok) {
        throw new Error("Failed to refresh reports");
      }

      const data = await response.json();
      setReports(data);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Unable to refresh reports.");
    } finally {
      setLoadingReports(false);
    }
  };
  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.location
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "All" ||
      report.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">🚗 RoadSense AI</div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#map">Road Map</a>
          <a href="#report-form">Report</a>
        </div>

        <button
          className="login-btn"
          onClick={() => scrollToSection("report-form")}
        >
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="tagline">AI-POWERED ROAD INTELLIGENCE</p>

          <h1>
            Smarter Roads.
            <br />
            Safer Journeys.
          </h1>

          <p className="description">
            RoadSense AI uses artificial intelligence and crowdsourced
            data to detect potholes, monitor road conditions, and help
            authorities prioritize road repairs.
          </p>

          <div className="buttons">
            <button
              className="primary-btn"
              onClick={() => scrollToSection("report-form")}
            >
              Report a Pothole
            </button>

            <button
              className="secondary-btn"
              onClick={() => scrollToSection("map")}
            >
              Explore Road Map
            </button>
          </div>
        </div>

        {/* Road Health Card */}
        <div className="hero-card">
          <div className="card-icon">📍</div>

          <h2>Road Health</h2>
          <p>Road condition monitoring</p>

          <div className="stats">
            <div>
              <strong>{reports.length}</strong>
              <span>Reports</span>
            </div>

            <div>
              <strong>86%</strong>
              <span>Healthy</span>
            </div>

            <div>
              <strong>{pendingReports}</strong>
              <span>Pending</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="dashboard" id="dashboard">
        <div className="section-heading">
          <p className="tagline">ROAD MONITORING</p>
          <h2>Road Health Dashboard</h2>
          <p>
            Monitor road conditions and identify areas that need attention.
          </p>
        </div>
        <button
          className="primary-btn"
          onClick={refreshReports}
          disabled={loadingReports}
        >
          {loadingReports ? "Refreshing..." : "🔄 Refresh Data"}
        </button>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span className="dashboard-icon">🛣️</span>
            <h3>{reports.length}</h3>
            <p>Total Reports</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-icon">🔴</span>
            <h3>{highReports}</h3>
            <p>High Severity</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-icon">🟠</span>
            <h3>{mediumReports}</h3>
            <p>Medium Severity</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-icon">🟢</span>
            <h3>{lowReports}</h3>
            <p>Low Severity</p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section" id="map">
        <div className="section-heading">
          <p className="tagline">ROAD MAP</p>
          <h2>Reported Road Issues</h2>
          <p>
            Explore road damage reports submitted through RoadSense AI.
          </p>
        </div>

        <div className="map-container">
          <RoadMap reports={reports} />
        </div>
      </section>

      {/* Report Form */}
      <section className="report-section" id="report-form">
        <div className="section-heading">
          <p className="tagline">REPORT ROAD DAMAGE</p>
          <h2>Report a Pothole</h2>
          <p>
            Help make roads safer by reporting potholes and damaged roads.
          </p>
        </div>

        <form className="report-form" onSubmit={handleReportSubmit}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            placeholder="Enter road or area name"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            required
          />

          <label htmlFor="severity">Severity</label>
          <select
            id="severity"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Describe the pothole or road damage"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />

          <label htmlFor="image">Upload Image (optional)</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(event) =>
              setImage(event.target.files?.[0] || null)
            }
          />

          {image && (
            <p>
              Selected image: {image.name}
            </p>
          )}

          <p className="image-note">
            Note: Image upload is not connected to the backend yet.
          </p>

          <button
            type="submit"
            className="primary-btn"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>

        {/* Error Message */}
        {errorMessage && (
          <p role="alert" className="error-message">
            {errorMessage}
          </p>
        )}

        {/* Submitted Reports */}
        <div className="submitted-reports">
          <h3>Submitted Reports ({reports.length})</h3>
          <div className="report-filters">
            <input
              type="text"
              placeholder="🔍 Search by location..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          {loadingReports ? (
            <p>Loading reports...</p>
          ) : reports.length === 0 ? (
            <p>No reports submitted yet. Submit your first report above.</p>
          ) : (
            filteredReports.map((report) => (
              <div className="report-item" key={report.id}>
                <h4>{report.location}</h4>

                <p>
                  <strong>Severity:</strong> {report.severity}
                </p>

                <p>
                  <strong>Description:</strong> {report.description}
                </p>

                <p>
                  <strong>Status:</strong> {report.status}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="features" id="report">
        <div className="section-heading">
          <p className="tagline">HOW IT WORKS</p>
          <h2>From Detection to Action</h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Detect</h3>
            <p>
              Smartphone cameras and sensors can help identify road damage.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Analyze</h3>
            <p>
              AI can analyze road images and estimate the severity of damage.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Map</h3>
            <p>
              Reported problems can be displayed on a road-health map.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>Prioritize</h3>
            <p>
              Authorities can use road reports to prioritize repairs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="logo">RoadSense AI</div>
        <p>Turning Every Ride into Road Intelligence.</p>
        <p>© 2026 RoadSense AI</p>
      </footer>
    </div>
  );
}

export default App;
