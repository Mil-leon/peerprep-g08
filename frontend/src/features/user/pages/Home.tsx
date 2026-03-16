import { useNavigate } from "react-router-dom";
import PageLayout from "../../../shared/components/PageLayout";
import { Button, Card, CardBody } from "@heroui/react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center mt-16 gap-6">
        <h1 className="text-3xl font-bold text-gray-800">Welcome to PeerPrep! 🎉</h1>
        <p className="text-gray-500 text-sm">What would you like to do today?</p>

        <Card className="w-full max-w-sm" shadow="sm">
          <CardBody className="flex flex-col gap-3 py-6 px-8">
            <Button color="primary" variant="flat" className="w-full" onPress={() => navigate("/profile")}>
              Your Profile
            </Button>
            <Button color="warning" variant="flat" className="w-full" onPress={() => navigate("/generate-otp")}>
              Generate Admin OTP
            </Button>
            <Button color="secondary" variant="flat" className="w-full" onPress={() => navigate("/admin-upgrade")}>
              Enter Admin Upgrade OTP
            </Button>
            <Button color="danger" variant="flat" className="w-full" onPress={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}>
              Log Out
            </Button>
          </CardBody>
        </Card>
      </div>
    </PageLayout>
  );
}
