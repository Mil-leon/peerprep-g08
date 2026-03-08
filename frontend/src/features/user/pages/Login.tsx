import { useState } from "react";
import "./Login.css"
import {Link, useNavigate} from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            localStorage.setItem("token", data.token);

            console.log("Login successful:", data);

            // Navigate to home route without page reload
            navigate("/");

        } catch (error: any) {
            console.error("Error:", error);
            alert(error.message || "Something went wrong");
        }
    };


    return (
        <div className="container">
            <div className="box">
                <h3>Login to PeerPrep</h3>
                <form className="form" onSubmit={handleSubmit}>
                    <label>
                        Email:
                        <input
                            className="input"
                            type="text"
                            value={email}
                            placeholder="m@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>
                    <label>
                        Password:
                        <input
                            className="input"
                            type="password"
                            value={password}
                            placeholder="Enter Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                    <button className="button" type={"submit"}>Submit</button>
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register">
                            Register
                        </Link>
                    </p>

                </form>
            </div>
        </div>
    )
}