import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_USER_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, code }),
      });
      const data = await response.json();
      localStorage.setItem("token", data.data.accessToken);
      navigate("/");
    } catch (error: any) {
      alert(error.message || "Something went wrong");
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(255, 140, 0, 0.15), transparent 40%), radial-gradient(circle at bottom right, rgba(255, 165, 0, 0.12), transparent 40%), #ffffff",
      }}
    >
      <Card className="w-full max-w-[420px]" shadow="lg">
        <CardHeader className="flex justify-center pt-6 pb-0">
          <h3 className="text-xl font-semibold">Create PeerPrep Account</h3>
        </CardHeader>
        <CardBody className="px-8 py-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Username"
              type="text"
              value={username}
              onValueChange={setUsername}
              placeholder="Username"
              variant="bordered"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onValueChange={setEmail}
              placeholder="m@example.com"
              variant="bordered"
            />
            <Input
              label="Create Password"
              type="password"
              value={password}
              onValueChange={setPassword}
              placeholder="Enter Password"
              variant="bordered"
            />
            <Input
              label="Admin OTP (optional)"
              type="text"
              value={code}
              onValueChange={setCode}
              placeholder="Enter OTP"
              variant="bordered"
            />
            <Button type="submit" color="warning" className="w-full mt-2 text-white font-semibold">
              Register
            </Button>
            <p className="text-center text-sm text-gray-500">
              Have an account?{" "}
              <Link to="/login" className="text-orange-500 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
