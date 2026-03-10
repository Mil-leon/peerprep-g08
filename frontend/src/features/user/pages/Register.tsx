import { useState } from "react";
import "./Register.css"
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_USER_API_URL}/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            localStorage.setItem("token", data.token);

            console.log("Registration successful:", data);

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
                <h3>Create PeerPrep Account</h3>
                <form className="form" onSubmit={handleSubmit}>
                    <label>
                        Username:
                        <input
                            className="input"
                            type="text"
                            value={username}
                            placeholder="Username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>
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
                        Create Password:
                        <input
                            className="input"
                            type="text"
                            value={password}
                            placeholder="Enter Password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                    <button className="button" type={"submit"}>Register</button>
                    <p>
                        Have an account?{" "}
                        <Link to="/login">
                            Log in
                        </Link>
                    </p>

                </form>
            </div>
        </div>
    )
}
