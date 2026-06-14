import { useEffect, useState } from "react";
import { getPublicConfig, sendChatMessage } from "../lib/apiClient";
import type { CodraReply, CodraStatus, ConversationTurn, PublicConfig } from "../lib/types";

export function useCodraChat() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [status, setStatus] = useState<CodraStatus>("idle");
  const [draft, setDraft] = useState("");
  const [currentReply, setCurrentReply] = useState<CodraReply | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicConfig()
      .then(setConfig)
      .catch(() => {
        setStatus("error");
        setError("Runtime settings are quiet. Start the server and try again.");
      });
  }, []);

  const send = async () => {
    const message = draft.trim();
    if (!message || status === "thinking" || status === "speaking") return;

    try {
      setStatus("thinking");
      setError("");
      setDraft("");
      setCurrentReply(null);

      const maxTurns = config?.maxContextTurns ?? 3;
      const compactConversation = conversation.slice(-(maxTurns * 2));
      const reply = await sendChatMessage(message, compactConversation);

      setCurrentReply(reply);
      setConversation([
        ...compactConversation,
        { role: "user", content: message },
        { role: "assistant", content: reply.reply_en }
      ]);

      setStatus(config?.autoTts ? "thinking" : "idle");
    } catch {
      setCurrentReply(null);
      setStatus("error");
      setError("Something went quiet for a second. Try again.");
    }
  };

  const handleVoiceError = (message: string) => {
    setError(message);
  };

  return {
    config,
    status,
    draft,
    currentReply,
    error,
    setDraft,
    setStatus,
    setError,
    send,
    handleVoiceError
  };
}
