import { useAdmin } from "../hooks/useAdmin"
import { useUsers } from "../hooks/useUsers";
import { useNavigate } from "react-router-dom";
import "./UserManagement.css";

export default function UserManagement() {
    const { users, loading, error, removeUser, togglePrivilege } = useUsers();
    const { loadingOtp, generateAdminOtp } = useAdmin();
    const navigate = useNavigate();

    if (loading) return <p>Loading users...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="container">
            <div className="box" style={{ maxWidth: "800px", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2>User Management</h2>
                    <div className='button-container'>
                        <button className="button" onClick={generateAdminOtp} disabled={loadingOtp}>
                            {loadingOtp ? "Generating..." : "Generate Admin OTP"}
                        </button>
                        <button className="button" onClick={() => navigate("/profile")}>
                            Back to Profile
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table width="100%" style={{ textAlign: "left", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #ddd" }}>
                                <th style={{ padding: "10px" }}>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "10px" }}>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span
                                            style={{
                                                padding: "4px 8px",
                                                borderRadius: "12px",
                                                fontSize: "0.85em",
                                                background: user.isAdmin ? "#d4edda" : "#e2e3e5",
                                                color: user.isAdmin ? "#155724" : "#383d41",
                                            }}
                                        >
                                            {user.isAdmin ? "Admin" : "User"}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button
                                                className="button"
                                                style={{ padding: "6px 12px", fontSize: "0.85em", background: "#f0ad4e", color: "white" }}
                                                onClick={() => togglePrivilege(user.id, !user.isAdmin)}
                                            >
                                                {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                                            </button>
                                            <button
                                                className="button"
                                                style={{ padding: "6px 12px", fontSize: "0.85em", background: "#d9534f", color: "white" }}
                                                onClick={() => {
                                                    if (window.confirm("Are you sure you want to delete this user?")) {
                                                        removeUser(user.id);
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
