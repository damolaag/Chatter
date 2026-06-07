import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export function Navbar() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

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
  }, [user]);

  const linkStyle = ({
    isActive,
  }: {
    isActive: boolean;
  }) => ({
    color: isActive ? "#2563eb" : "#374151",
    fontWeight: isActive ? 600 : 500,
  });

  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <nav
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "72px",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "24px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
          }}
        >
          Chatter
        </Link>

        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <NavLink to="/" style={linkStyle}>
            Home
          </NavLink>

          <NavLink to="/search" style={linkStyle}>
            Search
          </NavLink>

          <NavLink to="/trending" style={linkStyle}>
            Trending
          </NavLink>

          {user && (
            <>
              <NavLink to="/editor" style={linkStyle}>
                Write
              </NavLink>

              <NavLink to="/bookmarks" style={linkStyle}>
                Bookmarks
              </NavLink>

              <NavLink to="/dashboard" style={linkStyle}>
                Dashboard
              </NavLink>

              <NavLink
                to="/notifications"
                style={{
                  position: "relative",
                  color: "#374151",
                  fontWeight: 500,
                }}
              >
                Notifications

                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-14px",
                      background: "#ef4444",
                      color: "#fff",
                      minWidth: "18px",
                      height: "18px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 5px",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}