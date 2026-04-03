import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthContext from "../Context/AuthContext";

const OAuthCallback = () => {
  const { completeOAuthLogin } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    completeOAuthLogin(token)
      .then(() => navigate("/", { replace: true }))
      .catch(() => navigate("/login", { replace: true }));
  }, [completeOAuthLogin, navigate, searchParams]);

  return (
    <h2 className="text-center" style={{ padding: "10rem" }}>
      Completing sign in...
    </h2>
  );
};

export default OAuthCallback;
