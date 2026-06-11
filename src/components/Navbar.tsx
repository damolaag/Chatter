import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const avatarMenuRef = useRef<HTMLDivElement | null>(null);

  const userEmail = user?.email ?? "";
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    userEmail.split("@")[0] ||
    "User";

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    async function loadUnreadCount() {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      const { count } = await supabase
        .from("notifications")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setUnreadCount(count ?? 0);
    }

    loadUnreadCount();

    const refreshHandler = () => {
      void loadUnreadCount();
    };

    window.addEventListener("notifications-read", refreshHandler);

    return () => {
      window.removeEventListener("notifications-read", refreshHandler);
    };
  }, [user]);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(event.target as Node)
      ) {
        setAvatarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: "10px 14px",
    borderRadius: "999px",
    color: isActive ? "#2563eb" : "#374151",
    background: isActive ? "#eff6ff" : "transparent",
    fontWeight: isActive ? 800 : 600,
    fontSize: "14px",
  });

  function closeMenu() {
    setMenuOpen(false);
    setAvatarOpen(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAvatarOpen(false);
    setMenuOpen(false);
    navigate("/login");
  }

  function navLinks(onClick?: () => void) {
    return (
      <>
        <NavLink to="/" style={linkStyle} onClick={onClick}>
          Home
        </NavLink>

        <NavLink to="/search" style={linkStyle} onClick={onClick}>
          Search
        </NavLink>

        <NavLink to="/trending" style={linkStyle} onClick={onClick}>
          Trending
        </NavLink>

        {user ? (
          <>
            <NavLink to="/editor" style={linkStyle} onClick={onClick}>
              Write
            </NavLink>

            <NavLink to="/bookmarks" style={linkStyle} onClick={onClick}>
              Bookmarks
            </NavLink>

            <NavLink to="/dashboard" style={linkStyle} onClick={onClick}>
              Dashboard
            </NavLink>

            <NavLink to="/notifications" style={linkStyle} onClick={onClick}>
              <span style={{ position: "relative", display: "inline-flex" }}>
                Notifications

                {unreadCount > 0 && (
                  <span
                    style={{
                      marginLeft: "8px",
                      background: "#ef4444",
                      color: "#fff",
                      minWidth: "20px",
                      height: "20px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 6px",
                      fontWeight: 900,
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </span>
            </NavLink>
          </>
        ) : (
          <NavLink
            to="/login"
            onClick={onClick}
            style={{
              background: "#111827",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "999px",
              fontWeight: 800,
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            Sign in
          </NavLink>
        )}
      </>
    );
  }

  function avatarButton() {
    if (!user) return null;

    return (
      <div ref={avatarMenuRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setAvatarOpen((current) => !current)}
          aria-label="Open account menu"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "999px",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            overflow: "hidden",
            fontWeight: 900,
            color: "#111827",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            initial
          )}
        </button>

        {avatarOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "52px",
              width: "240px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              boxShadow: "0 20px 60px rgba(15,23,42,0.14)",
              padding: "12px",
              zIndex: 200,
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderBottom: "1px solid #f3f4f6",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  color: "#111827",
                  fontSize: "14px",
                }}
              >
                {displayName}
              </div>

              <div
                style={{
                  color: "#6b7280",
                  fontSize: "13px",
                  marginTop: "3px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userEmail}
              </div>
            </div>

            <Link to={`/profiles/${user.id}`}onClick={closeMenu} style={menuItemStyle}>
              View Profile
            </Link>

            <Link to="/edit-profile" onClick={closeMenu} style={menuItemStyle}>
              Edit Profile
            </Link>

            <Link to="/dashboard" onClick={closeMenu} style={menuItemStyle}>
              Dashboard
            </Link>

            <button type="button" onClick={handleLogout} style={logoutButtonStyle}>
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <header
      style={{
        background: "rgba(255,255,255,0.96)",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <Link
            to="/"
            onClick={closeMenu}
            style={{
              fontSize: "26px",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#111827",
            }}
          >
            Chatter
          </Link>

          {isMobile ? (
            <button
              onClick={() => setMenuOpen((current) => !current)}
              aria-label="Toggle navigation menu"
              style={{
                border: "1px solid #e5e7eb",
                background: "#fff",
                borderRadius: "12px",
                padding: "10px 12px",
                fontSize: "22px",
                lineHeight: 1,
                color: "#111827",
              }}
            >
              {menuOpen ? "×" : "☰"}
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {navLinks()}
              {avatarButton()}
            </div>
          )}
        </div>

        {isMobile && menuOpen && (
          <div
            style={{
              marginTop: "16px",
              display: "grid",
              gap: "8px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              padding: "14px",
              boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
            }}
          >
            {navLinks(closeMenu)}

            {user && (
              <>
                <div
                  style={{
                    height: "1px",
                    background: "#e5e7eb",
                    margin: "8px 0",
                  }}
                />

               <Link to={`/profiles/${user.id}`} onClick={closeMenu} style={menuItemStyle}>
  View Profile
</Link>

                <Link to="/edit-profile" onClick={closeMenu} style={mobileAccountLinkStyle}>
                  Edit Profile
                </Link>

                <button type="button" onClick={handleLogout} style={mobileLogoutButtonStyle}>
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "block",
  padding: "10px 12px",
  borderRadius: "12px",
  color: "#374151",
  fontWeight: 700,
  fontSize: "14px",
  textDecoration: "none",
};

const logoutButtonStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontWeight: 800,
  fontSize: "14px",
  padding: "10px 12px",
  borderRadius: "12px",
  textAlign: "left",
  cursor: "pointer",
};

const mobileAccountLinkStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "999px",
  color: "#374151",
  background: "transparent",
  fontWeight: 700,
  fontSize: "14px",
  textDecoration: "none",
};

const mobileLogoutButtonStyle: React.CSSProperties = {
  border: "none",
  background: "#fef2f2",
  color: "#dc2626",
  padding: "10px 14px",
  borderRadius: "999px",
  fontWeight: 800,
  fontSize: "14px",
  textAlign: "left",
  cursor: "pointer",
};