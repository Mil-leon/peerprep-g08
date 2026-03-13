import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { type JSX } from "react";
import QuestionPage from "./features/questions/pages/QuestionPage.tsx";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

import Login from "./features/user/pages/Login.tsx";
import Register from "./features/user/pages/Register.tsx";
import Profile from "./features/user/pages/Profile.tsx";
import UserManagement from "./features/user/pages/UserManagement.tsx";
import Home from "./features/user/pages/Home.tsx"

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
                    path="/questions"
                    element={
                            <QuestionPage />
                    }
                />
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
