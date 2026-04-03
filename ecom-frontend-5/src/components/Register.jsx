import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const Register = () => {
  const { isAuthenticated, authReady, register, socialLogin } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (authReady && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await register(form.username, form.password);
    setSubmitting(false);

    if (result.success) {
      navigate("/", { replace: true });
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
        <h2 className="mb-3">Create Account</h2>
        <p className="text-muted">Register to create your own account.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              className="form-control"
              name="username"
              value={form.username}
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
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-control"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          {error ? <div className="alert alert-danger">{error}</div> : null}
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Register"}
          </button>
          <div className="mt-4">
            <p className="text-muted mb-2">Or sign up with</p>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-outline-dark"
                type="button"
                onClick={() => socialLogin("google")}
              >
                Continue with Google
              </button>
              <button
                className="btn btn-outline-dark"
                type="button"
                onClick={() => socialLogin("github")}
              >
                Continue with GitHub
              </button>
            </div>
          </div>
          <p className="mt-3 mb-0">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
