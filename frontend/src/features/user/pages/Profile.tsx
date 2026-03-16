import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpModal from "../components/OtpModal";
import PageLayout from "../../../shared/components/PageLayout";
import { Button, Card, CardBody, Chip } from "@heroui/react";

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

  if (!user) return <p className="p-8 text-gray-500">Loading profile...</p>;

  return (
    <PageLayout>
      <div className="flex justify-center mt-10">
        <Card className="w-full max-w-md" shadow="md">
          <CardBody className="px-8 py-8 flex flex-col gap-4">
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-gray-500">{user.email}</p>
            <Chip color={user.isAdmin ? "success" : "default"} variant="flat">
              {user.isAdmin ? "Admin" : "User"}
            </Chip>

            <div className="flex flex-col gap-3 mt-4">
              {user.isAdmin ? (
                <Button color="primary" variant="flat" onPress={() => navigate("/admin/UserManagement")}>
                  View All Users
                </Button>
              ) : (
                <Button color="warning" variant="flat" onPress={() => setIsModalOpen(true)}>
                  Upgrade Permissions
                </Button>
              )}
              <Button color="danger" variant="flat" onPress={() => { localStorage.removeItem("token"); navigate("/login"); }}>
                Logout
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <OtpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleUpgradeSubmit}
        isLoading={isUpgrading}
      />
    </PageLayout>
  );
}
