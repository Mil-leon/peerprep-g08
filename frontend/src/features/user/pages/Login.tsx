import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button, Card, CardBody, CardHeader, Form } from "@heroui/react";
import { loginUser } from "../api/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.data.accessToken);
      // Store user data for later use (e.g., chat component needs username)
      localStorage.setItem("userData", JSON.stringify({
        id: data.data.id,
        username: data.data.username,
        email: data.data.email,
        isAdmin: data.data.isAdmin,
      }));
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
          <h3 className="text-xl font-semibold">Login to PeerPrep</h3>
        </CardHeader>
        <CardBody className="px-8 py-6">
          <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              errorMessage="Please enter a valid email"
              label="Email"
              name="email"
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
              Log In
            </Button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-orange-500 hover:underline">
                Register
              </Link>
            </p>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
