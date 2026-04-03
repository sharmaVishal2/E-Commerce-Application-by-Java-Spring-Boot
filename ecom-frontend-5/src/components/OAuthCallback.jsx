import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const OAuthCallback = () => {
  const { completeOAuthLogin } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (oauthError) {
      navigate(`/login?error=${encodeURIComponent(oauthError)}`, { replace: true });
      return;
    }

    const token = searchParams.get("token");

    if (!token) {
      navigate("/login?error=oauth_token_missing", { replace: true });
      return;
    }

    completeOAuthLogin(token)
      .then(() => navigate("/", { replace: true }))
      .catch(() => navigate("/login?error=oauth_login_failed", { replace: true }));
  }, [completeOAuthLogin, navigate, oauthError, searchParams]);

  return (
    <h2 className="text-center" style={{ padding: "10rem" }}>
      Completing sign in...
    </h2>
  );
};

export default OAuthCallback;
