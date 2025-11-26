import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Learning from "./pages/Learning";
import Guide from "./pages/Guide";
import InteractiveForm from "./pages/InteractiveForm";
import Admin from "./pages/Admin";
import { LanguageProvider } from "./context/LanguageContext";
import { Toaster } from "./components/ui/sonner";
import "@/App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <LanguageProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login setAuth={setIsAuthenticated} setUser={setUser} />} />
            <Route path="/register" element={<Register setAuth={setIsAuthenticated} setUser={setUser} />} />
            <Route path="/" element={<ProtectedRoute><Home user={user} /></ProtectedRoute>} />
            <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
            <Route path="/guide/:topic" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
            <Route path="/form/:topic" element={<ProtectedRoute><InteractiveForm /></ProtectedRoute>} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" />
      </div>
    </LanguageProvider>
  );
}

export default App;