import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#1a1a1a",
        color: "#faf9f7",
        fontFamily: "sans-serif",
      }}
    >
      {/* Main Footer Content */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "72px 24px 48px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 48,
          }}
        >
          {/* Brand Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <span
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "1.4rem",
                  fontWeight: 400,
                  letterSpacing: "0.1em",
                  color: "#faf9f7",
                }}
              >
                HK<span style={{ color: "#c8a96e" }}>T</span> STUDIO
              </span>
            </div>
            <p
              style={{
                color: "#888",
                fontSize: "0.8rem",
                lineHeight: 1.8,
                letterSpacing: "0.04em",
                margin: 0,
              }}
            >
              Trusted fashion brand with
              <br />
              youthful and dynamic style.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#666",
                margin: "0 0 8px",
              }}
            >
              Navigate
            </p>
            {[
              { href: "/", label: "Home" },
              { href: "/product", label: "Products" },
              { href: "/about", label: "About Us" },
              { href: "/policy", label: "Policy" },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                style={{
                  color: "#888",
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  letterSpacing: "0.04em",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#faf9f7")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Contact Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#666",
                margin: "0 0 8px",
              }}
            >
              Contact
            </p>
            {[
              { icon: <Phone size={14} />, text: "081 - 277 - 7990" },
              { icon: <Mail size={14} />, text: "contact@hktstudio.com" },
              {
                icon: <MapPin size={14} />,
                text: "ABC Street, Go Vap, Ho Chi Minh City",
              },
            ].map(({ icon, text }) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  color: "#888",
                  fontSize: "0.82rem",
                  letterSpacing: "0.02em",
                }}
              >
                <span style={{ color: "#c8a96e", marginTop: 2, flexShrink: 0 }}>
                  {icon}
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Social Media */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#666",
                margin: "0 0 8px",
              }}
            >
              Follow Us
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                style={{
                  width: 38,
                  height: 38,
                  border: "1px solid #333",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                  transition: "border-color 0.2s, color 0.2s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#c8a96e";
                  e.currentTarget.style.color = "#c8a96e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#333";
                  e.currentTarget.style.color = "#888";
                }}
              >
                <Facebook size={16} />
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                style={{
                  width: 38,
                  height: 38,
                  border: "1px solid #333",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                  transition: "border-color 0.2s, color 0.2s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#c8a96e";
                  e.currentTarget.style.color = "#c8a96e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#333";
                  e.currentTarget.style.color = "#888";
                }}
              >
                <Instagram size={16} />
              </a>

              {/* TikTok */}
              <a
                href="#"
                aria-label="TikTok"
                style={{
                  width: 38,
                  height: 38,
                  border: "1px solid #333",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                  transition: "border-color 0.2s, color 0.2s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#c8a96e";
                  e.currentTarget.style.color = "#c8a96e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#333";
                  e.currentTarget.style.color = "#888";
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>

              {/* Email */}
              <a
                href="#"
                aria-label="Email"
                style={{
                  width: 38,
                  height: 38,
                  border: "1px solid #333",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                  transition: "border-color 0.2s, color 0.2s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#c8a96e";
                  e.currentTarget.style.color = "#c8a96e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#333";
                  e.currentTarget.style.color = "#888";
                }}
              >
                <Mail size={16} />
              </a>
            </div>
            <p
              style={{
                color: "#555",
                fontSize: "0.72rem",
                letterSpacing: "0.03em",
                margin: 0,
              }}
            >
              Updates on new products & offers
            </p>
          </div>
        </div>
      </div>

      {/* Divider + Copyright */}
      <div style={{ borderTop: "1px solid #2a2a2a" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#444",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            © 2025 HKT Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
