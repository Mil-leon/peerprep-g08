import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Welcome to PeerPrep 🎉</h1>
            <button
                className="button"
                onClick={() => navigate("/profile")}
            >
                Your Profile
            </button>
        </div>
    );
}