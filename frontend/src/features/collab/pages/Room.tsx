import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Tooltip,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

import { joinRoom, endRoom } from "../services/api";
import { RoomLayoutProvider } from "../context/RoomLayoutContext";
import SplitPaneLayout, { PanelToggleButtons } from "../components/SplitPane";
import QuestionPanel from "../components/QuestionPanel";
import EditorPanel from "../components/EditorPanel";
import ChatPanel from "../components/ChatPanel";
import PanelErrorBoundary from "../components/PanelErrorBoundary";

/**
 * Room page — three-panel split view.
 *
 * The matching service creates the room (POST /rooms/create) with { questionId }
 * before navigating users here. On mount we call POST /rooms/join which returns
 * { roomId, questionId } — no URL params needed.
 */
export default function Room() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [language, setLanguage] = useState("javascript");
  const [roomReady, setRoomReady] = useState(false);
  /**
   * questionId is null until the matchservice populates it.
   * QuestionPanel handles the null case gracefully.
   */
  const [questionId, setQuestionId] = useState<string | null>(null);

  // ── Join room & hydrate metadata ────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    joinRoom(id)
      .then(({ data }) => {
        setQuestionId(data.questionId ?? null);
        setRoomReady(true);
      })
      .catch(() => {
        alert("Room does not exist!");
        navigate("/");
      });
  }, [id, navigate]);

  // ── End room ────────────────────────────────────────────────────────────────
  const handleConfirmEnd = async (onClose: () => void) => {
    try {
      await endRoom(id!);
    } catch {
      // Room may already be gone — navigate regardless
    }
    onClose();
    navigate("/");
  };

  if (!roomReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-default-500">Joining room…</p>
        </div>
      </div>
    );
  }

  return (
    <RoomLayoutProvider>
      <div className="flex flex-col h-screen w-screen bg-background overflow-hidden">
        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <header className="flex-none flex items-center justify-between px-4 py-2 border-b border-divider bg-content1 z-10">
          {/* Left: branding + room badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-tight text-foreground select-none">
              PeerPrep
            </span>
            <Chip size="sm" variant="flat" className="font-mono text-xs">
              Room: {id}
            </Chip>
          </div>

          {/* Center: panel visibility toggles */}
          <PanelToggleButtons />

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Tooltip content="End session for everyone" placement="bottom">
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onPress={onOpen}
                id="end-room-btn"
              >
                End Room
              </Button>
            </Tooltip>
          </div>
        </header>

        {/* ── Three-panel body ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden">
          <SplitPaneLayout
            questionPanel={
              <PanelErrorBoundary fallbackLabel="Question panel error">
                <QuestionPanel questionId={questionId} />
              </PanelErrorBoundary>
            }
            editorPanel={
              <PanelErrorBoundary fallbackLabel="Editor panel error">
                <EditorPanel
                  language={language}
                  onLanguageChange={setLanguage}
                >
                  {/*
                   * ── Monaco injection point ──────────────────────────
                   * Install @monaco-editor/react then replace this comment:
                   *
                   *   import MonacoEditor from "@monaco-editor/react";
                   *
                   *   <MonacoEditor
                   *     height="100%"
                   *     language={language}
                   *     theme="vs-dark"
                   *     options={{ fontSize: 14, minimap: { enabled: false } }}
                   *   />
                   * ────────────────────────────────────────────────────
                   */}
                </EditorPanel>
              </PanelErrorBoundary>
            }
            chatPanel={
              <PanelErrorBoundary fallbackLabel="Chat panel error">
                <ChatPanel roomId={id!} />
              </PanelErrorBoundary>
            }
          />
        </main>

        {/* ── End-room confirmation modal ──────────────────────────────── */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>End Room?</ModalHeader>
                <ModalBody>
                  <p className="text-sm text-default-600">
                    This will permanently close the room for all participants.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onPress={() => handleConfirmEnd(onClose)}
                    id="confirm-end-room-btn"
                  >
                    Confirm End
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </RoomLayoutProvider>
  );
}