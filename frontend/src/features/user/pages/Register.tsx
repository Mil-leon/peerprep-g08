import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button, Card, CardBody, CardHeader, Form } from "@heroui/react";
import { registerUser } from "../api/auth";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await registerUser({ username, email, password, code });
      localStorage.setItem("token", data.data.accessToken);
      navigate("/");
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong");
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
          <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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

            {errorMessage && (
              <div className="text-center text-sm text-red-500">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              color="warning"
              className="w-full mt-2 text-white font-semibold"
            >
              Register
            </Button>
            <p className="text-center text-sm text-gray-500">
              Have an account?{" "}
              <Link to="/login" className="text-orange-500 hover:underline">
                Log in
              </Link>
            </p>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
