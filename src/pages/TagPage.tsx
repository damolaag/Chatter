import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Tag = {
  id: string;
  name: string;
  slug: string;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  reading_time_minutes: number | null;
  published_at: string | null;
};

type PostTagRow = {
  posts: Post | Post[] | null;
};

export function TagPage() {
  const { slug } = useParams();

  const [tag, setTag] = useState<Tag | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadTagPage() {
      if (!slug) return;

      setLoading(true);
      setErrorMessage("");

      const { data: tagData, error: tagError } = await supabase
        .from("tags")
        .select("id, name, slug")
        .eq("slug", slug)
        .maybeSingle();

      if (tagError) {
        setErrorMessage(tagError.message);
        setLoading(false);
        return;
      }

      if (!tagData) {
        setErrorMessage(`No tag found for: ${slug}`);
        setLoading(false);
        return;
      }

      setTag(tagData);

      const { data: postTagData, error: postTagError } = await supabase
        .from("post_tags")
        .select(`
          posts (
            id,
            title,
            slug,
            reading_time_minutes,
            published_at
          )
        `)
        .eq("tag_id", tagData.id);

      if (postTagError) {
        setErrorMessage(postTagError.message);
        setLoading(false);
        return;
      }

      const rows = (postTagData ?? []) as PostTagRow[];

      const loadedPosts = rows
        .map((row) => {
          if (Array.isArray(row.posts)) return row.posts[0];
          return row.posts;
        })
        .filter((post): post is Post => Boolean(post))
        .sort((a, b) => {
          const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
          const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
          return dateB - dateA;
        });

      setPosts(loadedPosts);
      setLoading(false);
    }

    loadTagPage();
  }, [slug]);

  if (loading) {
    return <p style={{ padding: "24px" }}>Loading tag...</p>;
  }

  if (errorMessage) {
    return <p style={{ padding: "24px" }}>{errorMessage}</p>;
  }

  if (!tag) {
    return <p style={{ padding: "24px" }}>Tag not found.</p>;
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
          Topic Collection
        </p>

        <h1
          style={{
            fontSize: "56px",
            letterSpacing: "-0.05em",
            margin: "12px 0",
            color: "#111827",
          }}
        >
          #{tag.name}
        </h1>

        <p style={{ color: "#6b7280", fontSize: "18px", marginBottom: "36px" }}>
          {posts.length} {posts.length === 1 ? "story" : "stories"} tagged with #
          {tag.name}.
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
              No stories found for this tag.
            </h2>

            <p style={{ color: "#6b7280", marginTop: "10px" }}>
              When writers publish stories with this topic, they’ll appear here.
            </p>

            <Link
              to="/editor"
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
              Write a story
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {posts.map((post) => (
              <article
                key={post.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "24px",
                  padding: "26px",
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
                  #{tag.name}
                </p>

                <Link to={`/posts/${post.slug}`}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "30px",
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
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}