import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import { UserProvider } from "./contexts/UserContext";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route element={<PrivateRoute />}>
              <Route path="/about" element={<h1>About (Private)</h1>} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
