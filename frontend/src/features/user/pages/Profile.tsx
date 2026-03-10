import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpModal from "../components/OtpModal";

type User = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
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
          `${import.meta.env.VITE_USER_API_URL}/auth/me`,
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

  const handleUpgradeSubmit = async (code: string) => {
    setIsUpgrading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_USER_API_URL}/users/upgrade`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upgrade permissions");
      }

      // Update user state to reflect admin status
      setUser((prevUser) => prevUser ? { ...prevUser, isAdmin: true } : null);
      setIsModalOpen(false);
      alert("Successfully upgraded to Admin!");
    } catch (error: any) {
      console.error(error);
      throw error; // Let the modal catch it
    } finally {
      setIsUpgrading(false);
    }
  };

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
                onClick={() => navigate("/admin/UserManagement")}
              >
                View All Users
              </button>
            ) : (
              <button
                className="button"
                onClick={() => setIsModalOpen(true)}
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

      <OtpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpgradeSubmit}
        isLoading={isUpgrading}
      />
    </div>
  );
}
