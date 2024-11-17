import { useEffect } from "react";
import LoadingSpinner from "../components/Common/Loader";
import { useAuth0 } from "@auth0/auth0-react";

export default function Redirect({ isLogin }: { isLogin: boolean }) {
  const { isAuthenticated, user } = useAuth0();

  useEffect(() => {
    document.title = "Redirecting...";
    document.body.style.backgroundColor = "#1f2937";
  }, []);

  useEffect(() => {
    // Navigate to the intended path, for example using history.push in React Router
    if ((isLogin && isAuthenticated) || (!isLogin && !isAuthenticated)) {
      console.log(user)

      // Redirect after login
      let redirectPath = localStorage.getItem("loginRedirectPath");
      if (redirectPath) {
        localStorage.removeItem("loginRedirectPath"); // Clear after retrieving
        if (user?.sub) {
          redirectPath = redirectPath.replace('${userId}', user?.sub)
        }

        window.location.href = `${window.location.origin}${redirectPath}`;
      }
    }
  }, [isAuthenticated]);

  return (
    <div className="mt-20">
      <LoadingSpinner size="lg" dark={false} />
    </div>
  );
}
