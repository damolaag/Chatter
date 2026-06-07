import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Post = {
  id: string;
  title: string;
  slug: string;
  reading_time_minutes: number | null;
  published_at: string | null;
};

type TrendingPost = Post & {
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
  score: number;
};

export function TrendingPage() {
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTrendingPosts() {
      setLoading(true);
      setErrorMessage("");

      const { data: publishedPosts, error: postsError } = await supabase
        .from("posts")
        .select("id, title, slug, reading_time_minutes, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(50);

      if (postsError) {
        setErrorMessage(postsError.message);
        setLoading(false);
        return;
      }

      const postsWithScores = await Promise.all(
        (publishedPosts ?? []).map(async (post) => {
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

          const totalLikes = likesCount ?? 0;
          const totalComments = commentsCount ?? 0;
          const totalBookmarks = bookmarksCount ?? 0;

          return {
            ...post,
            likesCount: totalLikes,
            commentsCount: totalComments,
            bookmarksCount: totalBookmarks,
            score: totalLikes + totalComments + totalBookmarks * 2,
          };
        })
      );

      const sortedPosts = postsWithScores.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;

        const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;

        return dateB - dateA;
      });

      setPosts(sortedPosts);
      setLoading(false);
    }

    loadTrendingPosts();
  }, []);

  if (loading) {
    return <p style={{ padding: "24px" }}>Loading trending posts...</p>;
  }

  if (errorMessage) {
    return <p style={{ padding: "24px" }}>{errorMessage}</p>;
  }

  return (
    <main
      style={{
        background: "#fafafa",
        minHeight: "calc(100vh - 72px)",
        padding: "56px 24px",
      }}
    >
      <section style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <p
          style={{
            color: "#2563eb",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: "13px",
          }}
        >
          Trending Now
        </p>

        <h1
          style={{
            fontSize: "56px",
            letterSpacing: "-0.05em",
            margin: "12px 0",
            color: "#111827",
          }}
        >
          Stories people are returning to.
        </h1>

        <p style={{ color: "#6b7280", fontSize: "18px", marginBottom: "36px" }}>
          Ranked by likes, comments, and weighted bookmarks.
        </p>

        {posts.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "36px",
            }}
          >
            <h2 style={{ margin: 0, color: "#111827" }}>
              No published posts yet.
            </h2>
            <p style={{ color: "#6b7280", marginTop: "10px" }}>
              Trending stories will appear here once the community starts
              engaging.
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
                  borderRadius: "24px",
                  padding: "26px",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
                  display: "grid",
                  gridTemplateColumns: "56px 1fr",
                  gap: "18px",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "16px",
                    background: index === 0 ? "#111827" : "#eff6ff",
                    color: index === 0 ? "#fff" : "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  #{index + 1}
                </div>

                <div>
                  <Link to={`/posts/${post.slug}`}>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "28px",
                        letterSpacing: "-0.04em",
                        color: "#111827",
                      }}
                    >
                      {post.title}
                    </h2>
                  </Link>

                  <p style={{ color: "#6b7280", marginTop: "10px" }}>
                    {post.reading_time_minutes ?? 1} min read
                    {post.published_at &&
                      ` · Published ${new Date(
                        post.published_at
                      ).toLocaleDateString()}`}
                  </p>

                  <p style={{ color: "#374151", marginTop: "12px" }}>
                    {post.likesCount}{" "}
                    {post.likesCount === 1 ? "like" : "likes"} ·{" "}
                    {post.commentsCount}{" "}
                    {post.commentsCount === 1 ? "comment" : "comments"} ·{" "}
                    {post.bookmarksCount}{" "}
                    {post.bookmarksCount === 1 ? "bookmark" : "bookmarks"} ·{" "}
                    Score: <strong>{post.score}</strong>
                  </p>

                  <Link
                    to={`/posts/${post.slug}`}
                    style={{
                      display: "inline-block",
                      marginTop: "16px",
                      color: "#2563eb",
                      fontWeight: 700,
                    }}
                  >
                    Read story →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}