import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

type Notification = {
  id: string;
  type: "like" | "comment" | "follow";
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  actor: {
    id: string;
    username: string | null;
    full_name: string | null;
  } | null;
  post: {
    title: string;
    slug: string;
  } | null;
};

export default function Notifications() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadNotifications() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          id,
          type,
          is_read,
          created_at,
          post_id,
          actor:profiles!notifications_actor_id_fkey (
            id,
            username,
            full_name
          ),
          post:posts (
            title,
            slug
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Load notifications error:", error.message);
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      const cleanedNotifications = (data ?? []).map((item) => ({
        ...item,
        actor: Array.isArray(item.actor) ? item.actor[0] : item.actor,
        post: Array.isArray(item.post) ? item.post[0] : item.post,
      }));

      setNotifications(cleanedNotifications as Notification[]);
      setLoading(false);

      const unreadIds = cleanedNotifications
        .filter((notification) => !notification.is_read)
        .map((notification) => notification.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .in("id", unreadIds);

        window.dispatchEvent(new Event("notifications-read"));
      }
    }

    loadNotifications();
  }, [user]);

  function getMessage(notification: Notification) {
    const actorName =
      notification.actor?.full_name ||
      notification.actor?.username ||
      "Someone";

    if (notification.type === "like") {
      return `${actorName} liked your post`;
    }

    if (notification.type === "comment") {
      return `${actorName} commented on your post`;
    }

    if (notification.type === "follow") {
      return `${actorName} followed you`;
    }

    return "New notification";
  }

  function getNotificationLabel(type: Notification["type"]) {
    if (type === "like") return "Like";
    if (type === "comment") return "Comment";
    if (type === "follow") return "Follow";
    return "Update";
  }

  if (!user) {
    return (
      <p style={{ padding: "24px" }}>
        Please log in to view notifications.
      </p>
    );
  }

  if (loading) {
    return <p style={{ padding: "24px" }}>Loading notifications...</p>;
  }

  return (
    <main
      style={{
        background: "#fafafa",
        minHeight: "calc(100vh - 72px)",
        padding: "56px 24px",
      }}
    >
      <section style={{ maxWidth: "900px", margin: "0 auto" }}>
        <p
          style={{
            color: "#2563eb",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "13px",
          }}
        >
          Activity Center
        </p>

        <h1
          style={{
            fontSize: "52px",
            letterSpacing: "-0.05em",
            margin: "12px 0",
            color: "#111827",
          }}
        >
          Notifications
        </h1>

        <p style={{ color: "#6b7280", fontSize: "18px", marginBottom: "36px" }}>
          See who is engaging with your stories and profile.
        </p>

        {errorMessage && (
          <div
            style={{
              background: "#fff",
              border: "1px solid #fecaca",
              borderRadius: "18px",
              padding: "18px",
              color: "#991b1b",
              marginBottom: "20px",
            }}
          >
            {errorMessage}
          </div>
        )}

        {notifications.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "36px",
            }}
          >
            <h2 style={{ margin: 0, color: "#111827" }}>
              No notifications yet.
            </h2>
            <p style={{ color: "#6b7280", marginTop: "10px" }}>
              When people like, comment, or follow you, activity will appear
              here.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {notifications.map((notification) => (
              <article
                key={notification.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "22px",
                  padding: "22px",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
                  opacity: notification.is_read ? 0.78 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "16px",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        borderRadius: "999px",
                        padding: "4px 10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "10px",
                      }}
                    >
                      {getNotificationLabel(notification.type)}
                    </span>

                    <p
                      style={{
                        margin: 0,
                        color: "#111827",
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      {getMessage(notification)}
                    </p>

                    {notification.post && (
                      <Link
                        to={`/posts/${notification.post.slug}`}
                        style={{
                          display: "inline-block",
                          marginTop: "10px",
                          color: "#2563eb",
                          fontWeight: 700,
                        }}
                      >
                        View story: {notification.post.title}
                      </Link>
                    )}
                  </div>

                  {!notification.is_read && (
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "999px",
                        background: "#2563eb",
                        marginTop: "8px",
                      }}
                    />
                  )}
                </div>

                <small
                  style={{
                    display: "block",
                    color: "#6b7280",
                    marginTop: "14px",
                  }}
                >
                  {new Date(notification.created_at).toLocaleString()}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}