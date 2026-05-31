import React from "react";
import { MapPin } from "lucide-react";
import ChatBot from "../components/ChatBot";
import Contact from "../components/Contact";

const About = () => {
  const mainImage =
    "https://i.postimg.cc/kgR9pWzR/Gemini-Generated-Image-qv6pz1qv6pz1qv6p.png";
  const image2 =
    "https://legiakhanhxd.s3.ap-southeast-1.amazonaws.com/718a3a71-17c1-46ed-aaea-3a575daa7abf.jpg";
  const image3 =
    "https://i.postimg.cc/brJSxX4F/freepik-i-want-an-image-for-opening-brand-named-kh3t-studi-86591.jpg";
  const image4 =
    "https://i.postimg.cc/7ZghTYfP/Gemini-Generated-Image-prtv8dprtv8dprtv.png";
  const headerImage =
    "https://i.postimg.cc/T33GTrZx/Gemini-Generated-Image-3j8i4w3j8i4w3j8i.png";

  const quotes = [
    {
      id: 1,
      shortText:
        "We focus on high-quality products aligned with modern trends.",
      fullText:
        "We focus on high quality products that are in line with modern trends for potential and intelligent customers.",
    },
    {
      id: 2,
      shortText:
        "HKT delivers the most trendy, luxurious, and fashionable styles.",
      fullText: "We bring the most trendy, luxurious and fashionable.",
    },
    {
      id: 3,
      shortText:
        "Fashion is intrinsically linked to life, serving as a personal highlight.",
      fullText:
        "Fashion is closely linked to life and life must have fashion as a highlight.",
    },
    {
      id: 4,
      shortText:
        "Our mission is to help you 'live your truth' through unique style.",
      fullText:
        "Our mission is to empower you to 'live your truth' and define your own unique style through our creative and bold designs.",
    },
  ];

  const timeline = [
    {
      year: "2020 – 2024",
      label: "The Foundation",
      body: "Founded and developed by 5 passionate members who shared a vision of bringing quality fashion to Vietnamese youth.",
      align: "left",
    },
    {
      year: "Early Vision",
      label: "Basic & Classic",
      body: "Our initial direction focused on timeless basic and classic pieces, creating wardrobe essentials for everyday style.",
      align: "right",
    },
    {
      year: "The Shift",
      label: "Evolution & Adaptation",
      body: "Everything changed when fashion trends evolved rapidly. We adapted, transformed, and found our unique voice in the dynamic streetwear scene.",
      align: "left",
    },
    {
      year: "2025",
      label: "Official Launch",
      body: "HKT Studio officially launched, bringing bold, trendy, and distinctive designs to the youth. A new era of self-expression through fashion begins.",
      align: "right",
    },
  ];

  const storeImages = [
    { src: image2, label: "Luxury" },
    { src: image3, label: "Trendy" },
    { src: image4, label: "Fashionable" },
  ];

  return (
    <div
      style={{
        background: "#faf9f7",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        color: "#1a1a1a",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* ── HERO IMAGE ── */}
        <div style={{ padding: "32px 0 0" }}>
          <div style={{ overflow: "hidden", height: 320 }}>
            <img
              src={headerImage}
              alt="HKT Studio Hero"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* ── BRAND HEADER ── */}
        <header style={{ textAlign: "center", padding: "72px 0 80px" }}>
          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#aaa",
              marginBottom: 16,
            }}
          >
            Est. 2025 · Ho Chi Minh City
          </p>
          <h1
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(2.8rem, 7vw, 5rem)",
              fontWeight: 400,
              letterSpacing: "0.06em",
              margin: "0 0 24px",
              lineHeight: 1.1,
            }}
          >
            HKT STUDIO
          </h1>
          <div
            style={{
              width: 48,
              height: 1,
              background: "#1a1a1a",
              margin: "0 auto 24px",
            }}
          />
          <p
            style={{
              maxWidth: 560,
              margin: "0 auto",
              fontSize: "0.9rem",
              lineHeight: 1.85,
              color: "#666",
              letterSpacing: "0.02em",
            }}
          >
            A youthful, free-spirited, and bold local brand inspiring you to
            express your individuality through creative designs. Choose HKT to
            "live your truth" and define your own style.
          </p>
        </header>

        {/* ── VISION + QUOTES ── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 40,
            marginBottom: 120,
            alignItems: "start",
          }}
        >
          {/* Left: image */}
          <div style={{ position: "relative", overflow: "hidden" }}>
            <img
              src={mainImage}
              alt="Fashion inspiration"
              style={{
                width: "100%",
                height: 520,
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Est badge */}
            <span
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                fontFamily: "sans-serif",
                fontSize: "0.62rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#faf9f7",
                border: "1px solid rgba(255,255,255,0.6)",
                padding: "4px 12px",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              Est 2025
            </span>

            {/* Origin card */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px 24px",
                background: "rgba(250,249,247,0.94)",
                backdropFilter: "blur(4px)",
                borderTop: "1px solid #e8e4df",
              }}
            >
              <p
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "0.95rem",
                  margin: "0 0 4px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#1a1a1a",
                }}
              >
                <MapPin
                  size={14}
                  strokeWidth={1.5}
                  style={{ color: "#c8a96e" }}
                />
                From Viet Nam
              </p>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#888",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                We are inspired by many things and we will turn it into the best
                products.
              </p>
            </div>
          </div>

          {/* Right: quotes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {quotes.map((quote, idx) => (
              <QuoteCard key={quote.id} quote={quote} index={idx} />
            ))}
          </div>
        </section>

        {/* ── OUR STORY ── */}
        <section style={{ marginBottom: 120 }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 12,
              }}
            >
              How it began
            </p>
            <h2
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                fontWeight: 400,
                margin: "0 0 20px",
              }}
            >
              Our Story
            </h2>
            <div
              style={{
                width: 48,
                height: 1,
                background: "#1a1a1a",
                margin: "0 auto",
              }}
            />
          </div>

          <div
            style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}
          >
            {/* Center line */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 1,
                background: "#e8e4df",
                transform: "translateX(-50%)",
              }}
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
              {timeline.map((item, idx) => (
                <TimelineItem key={idx} item={item} idx={idx} />
              ))}
            </div>
          </div>
        </section>

        {/* ── OUR STORE VIEW ── */}
        <section style={{ marginBottom: 120 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 12,
              }}
            >
              Visual
            </p>
            <h2
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                fontWeight: 400,
                margin: "0 0 20px",
              }}
            >
              Our Store View
            </h2>
            <div
              style={{
                width: 48,
                height: 1,
                background: "#1a1a1a",
                margin: "0 auto",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 2,
              background: "#e8e4df",
            }}
          >
            {storeImages.map(({ src, label }) => (
              <StoreImage key={label} src={src} label={label} />
            ))}
          </div>
        </section>

        {/* ── SLOGAN ── */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 12,
              }}
            >
              Our voice
            </p>
            <h2
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                fontWeight: 400,
                margin: "0 0 20px",
              }}
            >
              Our Slogan
            </h2>
            <div
              style={{
                width: 48,
                height: 1,
                background: "#1a1a1a",
                margin: "0 auto",
              }}
            />
          </div>

          <div style={{ overflow: "hidden" }}>
            <img
              src="https://i.postimg.cc/NffrjWDk/Frame-137.png"
              alt="HKT Slogan"
              style={{
                width: "100%",
                height: 480,
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </section>
      </div>

      <ChatBot />
      <Contact />
    </div>
  );
};

