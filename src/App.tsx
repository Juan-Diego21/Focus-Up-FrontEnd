import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/auth/RequireAuth";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { SurveyPage } from "./pages/SurveyPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        {(() => {
          const path = window.location.pathname;

          switch (path) {
            case "/login":
              return <LoginPage />;
            case "/register":
              return <RegisterPage />;
            case "/confirmation":
              return <ConfirmationPage />;
            case "/survey":
              return <SurveyPage />;
            case "/forgot-password":
              return <ForgotPasswordPage />;
            case "/dashboard":
            default:
              return (
                <RequireAuth>
                  <DashboardPage />
                </RequireAuth>
              );
          }
        })()}
      </div>
    </AuthProvider>
  );
}

export default App;
