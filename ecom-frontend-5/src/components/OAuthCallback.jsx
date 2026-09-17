import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const OAuthCallback = () => {
  const { completeOAuthLogin } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    let timer;
    completeOAuthLogin(token)
      .then(() => navigate("/", { replace: true }))
      .catch((err) => {
        setError(err.message || "Unable to verify your sign-in.");
        timer = window.setTimeout(() => navigate("/login", { replace: true }), 2500);
      });
    return () => window.clearTimeout(timer);
  }, [completeOAuthLogin, navigate, searchParams]);

  return (
    <div className="oauth-callback">
      <div className="oauth-callback__card">
        {error ? (
          <>
            <span style={{ fontSize: "2rem" }}>⚠</span>
            <h3>Sign-in failed</h3>
            <p>{error}</p>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Redirecting to login…</p>
          </>
        ) : (
          <>
            <div className="oauth-spinner" aria-label="Loading" />
            <h3>Completing sign in…</h3>
            <p>Please wait a moment.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
