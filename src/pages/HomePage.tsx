import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Post = {
  id: string;
  title: string;
  slug: string;
  reading_time_minutes: number;
  published_at: string;
  profiles: {
    id: string;
    username: string | null;
    full_name: string | null;
  } | null;
};

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);

      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          title,
          slug,
          reading_time_minutes,
          published_at,
          profiles:author_id (
            id,
            username,
            full_name
          )
        `)
        .eq("status", "published")
        .order("published_at", {
          ascending: false,
        });

      if (!error && data) {
        setPosts(data as unknown as Post[]);
      }

      setLoading(false);
    }

    loadPosts();
  }, []);

  return (
    <main
      style={{
        background: "#fafafa",
        minHeight: "calc(100vh - 72px)",
      }}
    >
      <section
        style={{
          borderBottom: "1px solid #e5e7eb",
          background:
            "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #eef2ff 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "72px 24px 64px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.6fr)",
            gap: "48px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                color: "#2563eb",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              Global publishing for modern voices
            </p>

            <h1
              style={{
                fontSize: "clamp(44px, 7vw, 76px)",
                lineHeight: 0.95,
                letterSpacing: "-0.06em",
                margin: 0,
                color: "#111827",
                maxWidth: "820px",
              }}
            >
              Ideas worth reading, from everywhere.
            </h1>

            <p
              style={{
                marginTop: "24px",
                color: "#4b5563",
                fontSize: "20px",
                lineHeight: 1.7,
                maxWidth: "680px",
              }}
            >
              Chatter is a home for thoughtful writing, sharp perspectives,
              technical essays, and stories from creators around the world.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                marginTop: "32px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/editor"
                style={{
                  background: "#111827",
                  color: "#fff",
                  padding: "12px 18px",
                  borderRadius: "999px",
                  fontWeight: 700,
                }}
              >
                Start writing
              </Link>

              <Link
                to="/trending"
                style={{
                  background: "#fff",
                  color: "#111827",
                  padding: "12px 18px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  border: "1px solid #e5e7eb",
                }}
              >
                Explore trending
              </Link>
            </div>
          </div>

          <aside
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "24px",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Chatter network
            </p>

            <div style={{ marginTop: "24px", display: "grid", gap: "18px" }}>
              <div>
                <strong style={{ fontSize: "28px", color: "#111827" }}>
                  {posts.length}
                </strong>
                <p style={{ color: "#6b7280", marginTop: "4px" }}>
                  Published stories
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "28px", color: "#111827" }}>
                  24/7
                </strong>
                <p style={{ color: "#6b7280", marginTop: "4px" }}>
                  Ideas moving across borders
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "28px", color: "#111827" }}>
                  Global
                </strong>
                <p style={{ color: "#6b7280", marginTop: "4px" }}>
                  Built for writers, readers, and builders
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "48px 24px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: "48px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "28px",
                  margin: 0,
                  letterSpacing: "-0.03em",
                  color: "#111827",
                }}
              >
                Latest stories
              </h2>

              <p style={{ color: "#6b7280", marginTop: "6px" }}>
                Fresh perspectives from the Chatter community.
              </p>
            </div>

            <Link
              to="/search"
              style={{
                color: "#2563eb",
                fontWeight: 700,
              }}
            >
              Search all
            </Link>
          </div>

          {loading && (
            <p style={{ color: "#6b7280" }}>Loading stories...</p>
          )}

          {!loading && posts.length === 0 && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "20px",
                padding: "40px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "24px" }}>
                No published stories yet.
              </h3>
              <p style={{ color: "#6b7280", marginTop: "10px" }}>
                Be the first to publish something meaningful on Chatter.
              </p>
              <Link
                to="/editor"
                style={{
                  display: "inline-block",
                  marginTop: "20px",
                  background: "#111827",
                  color: "#fff",
                  padding: "10px 16px",
                  borderRadius: "999px",
                  fontWeight: 700,
                }}
              >
                Write first story
              </Link>
            </div>
          )}

          <div style={{ display: "grid", gap: "18px" }}>
            {posts.map((post) => {
              const authorName =
                post.profiles?.full_name ||
                post.profiles?.username ||
                "Chatter writer";

              return (
                <article
                  key={post.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "22px",
                    padding: "26px",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#6b7280",
                      fontSize: "14px",
                      marginBottom: "12px",
                    }}
                  >
                    {post.profiles?.id ? (
                      <Link
                        to={`/profiles/${post.profiles.id}`}
                        style={{ fontWeight: 700, color: "#374151" }}
                      >
                        {authorName}
                      </Link>
                    ) : (
                      <span>{authorName}</span>
                    )}

                    <span>•</span>

                    <span>{post.reading_time_minutes} min read</span>

                    <span>•</span>

                    <span>
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                  </div>

                  <Link to={`/posts/${post.slug}`}>
                    <h3
                      style={{
                        fontSize: "30px",
                        lineHeight: 1.15,
                        letterSpacing: "-0.04em",
                        color: "#111827",
                        margin: 0,
                      }}
                    >
                      {post.title}
                    </h3>
                  </Link>

                  <p
                    style={{
                      color: "#6b7280",
                      marginTop: "14px",
                      lineHeight: 1.7,
                    }}
                  >
                    Read this story from the Chatter community and join the
                    conversation.
                  </p>

                  <Link
                    to={`/posts/${post.slug}`}
                    style={{
                      display: "inline-block",
                      marginTop: "18px",
                      color: "#2563eb",
                      fontWeight: 700,
                    }}
                  >
                    Read story →
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        <aside
          style={{
            display: "grid",
            gap: "18px",
            alignContent: "start",
          }}
        >
          <div
            style={{
              background: "#111827",
              color: "#fff",
              borderRadius: "22px",
              padding: "24px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "22px" }}>Write globally</h3>
            <p style={{ color: "#d1d5db", marginTop: "10px", lineHeight: 1.7 }}>
              Publish essays, guides, and opinions for readers anywhere in the
              world.
            </p>

            <Link
              to="/editor"
              style={{
                display: "inline-block",
                marginTop: "18px",
                background: "#fff",
                color: "#111827",
                padding: "10px 14px",
                borderRadius: "999px",
                fontWeight: 700,
              }}
            >
              New story
            </Link>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "22px",
              padding: "24px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "20px" }}>Explore</h3>

            <div
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <Link to="/trending" style={{ color: "#2563eb", fontWeight: 700 }}>
                Trending stories
              </Link>

              <Link to="/search" style={{ color: "#2563eb", fontWeight: 700 }}>
                Search Chatter
              </Link>

              <Link to="/dashboard" style={{ color: "#2563eb", fontWeight: 700 }}>
                Creator dashboard
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}