import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import { UserProvider } from "./contexts/UserContext";
import HomePage from "./pages/HomePage";
import WorkSpacePage from "./pages/WorkSpacePage";
import DocumentEditor from "./components/DocumentEditor";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";

function App() {
  return (
    <UserProvider>
      <WorkspaceProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route element={<PrivateRoute />}>
                <Route path="/workspace" element={<WorkSpacePage />} />
                <Route
                  path="/workspace/folder/:id"
                  element={<WorkSpacePage />}
                />
                <Route
                  path="/workspace/document/:id"
                  element={<DocumentEditor />}
                />
                <Route path="/about" element={<h1>About (Private)</h1>} />
                <Route path="/workspace/starred" element={<WorkSpacePage />} />
                <Route path="/workspace/recent" element={<WorkSpacePage />} />
                <Route path="/workspace/trash" element={<WorkSpacePage />} />
                <Route path="/about" element={<h1>About (Private)</h1>} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </WorkspaceProvider>
    </UserProvider>
  );
}

export default App;
