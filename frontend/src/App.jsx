
import { useState } from "react";
import "./App.css";

function App() {
  // Form states
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [reports, setReports] = useState([]);

  // Submit pothole report
  function handleReportSubmit(event) {
    event.preventDefault();

    const newReport = {
      id: Date.now(),
      location: location.trim(),
      severity,
      description: description.trim(),
      imageName: image ? image.name : "No image uploaded",
      status: "Pending",
    };

    setReports((previousReports) => [
      ...previousReports,
      newReport,
    ]);

    // Reset form state
    setLocation("");
    setSeverity("Medium");
    setDescription("");
    setImage(null);

    event.target.reset();

    alert("Pothole report submitted successfully!");
  }

  // Scroll to a section
  function scrollToSection(sectionId) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
    });
  }

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

        {/* Hero Road Health Card */}
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
              <strong>
                {reports.filter((report) => report.status === "Pending").length}
              </strong>
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

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <span className="dashboard-icon">🛣️</span>
            <h3>{reports.length}</h3>
            <p>Total Reports</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-icon">⚠️</span>
            <h3>
              {reports.filter((report) => report.status === "Pending").length}
            </h3>
            <p>Active Issues</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-icon">🔧</span>
            <h3>0</h3>
            <p>Repairs Completed</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-icon">📊</span>
            <h3>86%</h3>
            <p>Road Health Score</p>
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
          <div className="map-placeholder">
            <div className="map-content">
              <span>🗺️</span>
              <h3>Road Issue Map</h3>
              <p>
                An interactive map can be connected here to show reported
                road damage by location.
              </p>

              <button
                className="primary-btn"
                onClick={() => scrollToSection("report-form")}
              >
                Report a Road Issue
              </button>
            </div>

            <div className="map-marker marker-one">📍</div>
            <div className="map-marker marker-two">📍</div>
            <div className="map-marker marker-three">📍</div>
          </div>
        </div>
      </section>

      {/* Report a Pothole Form */}
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

          <button type="submit" className="primary-btn">
            Submit Report
          </button>
        </form>

        {/* Submitted Reports */}
        <div className="submitted-reports">
          <h3>Submitted Reports ({reports.length})</h3>

          {reports.length === 0 ? (
            <p>No reports submitted yet. Submit your first report above.</p>
          ) : (
            reports.map((report) => (
              <div className="report-item" key={report.id}>
                <h4>{report.location}</h4>
                <p>
                  <strong>Severity:</strong> {report.severity}
                </p>
                <p>
                  <strong>Description:</strong> {report.description}
                </p>
                <p>
                  <strong>Image:</strong> {report.imageName}
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
            <div className="feature-icon"></div>
            <h3>Analyze</h3>
            <p>
              AI can analyze road images and estimate the severity of damage.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Map</h3>
            <p>
              Reported problems can be displayed on a road-health map.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Prioritize</h3>
            <p>
              Authorities can use road reports to prioritize repairs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="logo"> RoadSense AI</div>
        <p>Turning Every Ride into Road Intelligence.</p>
        <p>© 2026 RoadSense AI</p>
      </footer>
    </div>
  );
}

export default App;
