import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

type BookmarkPost = {
  post_id: string;
  posts: {
    id: string;
    title: string;
    slug: string;
  } | null;
};

export function BookmarksPage() {
  const { user } = useAuth();

  const [bookmarks, setBookmarks] = useState<BookmarkPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .select(`
          post_id,
          posts:post_id (
            id,
            title,
            slug
          )
        `)
        .eq("user_id", user.id);

      if (!error && data) {
        setBookmarks(data as unknown as BookmarkPost[]);
      }

      setLoading(false);
    }

    loadBookmarks();
  }, [user]);

  if (loading) {
    return <p style={{ padding: "24px" }}>Loading saved posts...</p>;
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
          Reading Library
        </p>

        <h1
          style={{
            fontSize: "52px",
            letterSpacing: "-0.05em",
            margin: "12px 0",
            color: "#111827",
          }}
        >
          Saved Posts
        </h1>

        <p style={{ color: "#6b7280", fontSize: "18px", marginBottom: "36px" }}>
          Your private collection of stories worth revisiting.
        </p>

        {bookmarks.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "36px",
            }}
          >
            <h2 style={{ margin: 0, color: "#111827" }}>No saved posts yet.</h2>
            <p style={{ color: "#6b7280", marginTop: "10px" }}>
              Bookmark stories you want to return to later.
            </p>

            <Link
              to="/trending"
              style={{
                display: "inline-block",
                marginTop: "20px",
                background: "#111827",
                color: "#fff",
                borderRadius: "999px",
                padding: "10px 16px",
                fontWeight: 700,
              }}
            >
              Explore trending
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {bookmarks.map((bookmark) => {
              const post = bookmark.posts;
              if (!post) return null;

              return (
                <article
                  key={post.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "22px",
                    padding: "24px",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
                  }}
                >
                  <p
                    style={{
                      color: "#2563eb",
                      fontWeight: 700,
                      marginBottom: "10px",
                    }}
                  >
                    Saved story
                  </p>

                  <Link to={`/posts/${post.slug}`}>
                    <h2
                      style={{
                        margin: 0,
                        color: "#111827",
                        fontSize: "26px",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {post.title}
                    </h2>
                  </Link>

                  <Link
                    to={`/posts/${post.slug}`}
                    style={{
                      display: "inline-block",
                      marginTop: "16px",
                      color: "#2563eb",
                      fontWeight: 700,
                    }}
                  >
                    Continue reading →
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}