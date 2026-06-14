interface InputBarProps {
  value: string;
  disabled: boolean;
  isListening: boolean;
  speechSupported: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onMicClick: () => void;
}

export function InputBar({
  value,
  disabled,
  isListening,
  speechSupported,
  onChange,
  onSubmit,
  onMicClick
}: InputBarProps) {
  return (
    <form
      className="input-bar"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="input-bar-inner">
        <button
          className={`mic-button ${isListening ? "is-listening" : ""}`}
          type="button"
          onClick={onMicClick}
          disabled={disabled}
          title={speechSupported ? "Voice input" : "Voice input is not supported in this browser"}
          aria-label="Voice input"
        >
          {isListening ? (
            <span className="mic-stop" aria-hidden="true" />
          ) : (
            <svg className="mic-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4.75a3 3 0 0 0-3 3v4.1a3 3 0 0 0 6 0v-4.1a3 3 0 0 0-3-3Z" />
              <path d="M6.75 11.25v.65a5.25 5.25 0 0 0 10.5 0v-.65" />
              <path d="M12 17.15v2.1" />
              <path d="M9.4 19.25h5.2" />
            </svg>
          )}
        </button>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Say something to Codra..."
          disabled={disabled}
          aria-label="Message to Codra"
        />
        <button className="send-button" type="submit" disabled={disabled || !value.trim()}>
          Send
        </button>
      </div>
    </form>
  );
}
