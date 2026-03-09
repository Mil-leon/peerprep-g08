import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch profile");
        }

        setUser(result.data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="container">
      <div className="box">

        <h2>{user.username}</h2>

        <p>{user.email}</p>

        <p>{user.isAdmin ? "admin" : "user"}</p>

        <div className="button-container">

            {
                user.isAdmin ? (
                    <button
                        className="button"
                        onClick={() => navigate("/admin/users")}
                    >
                        View All Users
                    </button>
                ) : (
                    <button
                        className="button"
                        onClick={() => navigate("/upgrade")}
                    >
                        Upgrade Permissions
                    </button>
                )
            }

            <button
                className="button"
            onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
            }}
            >
            Logout
            </button>

        </div>
      </div>
    </div>
  );
}