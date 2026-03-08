import Login from "./features/user/pages/Login.tsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { JSX } from "react";
import Register from "./features/user/pages/Register.tsx";

function Home() {
    return <h1>Welcome to PeerPrep 🎉</h1>;
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
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

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
