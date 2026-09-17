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

    let redirectTimer;

    completeOAuthLogin(token)
      .then(() => navigate("/", { replace: true }))
      .catch((oauthError) => {
        setError(oauthError.message || "Unable to verify your sign-in.");
        redirectTimer = window.setTimeout(() => navigate("/login", { replace: true }), 2500);
      });

    return () => window.clearTimeout(redirectTimer);
  }, [completeOAuthLogin, navigate, searchParams]);

  return (
    <h2 className="text-center" style={{ padding: "10rem" }}>
      {error || "Completing sign in..."}
    </h2>
  );
};

export default OAuthCallback;
