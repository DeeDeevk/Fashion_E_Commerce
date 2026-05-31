import React from "react";
import { X, Plus, Heart } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const api = {
  get: async (url) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi");
    return data;
  },
  post: async (url, body) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Lỗi");
    return data;
  },
  del: async (url) => {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE}${url}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Lỗi");
    }
  },
};

export default function WishlistSelectorModal({
  productId,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [wishlists, setWishlists] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [savingIds, setSavingIds] = React.useState(new Set());

  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) return;

    const fetchWishlists = async () => {
      try {
        setLoading(true);
        const data = await api.get("/wishlists");
        const list = data.result || [];

        const updated = await Promise.all(
          list.map(async (wl) => {
            try {
              const check = await api.get(`/wishlists/${wl.id}/items`);
              const items = check.result || [];
              return {
                ...wl,
                hasProduct: items.some((i) => i.productId === productId),
              };
            } catch {
              return { ...wl, hasProduct: false };
            }
          }),
        );
        setWishlists(updated);
      } catch (err) {
        toast.error("Cant load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlists();
  }, [isOpen, productId]);

  const toggleProductInWishlist = async (
    wishlistId,
    currentHasProduct,
    wishlistName,
  ) => {
    if (savingIds.has(wishlistId)) return;
    setSavingIds((prev) => new Set(prev).add(wishlistId));

    try {
      if (currentHasProduct) {
        await api.del(`/wishlists/${wishlistId}/items/${productId}`);
        toast.error(`Removed product from "${wishlistName}"`);
      } else {
        await api.post(`/wishlists/${wishlistId}/items`, { productId });
        toast.success(`Saved to "${wishlistName}"`);
      }

      setWishlists((prev) =>
        prev.map((wl) =>
          wl.id === wishlistId ? { ...wl, hasProduct: !currentHasProduct } : wl,
        ),
      );
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra");
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(wishlistId);
        return next;
      });
    }
  };

  const handleCreateWishlist = async () => {
    if (!newName.trim()) {
      toast.error("Wishlist name cant be empty");
      return;
    }

    try {
      const data = await api.post("/wishlists", {
        name: newName.trim(),
        description: newDesc.trim() || null,
      });

      const newWishlist = data.result;
      setWishlists((prev) => [...prev, { ...newWishlist, hasProduct: true }]);
      toast.success(
        `Created wishlist "${newWishlist.name}" and saved product to wishlist`,
      );

      setNewName("");
      setNewDesc("");
      setShowCreateForm(false);
      onSuccess?.();
    } catch (err) {
      toast.error("Failed to create wishlist: " + err.message);
    }
  };

  if (!isOpen) return null;

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
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(26,26,26,0.45)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          background: "#faf9f7",
          width: "100%",
          maxWidth: 420,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#aaa",
                margin: "0 0 4px",
              }}
            >
              Save to
            </p>
            <h3
              style={{
                fontFamily: "'Georgia', serif",
                fontSize: "1.1rem",
                fontWeight: 400,
                margin: 0,
                color: "#1a1a1a",
              }}
            >
              Wishlist
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              border: "1px solid #e8e4df",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#888",
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
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  width: 22,
                  height: 22,
                  border: "1px solid #1a1a1a",
                  borderTop: "1px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : showCreateForm ? (
            <div style={{ padding: "24px" }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#aaa",
                  margin: "0 0 16px",
                }}
              >
                New Wishlist
              </p>

              <input
                type="text"
                placeholder="Wishlist name..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
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
                  marginBottom: 20,
                  boxSizing: "border-box",
                }}
              />

              <textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
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
                  marginBottom: 28,
                  boxSizing: "border-box",
                }}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowCreateForm(false)}
                  style={{
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
                  Cancel
                </button>
                <button
                  onClick={handleCreateWishlist}
                  style={{
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
                  Create
                </button>
              </div>
            </div>
          ) : wishlists.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "#aaa",
                fontSize: "0.82rem",
                letterSpacing: "0.04em",
              }}
            >
              You don't have any wishlist yet.
            </div>
          ) : (
            <div>
              {wishlists.map((wl, idx) => (
                <button
                  key={wl.id}
                  onClick={() =>
                    toggleProductInWishlist(wl.id, wl.hasProduct, wl.name)
                  }
                  disabled={savingIds.has(wl.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 24px",
                    background: "transparent",
                    border: "none",
                    borderBottom:
                      idx < wishlists.length - 1 ? "1px solid #e8e4df" : "none",
                    cursor: savingIds.has(wl.id) ? "default" : "pointer",
                    textAlign: "left",
                    opacity: savingIds.has(wl.id) ? 0.6 : 1,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!savingIds.has(wl.id))
                      e.currentTarget.style.background = "#f0ece6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: "'Georgia', serif",
                        fontSize: "0.9rem",
                        fontWeight: 400,
                        color: "#1a1a1a",
                        margin: "0 0 3px",
                      }}
                    >
                      {wl.name}
                    </p>
                    {wl.description && (
                      <p
                        style={{
                          fontFamily: "sans-serif",
                          fontSize: "0.72rem",
                          color: "#aaa",
                          margin: "0 0 2px",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {wl.description}
                      </p>
                    )}
                    <p
                      style={{
                        fontFamily: "sans-serif",
                        fontSize: "0.68rem",
                        color: "#bbb",
                        letterSpacing: "0.06em",
                        margin: 0,
                      }}
                    >
                      {wl.itemCount || 0} item
                      {(wl.itemCount || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {savingIds.has(wl.id) ? (
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        border: "1px solid #1a1a1a",
                        borderTop: "1px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Heart
                      size={18}
                      strokeWidth={1.5}
                      fill={wl.hasProduct ? "#1a1a1a" : "none"}
                      style={{
                        color: wl.hasProduct ? "#1a1a1a" : "#ccc",
                        flexShrink: 0,
                        transition: "color 0.2s",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer — Create new */}
        {!showCreateForm && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e8e4df",
              background: "#faf9f7",
            }}
          >
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                width: "100%",
                padding: "11px 0",
                border: "1px solid #e8e4df",
                background: "transparent",
                color: "#888",
                fontSize: "0.68rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
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
              <Plus size={14} strokeWidth={1.5} />
              Create new wishlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
