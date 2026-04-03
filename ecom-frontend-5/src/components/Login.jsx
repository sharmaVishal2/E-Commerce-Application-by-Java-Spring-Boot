import { useContext, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const Login = () => {
  const { isAuthenticated, login, socialLogin, authReady } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get("error");

  if (authReady && isAuthenticated) {
    const destination = location.state?.from?.pathname || "/";
    return <Navigate to={destination} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await login(credentials.username, credentials.password);
    setSubmitting(false);

    if (result.success) {
      const destination = location.state?.from?.pathname || "/";
      navigate(destination, { replace: true });
      return;
    }

    setError(result.message);
  };

  return (
    <div
      className="container"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "90px",
        paddingBottom: "24px",
        maxWidth: "560px",
      }}
    >
      <div className="card p-4 shadow-sm" style={{ width: "100%" }}>
        <h2 className="mb-3">Sign In</h2>
        <p className="text-muted">Use your account credentials to continue.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
          {oauthError ? (
            <div className="alert alert-danger">
              {oauthError === "oauth_token_missing"
                ? "OAuth login did not return a token."
                : oauthError === "oauth_login_failed"
                  ? "OAuth login failed after redirect."
                  : `OAuth error: ${oauthError}`}
            </div>
          ) : null}
          {error ? <div className="alert alert-danger">{error}</div> : null}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </button>
          <div className="mt-4">
            <p className="text-muted mb-2">Or continue with</p>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-outline-dark"
                type="button"
                onClick={() => socialLogin("google")}
              >
                Sign in with Google
              </button>
              <button
                className="btn btn-outline-dark"
                type="button"
                onClick={() => socialLogin("github")}
              >
                Sign in with GitHub
              </button>
            </div>
          </div>
          <p className="mt-3 mb-0">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
