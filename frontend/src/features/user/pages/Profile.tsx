import { useState } from "react";
import { useNavigate } from "react-router-dom";
import OtpModal from "../components/OtpModal";
import PageLayout from "../../../shared/components/PageLayout";
import { addToast, Button, Card, CardBody, Chip } from "@heroui/react";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUpgradeToAdmin } from "../hooks/useUpgradeToAdmin";

export default function Profile() {
  const { data: user, isLoading: isProfileLoading } = useUserProfile();
  const { mutate, isPending: isUpgradePending } = useUpgradeToAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleUpgradeSubmit = (code: string) => {
    mutate(code, {
      onSuccess: () => {
        setIsModalOpen(false);
        addToast({
          title: "Upgrade Success!",
          description: "Successfully upgraded to admin!",
          color: "success",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      },
      onError: (err) => {
        addToast({
          title: "Error",
          description: err.message,
          color: "danger",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
        });
      },
    });
  };

  if (isProfileLoading)
    return <p className="p-8 text-gray-500">Loading profile...</p>;

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
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => navigate("/admin/manage-users")}
                >
                  View All Users
                </Button>
              ) : (
                <Button
                  color="warning"
                  variant="flat"
                  onPress={() => setIsModalOpen(true)}
                >
                  Upgrade Permissions
                </Button>
              )}
              <Button
                color="danger"
                variant="flat"
                onPress={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
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
        isLoading={isUpgradePending}
      />
    </PageLayout>
  );
}
