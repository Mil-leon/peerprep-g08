import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import Login from "./features/user/pages/Login.tsx";
import Register from "./features/user/pages/Register.tsx";
import Profile from "./features/user/pages/Profile.tsx";
import UserManagement from "./features/user/pages/UserManagement.tsx";

function Home() {
    const navigate = useNavigate()

    return (
        <div>
            <h1>Welcome to PeerPrep 🎉</h1>
            <button
                className="button"
                onClick={() => navigate("/profile")}
            >
                Your Profile
            </button>
        </div>
    )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                <Route
                    path="/admin/UserManagement"
                    element={
                        <ProtectedRoute>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
