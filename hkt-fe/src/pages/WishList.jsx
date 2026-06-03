// src/pages/Wishlist.jsx
import React, { useState, useEffect } from "react";
import { ChevronRight, Plus, X, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ChatBot from "../components/ChatBot";
import Contact from "../components/Contact";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = {
  async request(url, options = {}) {
    const token = localStorage.getItem("accessToken");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  },
  get(url) {
    return this.request(url, { method: "GET" });
  },
  post(url, body) {
    return this.request(url, { method: "POST", body: JSON.stringify(body) });
  },
  put(url, body) {
    return this.request(url, { method: "PUT", body: JSON.stringify(body) });
  },
  del(url) {
    return this.request(url, { method: "DELETE" });
  },
};

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlistList, setWishlistList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get("/wishlists");
        setWishlistList(data.result || []);
      } catch (err) {
        setError(err.message);
        if (err.message.includes("Unauthorized")) {
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWishlists();
  }, [navigate]);

  const openCreate = () => {
    setName("");
    setDescription("");
    setIsCreateOpen(true);
  };
  const openEdit = (item) => {
    setCurrentItem(item);
    setName(item.name);
    setDescription(item.description || "");
    setIsEditOpen(true);
  };
  const openDelete = (item) => {
    setCurrentItem(item);
    setIsDeleteOpen(true);
  };
  const closeAll = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
    setCurrentItem(null);
    setName("");
    setDescription("");
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const data = await api.post("/wishlists", {
        name: name.trim(),
        description: description.trim() || null,
      });
      setWishlistList((prev) => [...prev, data.result]);
      closeAll();
      toast.success(`Success creating "${data.result.name}"`);
    } catch (err) {
      toast.error(err.message || "Failed to create wishlist");
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) return;
    try {
      const data = await api.put(`/wishlists/${currentItem.id}`, {
        name: name.trim(),
        description: description.trim() || null,
      });
      setWishlistList((prev) =>
        prev.map((item) => (item.id === currentItem.id ? data.result : item)),
      );
      closeAll();
      toast.success(`Updated "${data.result.name}"`);
    } catch (err) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    try {
      await api.del(`/wishlists/${currentItem.id}`);
      setWishlistList((prev) =>
        prev.filter((item) => item.id !== currentItem.id),
      );
      closeAll();
      toast.success("Wishlist deleted");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClick = (id) => navigate(`/wishlists/${id}`);

  return (
    <>
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "48px 24px 80px",
          fontFamily: "sans-serif",
          color: "#1a1a1a",
          minHeight: "80vh",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 48,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 10,
              }}
            >
              Your Collection
            </p>
            <h1
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                fontWeight: 400,
                margin: "0 0 16px",
                lineHeight: 1.15,
              }}
            >
              Wishlists
            </h1>
            <div style={{ width: 48, height: 1, background: "#1a1a1a" }} />
          </div>

          <button
            onClick={openCreate}
            title="Create new wishlist"
            style={{
              width: 40,
              height: 40,
              border: "1px solid #1a1a1a",
              background: "#1a1a1a",
              color: "#faf9f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderRadius: 0,
              transition: "background 0.2s, color 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#1a1a1a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#1a1a1a";
              e.currentTarget.style.color = "#faf9f7";
            }}
          >
            <Plus size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <div
              style={{
                display: "inline-block",
                width: 24,
                height: 24,
                border: "1px solid #1a1a1a",
                borderTop: "1px solid transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <p
            style={{
              textAlign: "center",
              padding: "48px 0",
              fontSize: "0.82rem",
              color: "#888",
            }}
          >
            {error}
          </p>
        )}

        {/* ── List ── */}
        {!loading && !error && (
          <div>
            {wishlistList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <p
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1.1rem",
                    color: "#1a1a1a",
                    margin: "0 0 10px",
                  }}
                >
                  No wishlists yet
                </p>
                <p style={{ fontSize: "0.78rem", color: "#aaa", margin: 0 }}>
                  Press <strong style={{ color: "#1a1a1a" }}>+</strong> to
                  create your first one.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {wishlistList.map((item, idx) => (
                  <WishlistRow
                    key={item.id}
                    item={item}
                    isLast={idx === wishlistList.length - 1}
                    onClick={() => handleClick(item.id)}
                    onEdit={(e) => {
                      e.stopPropagation();
                      openEdit(item);
                    }}
                    onDelete={(e) => {
                      e.stopPropagation();
                      openDelete(item);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {(isCreateOpen || isEditOpen) && (
        <WishlistModal
          title={isCreateOpen ? "Create Wishlist" : "Edit Wishlist"}
          name={name}
          description={description}
          setName={setName}
          setDescription={setDescription}
          onConfirm={isCreateOpen ? handleCreate : handleUpdate}
          onClose={closeAll}
          confirmText={isCreateOpen ? "Create" : "Update"}
          disabled={!name.trim()}
        />
      )}

      {/* ── Delete Modal ── */}
      {isDeleteOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            fontFamily: "sans-serif",
          }}
        >
          <div
            onClick={closeAll}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(26,26,26,0.45)",
            }}
          />
          <div
            style={{
              position: "relative",
              background: "#faf9f7",
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid #e8e4df",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#aaa",
                    margin: "0 0 4px",
                  }}
                >
                  Confirm
                </p>
                <h2
                  style={{
                    fontFamily: "'Georgia', serif",
                    fontSize: "1.05rem",
                    fontWeight: 400,
                    margin: 0,
                    color: "#1a1a1a",
                  }}
                >
                  Delete Wishlist
                </h2>
              </div>
              <CloseBtn onClick={closeAll} />
            </div>

            {/* Body */}
            <div style={{ padding: "24px" }}>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#444",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Are you sure you want to delete{" "}
                <span
                  style={{ fontFamily: "'Georgia', serif", color: "#1a1a1a" }}
                >
                  "{currentItem?.name}"
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: "16px 24px",
                borderTop: "1px solid #e8e4df",
              }}
            >
              <button
                onClick={closeAll}
                style={ghostBtnStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1a1a1a";
                  e.currentTarget.style.color = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e8e4df";
                  e.currentTarget.style.color = "#888";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={solidBtnStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1a1a1a";
                  e.currentTarget.style.color = "#faf9f7";
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatBot />
      <Contact />
    </>
  );
}

// ── Sub-components ──

function WishlistRow({ item, isLast, onClick, onEdit, onDelete }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 0",
        borderBottom: isLast ? "none" : "1px solid #e8e4df",
        transition: "background 0.15s",
        gap: 16,
      }}
    >
      {/* Clickable area */}
      <button
        onClick={onClick}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          padding: 0,
        }}
      >
        {/* Index dot */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: hovered ? "#c8a96e" : "#e8e4df",
            flexShrink: 0,
            marginTop: 6,
            transition: "background 0.25s",
          }}
        />

        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: "0.95rem",
              fontWeight: 400,
              margin: "0 0 4px",
              color: "#1a1a1a",
              transition: "color 0.2s",
            }}
          >
            {item.name}
          </p>
          {item.description && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#aaa",
                margin: "0 0 4px",
                lineHeight: 1.5,
                letterSpacing: "0.02em",
              }}
            >
              {item.description}
            </p>
          )}
          {item.itemCount > 0 && (
            <p
              style={{
                fontSize: "0.68rem",
                color: "#bbb",
                margin: 0,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {item.itemCount} item{item.itemCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </button>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
          flexShrink: 0,
        }}
      >
        <IconBtn onClick={onEdit} title="Edit">
          <Edit2 size={14} strokeWidth={1.5} />
        </IconBtn>
        <IconBtn onClick={onDelete} title="Delete" danger>
          <Trash2 size={14} strokeWidth={1.5} />
        </IconBtn>
        <div style={{ color: "#ccc", display: "flex", alignItems: "center" }}>
          <ChevronRight size={16} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, title, danger }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30,
        height: 30,
        border: `1px solid ${hovered ? (danger ? "#1a1a1a" : "#1a1a1a") : "#e8e4df"}`,
        background: "transparent",
        color: hovered ? "#1a1a1a" : "#aaa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        borderRadius: 0,
        transition: "border-color 0.2s, color 0.2s",
      }}
    >
      {children}
    </button>
  );
}

function CloseBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        border: "1px solid #e8e4df",
        background: "transparent",
        color: "#888",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        borderRadius: 0,
        transition: "border-color 0.2s, color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#1a1a1a";
        e.currentTarget.style.color = "#1a1a1a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e8e4df";
        e.currentTarget.style.color = "#888";
      }}
    >
      <X size={14} strokeWidth={1.5} />
    </button>
  );
}

// Shared button styles
const ghostBtnStyle = {
  flex: 1,
  padding: "11px 0",
  border: "1px solid #e8e4df",
  background: "transparent",
  color: "#888",
  fontSize: "0.68rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "sans-serif",
  transition: "border-color 0.2s, color 0.2s",
};
const solidBtnStyle = {
  flex: 1,
  padding: "11px 0",
  border: "1px solid #1a1a1a",
  background: "#1a1a1a",
  color: "#faf9f7",
  fontSize: "0.68rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  cursor: "pointer",
  fontFamily: "sans-serif",
  transition: "background 0.2s, color 0.2s",
};

// ── Modal ──
function WishlistModal({
  title,
  name,
  description,
  setName,
  setDescription,
  onConfirm,
  onClose,
  confirmText,
  disabled,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "sans-serif",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(26,26,26,0.45)",
        }}
      />
      <div
        style={{
          position: "relative",
          background: "#faf9f7",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 16px 48px rgba(0,0,0,0.14)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #e8e4df",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#aaa",
                margin: "0 0 4px",
              }}
            >
              {confirmText === "Create" ? "New" : "Edit"}
            </p>
            <h2
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "1.05rem",
                fontWeight: 400,
                margin: 0,
                color: "#1a1a1a",
              }}
            >
              {title}
            </h2>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#888",
                display: "block",
                marginBottom: 8,
              }}
            >
              Wishlist Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !disabled && onConfirm()}
              placeholder="e.g. Favourite pieces, Birthday outfit..."
              autoFocus
              style={{
                width: "100%",
                padding: "10px 0",
                border: "none",
                borderBottom: "1px solid #1a1a1a",
                background: "transparent",
                fontSize: "0.88rem",
                color: "#1a1a1a",
                outline: "none",
                fontFamily: "sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#888",
                display: "block",
                marginBottom: 8,
              }}
            >
              Description <span style={{ color: "#bbb" }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short note about this list..."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 0",
                border: "none",
                borderBottom: "1px solid #e8e4df",
                background: "transparent",
                fontSize: "0.82rem",
                color: "#888",
                outline: "none",
                fontFamily: "sans-serif",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "16px 24px",
            borderTop: "1px solid #e8e4df",
          }}
        >
          <button
            onClick={onClose}
            style={ghostBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#1a1a1a";
              e.currentTarget.style.color = "#1a1a1a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8e4df";
              e.currentTarget.style.color = "#888";
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            style={{
              ...solidBtnStyle,
              opacity: disabled ? 0.4 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#1a1a1a";
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.background = "#1a1a1a";
                e.currentTarget.style.color = "#faf9f7";
              }
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
