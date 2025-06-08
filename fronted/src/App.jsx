import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import WorkSpacePage from "./pages/WorkSpacePage";
import PrivateRoute from "./components/General/PrivateRoute";
import { Bounce, ToastContainer } from "react-toastify";
import Layout from "./components/General/Layout";
import DocumentEditor from "./components/Editor/DocumentEditor";

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
                <Route path="/workspace/stared" element={<WorkSpacePage />} />
                <Route path="/workspace/shared" element={<WorkSpacePage />} />
                <Route path="/workspace/recent" element={<WorkSpacePage />} />
                <Route path="/workspace/trash" element={<WorkSpacePage />} />
              </Route>
            </Route>
          </Routes>
        </Router>
      </WorkspaceProvider>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </UserProvider>
  );
}

export default App;
