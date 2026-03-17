import { useNavigate } from "react-router-dom";
import { Button, Spinner } from "@heroui/react";
import PageLayout from "../shared/components/PageLayout";
import { useUserProfile } from "../features/user/hooks/useUserProfile";

export default function Home() {
  const { data: user, isLoading } = useUserProfile();

  const navigate = useNavigate();

  if (isLoading) return <Spinner />;

  if (!user)
    return (
      <PageLayout>
        <div>Something went wrong with login, redirecting...</div>
      </PageLayout>
    );

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center mt-16 gap-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to PeerPrep, {user?.username}! 🎉
        </h1>
        <p className="text-gray-500 text-sm">
          What would you like to do today?
        </p>

        <div className="flex flex-col items-center text-center h-full max-w-xs gap-2">
          <Button
            color="primary"
            className="w-full text-center"
            onPress={() => navigate("/profile")}
          >
            Your Profile
          </Button>
          {user.isAdmin && (
            <Button
              color="warning"
              className="w-full"
              onPress={() => navigate("/generate-otp")}
            >
              Generate Admin OTP
            </Button>
          )}
          {!user.isAdmin && (
            <Button
              color="secondary"
              className="w-full"
              onPress={() => navigate("/admin-upgrade")}
            >
              Enter Admin Upgrade OTP
            </Button>
          )}
          <Button
            color="danger"
            className="w-full"
            onPress={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Log Out
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
