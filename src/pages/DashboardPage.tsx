import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

type AuthorPost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
};

type PostMetric = AuthorPost & {
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  totalEngagement: number;
};

export function DashboardPage() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<PostMetric[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");

      const { data: authorPosts, error: postsError } = await supabase
        .from("posts")
        .select("id, title, slug, status, published_at")
        .eq("author_id", user.id)
        .order("published_at", { ascending: false });

      if (postsError) {
        setErrorMessage(postsError.message);
        setLoading(false);
        return;
      }

      const postMetrics = await Promise.all(
        (authorPosts ?? []).map(async (post) => {
          const [
            { count: likesCount },
            { count: commentsCount },
            { count: bookmarksCount },
          ] = await Promise.all([
            supabase
              .from("likes")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id),

            supabase
              .from("comments")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id),

            supabase
              .from("bookmarks")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id),
          ]);

          const likes = likesCount ?? 0;
          const comments = commentsCount ?? 0;
          const bookmarks = bookmarksCount ?? 0;

          return {
            ...post,
            likesCount: likes,
            commentsCount: comments,
            bookmarksCount: bookmarks,
            totalEngagement: likes + comments + bookmarks,
          };
        })
      );

      const { count: followerCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id);

      setPosts(
        postMetrics.sort((a, b) => b.totalEngagement - a.totalEngagement)
      );

      setTotalLikes(
        postMetrics.reduce((total, post) => total + post.likesCount, 0)
      );

      setTotalComments(
        postMetrics.reduce((total, post) => total + post.commentsCount, 0)
      );

      setTotalBookmarks(
        postMetrics.reduce((total, post) => total + post.bookmarksCount, 0)
      );

      setFollowers(followerCount ?? 0);
      setLoading(false);
    }

    loadDashboard();
  }, [user]);

  if (!user) {
    return <p style={{ padding: "24px" }}>Please log in to view dashboard.</p>;
  }

  if (loading) {
    return <p style={{ padding: "24px" }}>Loading dashboard...</p>;
  }

  if (errorMessage) {
    return <p style={{ padding: "24px" }}>{errorMessage}</p>;
  }

  const statCards = [
    { label: "Total Posts", value: posts.length },
    { label: "Total Likes", value: totalLikes },
    { label: "Total Comments", value: totalComments },
    { label: "Total Bookmarks", value: totalBookmarks },
    { label: "Followers", value: followers },
  ];

  return (
    <main
      style={{
        background: "#fafafa",
        minHeight: "calc(100vh - 72px)",
        padding: "48px 24px",
      }}
    >
      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              color: "#2563eb",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "13px",
            }}
          >
            Creator Analytics
          </p>

          <h1
            style={{
              fontSize: "52px",
              letterSpacing: "-0.05em",
              margin: "12px 0",
              color: "#111827",
            }}
          >
            Dashboard
          </h1>

          <p style={{ color: "#6b7280", fontSize: "18px" }}>
            Track engagement, followers, and content performance.
          </p>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "18px",
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "22px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
              }}
            >
              <h2
                style={{
                  fontSize: "38px",
                  margin: 0,
                  color: "#111827",
                  letterSpacing: "-0.04em",
                }}
              >
                {card.value}
              </h2>
              <p style={{ color: "#6b7280", marginTop: "8px" }}>{card.label}</p>
            </div>
          ))}
        </section>

        <section style={{ marginTop: "56px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "32px",
                  letterSpacing: "-0.04em",
                  margin: 0,
                  color: "#111827",
                }}
              >
                Post Performance
              </h2>
              <p style={{ color: "#6b7280", marginTop: "6px" }}>
                Your best performing stories ranked by engagement.
              </p>
            </div>

            <Link
              to="/editor"
              style={{
                background: "#111827",
                color: "#fff",
                borderRadius: "999px",
                padding: "10px 16px",
                fontWeight: 700,
              }}
            >
              New story
            </Link>
          </div>

          {posts.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "22px",
                padding: "32px",
              }}
            >
              <h3 style={{ margin: 0, color: "#111827" }}>
                You have not written any posts yet.
              </h3>
              <p style={{ color: "#6b7280", marginTop: "8px" }}>
                Publish your first story to start tracking performance.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {posts.map((post, index) => (
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
                      fontWeight: 800,
                      marginBottom: "10px",
                    }}
                  >
                    #{index + 1}
                  </p>

                  <Link to={`/posts/${post.slug}`}>
                    <h3
                      style={{
                        margin: 0,
                        color: "#111827",
                        fontSize: "24px",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {post.title}
                    </h3>
                  </Link>

                  <p style={{ marginTop: "10px", color: "#6b7280" }}>
                    Status: <strong>{post.status}</strong>
                  </p>

                  <p style={{ marginTop: "10px", color: "#374151" }}>
                    {post.likesCount} likes · {post.commentsCount} comments ·{" "}
                    {post.bookmarksCount} bookmarks · Engagement:{" "}
                    <strong>{post.totalEngagement}</strong>
                  </p>

                  {post.published_at && (
                    <small style={{ color: "#6b7280" }}>
                      Published {new Date(post.published_at).toLocaleDateString()}
                    </small>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}