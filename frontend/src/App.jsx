import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import PetcamPage from "./pages/PetcamPage";
import GalleryPage from "./pages/GalleryPage";
import UserPage from "./pages/UserPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPassword from '../src/components/auth/ForgotPassword';
import ResetPassword from '../src/components/auth/ResetPassword';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Listen for storage events to detect sign-out from other components
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const verifyToken = async () => {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            
            if (!token) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }
    
            try {
                const response = await fetch("http://localhost:3001/api/auth/verify-token", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    const data = await response.json();
                    if (data.error === "Token expired" || data.error === "Invalid token") {
                        setIsAuthenticated(false);
                        localStorage.removeItem("token");
                        localStorage.removeItem("user_id");
                    }
                }
            } catch (error) {
                console.error("Token verification failed:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
    
        verifyToken();
    }, []); 
    
    // Show a loading state while auth is being checked
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    return (
        <div className='font-montserrat'>
            <Router>
                <Routes>
                    <Route path="/" element={isAuthenticated ? <Navigate to="/petcam-page" replace /> : <LandingPage />} />
                    <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/petcam-page" replace /> : <ForgotPassword />} />
                    <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/petcam-page" replace /> : <ResetPassword />} />

                    <Route element={<ProtectedRoute />}>
                        {/* <Route path="/fetching-page" element={<FetchingPage />} /> */}
                        <Route path="/petcam-page" element={<PetcamPage />} />
                        <Route path="/gallery-page" element={<GalleryPage />} />
                        <Route path="/account" element={<UserPage />} />
                        <Route path="/dashboard-page" element={<DashboardPage />} />
                    </Route>
                    
                    {/* Fallback route for any unmatched paths */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;