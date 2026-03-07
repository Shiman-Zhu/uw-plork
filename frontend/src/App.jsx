import { useState } from "react";
import { api } from "./api";
import { BASE_CSS } from "./constants";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import MainApp from "./pages/MainApp";

// Root App Component - Router
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [userId, setUserId] = useState(null);

  return (
    <>
      <style>{BASE_CSS}</style>
      {screen === "login" && (
        <Login
          onBack={() => setScreen("landing")}
          onSuccess={(id) => {
            setUserId(id);
            setScreen("app");
          }}
        />
      )}
      {screen === "onboarding" && (
        <Onboarding
          onBack={() => setScreen("landing")}
          onComplete={(id) => {
            setUserId(id);
            setScreen("app");
          }}
        />
      )}
      {screen === "app" && <MainApp userId={userId} />}
      {screen === "landing" && (
        <Landing
          onLogin={() => setScreen("login")}
          onSignup={() => setScreen("onboarding")}
        />
      )}
    </>
  );
}
