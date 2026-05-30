import React, { useState, useEffect } from "react";

const Contact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  useEffect(() => {
    const handleChatBotOpened = () => setIsChatBotOpen(true);
    const handleChatBotClosed = () => setIsChatBotOpen(false);
    window.addEventListener("chatbotOpened", handleChatBotOpened);
    window.addEventListener("chatbotClosed", handleChatBotClosed);
    return () => {
      window.removeEventListener("chatbotOpened", handleChatBotOpened);
      window.removeEventListener("chatbotClosed", handleChatBotClosed);
    };
  }, []);

  if (isChatBotOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 112,
        zIndex: 40,
        fontFamily: "sans-serif",
      }}
    >
      {/* Main Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#1a1a1a",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#faf9f7",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          transition: "background 0.25s, transform 0.25s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#333";
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#1a1a1a";
          e.currentTarget.style.transform = "scale(1)";
        }}
        aria-label="Contact"
      >
        {/* Question mark icon */}
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
        </svg>
      </button>

      {/* Dropdown Options */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          transformOrigin: "bottom right",
          transform: isOpen ? "scale(1)" : "scale(0.85)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "transform 0.25s ease, opacity 0.25s ease",
        }}
      >
        {/* Messenger */}
        <a
          href="https://www.facebook.com/profile.php?id=61584287818988"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setIsOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
          className="contact-item"
        >
          <span
            style={{
              background: "#faf9f7",
              border: "1px solid #e8e4df",
              padding: "4px 10px",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#1a1a1a",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "background 0.2s",
            }}
            className="contact-label"
          >
            Messenger
          </span>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              overflow: "hidden",
              border: "1px solid #e8e4df",
              flexShrink: 0,
              background: "#fff",
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Facebook_Messenger_logo_2020.svg/1024px-Facebook_Messenger_logo_2020.svg.png"
              alt="Messenger"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </a>

        {/* Zalo */}
        <a
          href="https://zalo.me/0337300592"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setIsOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              background: "#faf9f7",
              border: "1px solid #e8e4df",
              padding: "4px 10px",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#1a1a1a",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            Zalo
          </span>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              overflow: "hidden",
              border: "1px solid #e8e4df",
              flexShrink: 0,
              background: "#fff",
            }}
          >
            <img
              src="https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Zalo-Arc.png"
              alt="Zalo"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </a>
      </div>
    </div>
  );
};

export default Contact;
