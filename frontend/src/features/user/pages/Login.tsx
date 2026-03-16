import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_USER_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
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
          <h3 className="text-xl font-semibold">Login to PeerPrep</h3>
        </CardHeader>
        <CardBody className="px-8 py-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onValueChange={setEmail}
              placeholder="m@example.com"
              variant="bordered"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onValueChange={setPassword}
              placeholder="Enter Password"
              variant="bordered"
            />
            <Button type="submit" color="warning" className="w-full mt-2 text-white font-semibold">
              Log In
            </Button>
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-orange-500 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