// ── Sub-components ──

function QuoteCard({ quote }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "24px 28px",
        background: hovered ? "#1a1a1a" : "#f0ece6",
        borderLeft: `2px solid ${hovered ? "#c8a96e" : "#e8e4df"}`,
        cursor: "default",
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      {/* Short text */}
      <p
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: "0.9rem",
          fontWeight: 400,
          fontStyle: hovered ? "normal" : "italic",
          color: hovered ? "#faf9f7" : "#1a1a1a",
          margin: 0,
          lineHeight: 1.6,
          transition: "color 0.3s",
        }}
      >
        {quote.shortText}
      </p>

      {/* Full text — expands on hover */}
      <div
        style={{
          maxHeight: hovered ? 120 : 0,
          opacity: hovered ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s ease, opacity 0.3s ease",
        }}
      >
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            marginTop: 12,
            paddingTop: 12,
          }}
        >
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.65)",
              margin: 0,
              lineHeight: 1.7,
              letterSpacing: "0.02em",
            }}
          >
            "{quote.fullText}"
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ item, idx }) {
  const [hovered, setHovered] = React.useState(false);
  const isLeft = item.align === "left";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 40px 1fr",
        alignItems: "center",
        gap: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left slot */}
      <div style={{ paddingRight: 32, textAlign: "right" }}>
        {isLeft && (
          <div
            style={{
              padding: "20px 24px",
              background: hovered ? "#1a1a1a" : "#faf9f7",
              border: "1px solid #e8e4df",
              borderRight: `2px solid ${hovered ? "#c8a96e" : "#1a1a1a"}`,
              transition: "background 0.3s, border-color 0.3s",
            }}
          >
            <p
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "1rem",
                fontWeight: 400,
                margin: "0 0 4px",
                color: hovered ? "#faf9f7" : "#1a1a1a",
                transition: "color 0.3s",
              }}
            >
              {item.year}
            </p>
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: hovered ? "#c8a96e" : "#888",
                margin: "0 0 10px",
                transition: "color 0.3s",
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontSize: "0.8rem",
                lineHeight: 1.7,
                color: hovered ? "rgba(255,255,255,0.7)" : "#888",
                margin: 0,
                transition: "color 0.3s",
              }}
            >
              {item.body}
            </p>
          </div>
        )}
      </div>

      {/* Center dot */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: hovered ? "#c8a96e" : "#1a1a1a",
            border: "2px solid #faf9f7",
            boxShadow: hovered ? "0 0 0 3px #c8a96e" : "0 0 0 3px #e8e4df",
            transition: "background 0.3s, box-shadow 0.3s",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Right slot */}
      <div style={{ paddingLeft: 32 }}>
        {!isLeft && (
          <div
            style={{
              padding: "20px 24px",
              background: hovered ? "#1a1a1a" : "#faf9f7",
              border: "1px solid #e8e4df",
              borderLeft: `2px solid ${hovered ? "#c8a96e" : "#1a1a1a"}`,
              transition: "background 0.3s, border-color 0.3s",
            }}
          >
            <p
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "1rem",
                fontWeight: 400,
                margin: "0 0 4px",
                color: hovered ? "#faf9f7" : "#1a1a1a",
                transition: "color 0.3s",
              }}
            >
              {item.year}
            </p>
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: hovered ? "#c8a96e" : "#888",
                margin: "0 0 10px",
                transition: "color 0.3s",
              }}
            >
              {item.label}
            </p>
            <p
              style={{
                fontSize: "0.8rem",
                lineHeight: 1.7,
                color: hovered ? "rgba(255,255,255,0.7)" : "#888",
                margin: 0,
                transition: "color 0.3s",
              }}
            >
              {item.body}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StoreImage({ src, label }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{
        position: "relative",
        height: 400,
        overflow: "hidden",
        background: "#f0ece6",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={label}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          transform: hovered ? "scale(1.04)" : "scale(1)",
          transition: "transform 0.6s ease",
        }}
      />
      {/* Label overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(26,26,26,0.38)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      >
        <span
          style={{
            fontFamily: "sans-serif",
            fontSize: "0.68rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#faf9f7",
            border: "1px solid rgba(255,255,255,0.6)",
            padding: "8px 20px",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export default About;
