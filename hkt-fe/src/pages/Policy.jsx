import React, { useState } from "react";
import {
  Package,
  Shield,
  Truck,
  RefreshCw,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import ChatBot from "../components/ChatBot";
import Contact from "../components/Contact";

const Policy = () => {
  const headerImage = "https://i.postimg.cc/nLLky3D0/Frame-1000004547.png";

  const conditions = [
    {
      icon: <Package size={20} strokeWidth={1.5} />,
      title: "Condition of Item",
      description:
        "Items must be unused, unwashed, and free of any odors (body odor, perfume, chemicals, etc.).",
    },
    {
      icon: <Shield size={20} strokeWidth={1.5} />,
      title: "Tags and Labels",
      description:
        "Tags and labels must remain intact, not be torn, removed, or altered.",
    },
    {
      icon: <Package size={20} strokeWidth={1.5} />,
      title: "Original Packaging",
      description:
        "The item must be returned with all original packaging and accessories in the same condition it was received.",
    },
  ];

  const freeReturnCases = [
    {
      icon: <AlertCircle size={16} strokeWidth={1.5} />,
      title: "Manufacturer Defects",
      description:
        "Items with verifiable manufacturer defects (e.g., torn seams, dye/print issues, poor workmanship).",
    },
    {
      icon: <RefreshCw size={16} strokeWidth={1.5} />,
      title: "Incorrect Item Sent",
      description:
        "Items sent incorrectly (wrong size, color, or product) compared to the original order.",
    },
    {
      icon: <Package size={16} strokeWidth={1.5} />,
      title: "Out of Stock for Exchange",
      description:
        "If a size exchange is requested, but the item is confirmed to be out of stock.",
    },
  ];

  const contactItems = [
    {
      icon: <Mail size={18} strokeWidth={1.5} />,
      label: "Support Email",
      value: "support@hktstudio.com",
    },
    {
      icon: <Phone size={18} strokeWidth={1.5} />,
      label: "Hotline / Zalo",
      value: "+84 901 234 567",
    },
    {
      icon: <MapPin size={18} strokeWidth={1.5} />,
      label: "Return Warehouse",
      value: "[Detailed address for returns]",
    },
  ];

  const requestFields = [
    { label: "Customer Full Name", placeholder: "[Enter your full name]" },
    { label: "Contact Phone Number", placeholder: "[Enter Phone Number]" },
    { label: "Order Number", placeholder: "[Example: HKT-20250101]" },
    {
      label: "Product Name",
      placeholder: "[Example: Basic Round Neck T-Shirt - White]",
    },
    {
      label: "Reason for Request",
      placeholder:
        "Select one: Size Exchange / Manufacturer Defect / Wrong Item Sent / Return for Refund.",
    },
    {
      label: "Detailed Issue / Request",
      placeholder:
        "[Describe the issue in detail. E.g., The shirt has a torn seam on the shoulder; Wrong size L sent instead of M; Requesting to exchange size M for size L.]",
    },
    {
      label: "Attachments",
      placeholder:
        "[Attach photos of the product fault and the Unboxing Video (if available).]",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#faf9f7",
        fontFamily: "sans-serif",
        color: "#1a1a1a",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* ── HERO ── */}
        <div style={{ padding: "32px 0 0" }}>
          <div style={{ overflow: "hidden", height: 300 }}>
            <img
              src={headerImage}
              alt="HKT Policy Header"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* ── PAGE HEADER ── */}
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
            Transparency First
          </p>
          <h1
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              fontWeight: 400,
              margin: "0 0 24px",
              lineHeight: 1.15,
            }}
          >
            Return & Exchange Policy
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
              fontSize: "0.88rem",
              lineHeight: 1.85,
              color: "#888",
              letterSpacing: "0.02em",
            }}
          >
            At HKT Studio, we aim to provide a diverse and trendy fashion
            shopping experience. If you encounter any issues with your purchase,
            we are here to help.
          </p>
        </header>

        {/* ── ELIGIBILITY PERIOD ── */}
        <section style={{ marginBottom: 96 }}>
          <div
            style={{
              background: "#1a1a1a",
              maxWidth: 560,
              margin: "0 auto",
              padding: "48px 40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "1.6rem",
                  color: "#c8a96e",
                  fontWeight: 400,
                }}
              >
                15
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "1.4rem",
                fontWeight: 400,
                color: "#faf9f7",
                margin: "0 0 12px",
              }}
            >
              Eligibility Period
            </h2>
            <p
              style={{
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.75,
                margin: 0,
                letterSpacing: "0.02em",
              }}
            >
              15 days from the date the customer receives the product, based on
              delivery carrier confirmation.
            </p>
          </div>
        </section>

        {/* ── MANDATORY CONDITIONS ── */}
        <SectionHeader
          eyebrow="Requirements"
          title="Mandatory Return Conditions"
          subtitle="For a return or exchange to be accepted, the item must meet all of the following conditions:"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 2,
            background: "#e8e4df",
            marginBottom: 32,
          }}
        >
          {conditions.map((c) => (
            <HoverCard
              key={c.title}
              icon={c.icon}
              title={c.title}
              description={c.description}
            />
          ))}
        </div>

        {/* Important note */}
        <div
          style={{
            maxWidth: 780,
            margin: "0 auto 96px",
            borderLeft: "2px solid #c8a96e",
            padding: "20px 28px",
            background: "#fff",
          }}
        >
          <p
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#c8a96e",
              margin: "0 0 8px",
            }}
          >
            Important Note
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              color: "#666",
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            HKT Studio strongly recommends recording an unboxing video upon
            receiving the package to serve as valid proof for any future claims.
          </p>
        </div>

        {/* ── FREE RETURN CASES ── */}
        <section
          style={{
            background: "#f0ece6",
            padding: "64px 40px",
            marginBottom: 96,
          }}
        >
          <SectionHeader
            eyebrow="Covered by HKT"
            title="Eligible Return / Exchange Cases"
          />
          <p
            style={{
              textAlign: "center",
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#c8a96e",
              marginBottom: 40,
            }}
          >
            ✓ Free Return Shipping One-Way
          </p>

          <div
            style={{
              maxWidth: 700,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              background: "#e0dbd4",
            }}
          >
            {freeReturnCases.map((item) => (
              <FreeReturnRow key={item.title} item={item} />
            ))}
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#aaa",
              marginTop: 28,
              fontStyle: "italic",
              letterSpacing: "0.02em",
            }}
          >
            HKT Studio will cover all shipping costs incurred for the return or
            exchange in these cases.
          </p>
        </section>

        {/* ── CUSTOMER-PAID SHIPPING ── */}
        <section style={{ marginBottom: 96 }}>
          <SectionHeader
            eyebrow="Customer Responsibility"
            title="Cases Subject to Customer-Paid Shipping"
          />

          <div
            style={{
              maxWidth: 640,
              margin: "0 auto",
              border: "1px solid #e8e4df",
              padding: "28px 32px",
              display: "flex",
              gap: 20,
              alignItems: "flex-start",
            }}
          >
            <div style={{ color: "#888", flexShrink: 0, marginTop: 2 }}>
              <Truck size={18} strokeWidth={1.5} />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "1rem",
                  fontWeight: 400,
                  margin: "0 0 8px",
                  color: "#1a1a1a",
                }}
              >
                Size Exchange
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#888",
                  lineHeight: 1.75,
                  margin: 0,
                }}
              >
                Size exchange if the item does not fit, subject to availability.
              </p>
            </div>
          </div>
        </section>

        {/* ── REQUEST TEMPLATE ── */}
        <section
          style={{
            background: "#f0ece6",
            padding: "64px 40px",
            marginBottom: 96,
          }}
        >
          <SectionHeader
            eyebrow="How to Apply"
            title="Return / Exchange Request Form"
            subtitle="Please copy and fill in the following template with all required details, then send it via Email or contact our Hotline."
          />

          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {/* Template header */}
            <div
              style={{
                background: "#1a1a1a",
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <Package
                size={18}
                strokeWidth={1.5}
                style={{ color: "#c8a96e", flexShrink: 0 }}
              />
              <p
                style={{
                  fontFamily: "'Georgia', serif",
                  fontSize: "0.92rem",
                  color: "#faf9f7",
                  margin: 0,
                  letterSpacing: "0.04em",
                }}
              >
                HKT STUDIO — RETURN / EXCHANGE REQUEST
              </p>
            </div>

            {/* Fields */}
            <div
              style={{
                background: "#faf9f7",
                border: "1px solid #e8e4df",
                borderTop: "none",
              }}
            >
              {requestFields.map((field, idx) => (
                <div
                  key={field.label}
                  style={{
                    padding: "18px 28px",
                    borderBottom:
                      idx < requestFields.length - 1
                        ? "1px solid #e8e4df"
                        : "none",
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    gap: 16,
                    alignItems: "baseline",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.68rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#888",
                      margin: 0,
                      flexShrink: 0,
                    }}
                  >
                    {field.label}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#bbb",
                      margin: 0,
                      lineHeight: 1.6,
                      fontStyle: "italic",
                    }}
                  >
                    {field.placeholder}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT INFO ── */}
        <section style={{ marginBottom: 96 }}>
          <SectionHeader
            eyebrow="Get in Touch"
            title="Contact Information"
            subtitle="For all questions, return/exchange inquiries, or complaints, please contact our Customer Service team via the channels below:"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 2,
              background: "#e8e4df",
            }}
          >
            {contactItems.map((item) => (
              <ContactCard key={item.label} item={item} />
            ))}
          </div>
        </section>

        {/* ── COMMITMENT ── */}
        <section
          style={{
            background: "#1a1a1a",
            padding: "64px 40px",
            marginBottom: 40,
          }}
        >
          <SectionHeader
            eyebrow="Our Standards"
            title="Commitment & Right to Refuse"
            light
          />

          <div
            style={{
              maxWidth: 700,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              background: "#2a2a2a",
            }}
          >
            {[
              {
                accent: "#c8a96e",
                title: "Our Commitment",
                body: "We are committed to providing fast and reliable support upon receiving your inquiry.",
              },
              {
                accent: "#555",
                title: "Right to Refuse",
                body: "HKT Studio reserves the right to reject returns that do not meet the mandatory conditions listed above.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: "#1a1a1a",
                  borderLeft: `2px solid ${item.accent}`,
                  padding: "24px 28px",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "0.95rem",
                    fontWeight: 400,
                    color: "#faf9f7",
                    margin: "0 0 8px",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ChatBot />
      <Contact />
    </div>
  );
};

// ── Sub-components ──

function SectionHeader({ eyebrow, title, subtitle, light = false }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 48 }}>
      <p
        style={{
          fontSize: "0.65rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: light ? "rgba(255,255,255,0.4)" : "#aaa",
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
          fontWeight: 400,
          margin: "0 0 20px",
          color: light ? "#faf9f7" : "#1a1a1a",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          width: 48,
          height: 1,
          background: light ? "rgba(255,255,255,0.25)" : "#1a1a1a",
          margin: "0 auto 20px",
        }}
      />
      {subtitle && (
        <p
          style={{
            maxWidth: 560,
            margin: "0 auto",
            fontSize: "0.82rem",
            lineHeight: 1.8,
            color: light ? "rgba(255,255,255,0.5)" : "#888",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function HoverCard({ icon, title, description }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1a1a1a" : "#faf9f7",
        padding: "36px 28px",
        textAlign: "center",
        cursor: "default",
        transition: "background 0.3s",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          border: `1px solid ${hovered ? "rgba(255,255,255,0.2)" : "#e8e4df"}`,
          color: hovered ? "#c8a96e" : "#888",
          marginBottom: 20,
          transition: "border-color 0.3s, color 0.3s",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: "0.95rem",
          fontWeight: 400,
          margin: "0 0 10px",
          color: hovered ? "#faf9f7" : "#1a1a1a",
          transition: "color 0.3s",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.78rem",
          color: hovered ? "rgba(255,255,255,0.55)" : "#888",
          lineHeight: 1.75,
          margin: 0,
          transition: "color 0.3s",
        }}
      >
        {description}
      </p>
    </div>
  );
}

function FreeReturnRow({ item }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1a1a1a" : "#faf9f7",
        padding: "22px 28px",
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        borderLeft: `2px solid ${hovered ? "#c8a96e" : "transparent"}`,
        transition: "background 0.3s, border-color 0.3s",
        cursor: "default",
      }}
    >
      <div
        style={{
          color: hovered ? "#c8a96e" : "#888",
          flexShrink: 0,
          marginTop: 2,
          transition: "color 0.3s",
        }}
      >
        {item.icon}
      </div>
      <div>
        <h3
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: "0.92rem",
            fontWeight: 400,
            margin: "0 0 6px",
            color: hovered ? "#faf9f7" : "#1a1a1a",
            transition: "color 0.3s",
          }}
        >
          {item.title}
        </h3>
        <p
          style={{
            fontSize: "0.78rem",
            color: hovered ? "rgba(255,255,255,0.55)" : "#888",
            lineHeight: 1.7,
            margin: 0,
            transition: "color 0.3s",
          }}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
}

function ContactCard({ item }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#1a1a1a" : "#faf9f7",
        padding: "36px 28px",
        textAlign: "center",
        cursor: "default",
        transition: "background 0.3s",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          border: `1px solid ${hovered ? "rgba(255,255,255,0.2)" : "#e8e4df"}`,
          color: hovered ? "#c8a96e" : "#888",
          marginBottom: 20,
          transition: "border-color 0.3s, color 0.3s",
        }}
      >
        {item.icon}
      </div>
      <h3
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: "0.92rem",
          fontWeight: 400,
          margin: "0 0 8px",
          color: hovered ? "#faf9f7" : "#1a1a1a",
          transition: "color 0.3s",
        }}
      >
        {item.label}
      </h3>
      <p
        style={{
          fontSize: "0.78rem",
          color: hovered ? "rgba(255,255,255,0.55)" : "#888",
          margin: 0,
          letterSpacing: "0.02em",
          transition: "color 0.3s",
        }}
      >
        {item.value}
      </p>
    </div>
  );
}

export default Policy;
