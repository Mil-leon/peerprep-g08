import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "./features/user/pages/Login.tsx";
import Register from "./features/user/pages/Register.tsx";
import Profile from "./features/user/pages/Profile.tsx";

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

function ProtectedRoute({ children }: { children: Element }) {
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

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
