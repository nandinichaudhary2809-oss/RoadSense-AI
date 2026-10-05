import "./App.css";

function App() {
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">🚗 RoadSense AI</div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#dashboard">Dashboard</a>
          <a href="#map">Road Map</a>
          <a href="#report">Report</a>
        </div>

        <button className="login-btn">Get Started</button>
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
            <button className="primary-btn">Report a Pothole</button>
            <button className="secondary-btn">Explore Road Map</button>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-icon">📍</div>

          <h2>Road Health</h2>
          <p>Real-time road condition monitoring</p>

          <div className="stats">
            <div>
              <strong>1,248</strong>
              <span>Reports</span>
            </div>

            <div>
              <strong>86%</strong>
              <span>Healthy</span>
            </div>

            <div>
              <strong>42</strong>
              <span>Issues</span>
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
            <h3>1,248</h3>
            <p>Total Reports</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-icon">⚠️</span>
            <h3>42</h3>
            <p>Active Issues</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-icon">🔧</span>
            <h3>76</h3>
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
          <p className="tagline">LIVE ROAD MAP</p>
          <h2>Road Issues Near You</h2>
          <p>
            View reported potholes and road damage on the map.
          </p>
        </div>

        <div className="map-container">
          <div className="map-placeholder">
            <div className="map-content">
              <span>🗺️</span>
              <h3>Live Road Map</h3>
              <p>
                Interactive map will appear here once the map service
                is connected.
              </p>

              <button className="primary-btn">
                Explore Reports
              </button>
            </div>

            <div className="map-marker marker-one">📍</div>
            <div className="map-marker marker-two">📍</div>
            <div className="map-marker marker-three">📍</div>
          </div>
        </div>
      </section>

      {/* How it works */}
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
              Smartphone cameras and sensors help identify road damage.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Analyze</h3>
            <p>
              AI analyzes the detected road issue and determines its
              severity.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Map</h3>
            <p>
              Detected problems are displayed on a live road-health map.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚧</div>
            <h3>Prioritize</h3>
            <p>
              Authorities can prioritize repairs using intelligent
              insights.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="logo">🚗 RoadSense AI</div>
        <p>Turning Every Ride into Road Intelligence.</p>
        <p>© 2026 RoadSense AI</p>
      </footer>
    </div>
  );
}

export default App;