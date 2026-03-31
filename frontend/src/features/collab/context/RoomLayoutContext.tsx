import { createContext, useContext, useState, type ReactNode } from "react";

interface RoomLayoutState {
  questionCollapsed: boolean;
  chatCollapsed: boolean;
  toggleQuestion: () => void;
  toggleChat: () => void;
}

const RoomLayoutContext = createContext<RoomLayoutState | undefined>(undefined);

export function RoomLayoutProvider({ children }: { children: ReactNode }) {
  const [questionCollapsed, setQuestionCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(false);

  const toggleQuestion = () => setQuestionCollapsed((prev) => !prev);
  const toggleChat = () => setChatCollapsed((prev) => !prev);

  return (
    <RoomLayoutContext.Provider
      value={{ questionCollapsed, chatCollapsed, toggleQuestion, toggleChat }}
    >
      {children}
    </RoomLayoutContext.Provider>
  );
}

export function useRoomLayout() {
  const ctx = useContext(RoomLayoutContext);
  if (!ctx) throw new Error("useRoomLayout must be used inside RoomLayoutProvider");
  return ctx;
}
