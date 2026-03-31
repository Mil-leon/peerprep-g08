import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";

interface Message {
    id: number;
    text: string;
    senderUsername?: string;
    senderId?: string;
}

interface ChatProps {
    roomId: string;
    currentUsername: string;
}

export default function Chat({ roomId, currentUsername }: ChatProps) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        socket.emit("join_room", roomId, { username: currentUsername });

        // Listen for persisted messages from room
        socket.on("load_messages", (initialMessages: Message[]) => {
            setMessages(initialMessages);
        });

        // Listen for new incoming messages
        socket.on("receive_message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        // Listen for room ended event
        socket.on("room_ended", (data) => {
            alert(data.message || "The room has been closed");
            navigate("/");
        });

        return () => {
            socket.off("load_messages");
            socket.off("receive_message");
            socket.off("room_ended");
        };
    }, [roomId, currentUsername, navigate]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit("send_message", { roomId, message, senderUsername: currentUsername });
        setMessage("");
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const isSentMessage = (msg: Message) => {
        return msg.senderUsername === currentUsername;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 px-2">
                {messages.map((msg, i) => {
                    const isSent = isSentMessage(msg);
                    return (
                        <div
                            key={i}
                            className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}>
                                <p className="text-xs font-semibold text-default-500 mb-1 px-2">
                                    {msg.senderUsername || "Unknown"}
                                </p>
                                <div
                                    className={`max-w-xs break-words p-3 rounded-lg ${
                                        isSent
                                            ? "bg-primary text-primary-foreground rounded-br-none"
                                            : "bg-default-200 text-default-900 rounded-bl-none"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button color="primary" onClick={sendMessage}>
                    Send
                </Button>
            </div>
        </div>
    );
}