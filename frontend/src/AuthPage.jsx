
import { useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function AuthPage({ onLogin }) {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const endpoint = mode === "login" ? "login" : "signup";

            const response = await fetch(`${API_URL}/auth/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Something went wrong.");
            }

            if (mode === "signup") {
                setMessage("Account created successfully! Please log in.");
                setMode("login");
                setPassword("");
            } else {
                sessionStorage.setItem("roadsense-token", data.access_token);
                sessionStorage.setItem("roadsense-user", JSON.stringify(data.user));
                onLogin(data.user);
            }
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <span className="brand-mark">RS</span>
                    <div>
                        <h1>RoadSense AI</h1>
                        <p>Smarter Roads. Safer Journeys.</p>
                    </div>
                </div>

                <div className="auth-heading">
                    <p className="eyebrow">WELCOME TO ROADSENSE AI</p>
                    <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
                    <p>
                        {mode === "login"
                            ? "Log in to continue to your road intelligence dashboard."
                            : "Join the community and help make roads safer."}
                    </p>
                </div>

                <form className="report-form" onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="auth-email">Email address</label>
                        <input
                            id="auth-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="auth-password">Password</label>
                        <input
                            id="auth-password"
                            type="password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    {error && <div className="form-alert error-alert">{error}</div>}
                    {message && <div className="form-alert success-alert">{message}</div>}

                    <button className="button-primary form-submit" type="submit" disabled={loading}>
                        {loading
                            ? "Please wait..."
                            : mode === "login"
                                ? "Log In"
                                : "Create Account"}
                    </button>
                </form>

                <p className="auth-switch">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}
                    {" "}
                    <button
                        type="button"
                        onClick={() => {
                            setMode(mode === "login" ? "signup" : "login");
                            setError("");
                            setMessage("");
                        }}
                    >
                        {mode === "login" ? "Sign Up" : "Log In"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default AuthPage;
