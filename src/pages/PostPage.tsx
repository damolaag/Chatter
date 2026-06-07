import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { supabase } from "../lib/supabase";
import { createNotification } from "../lib/notifications";
import { useAuth } from "../context/AuthContext";

type Post = {
  id: string;
  title: string;
  slug: string;
  body_markdown: string;
  reading_time_minutes: number;
  author_id: string;
};

type Comment = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  profiles: {
    username: string;
  } | null;
};

type Tag = {
  id: string;
  name: string;
  slug: string;
};

type PostTagRow = {
  tags: Tag | Tag[] | null;
};

export function PostPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasBookmarked, setHasBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState("");

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;

      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, title, slug, body_markdown, reading_time_minutes, author_id"
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (!data) {
        setErrorMessage(`No published post found for slug: ${slug}`);
        return;
      }

      setPost(data);
      await loadTags(data.id);
      await loadLikes(data.id);
      await loadBookmarks(data.id);
      await loadComments(data.id);
    }

    loadPost();
  }, [slug, user]);

  useEffect(() => {
    if (!post) return;

    const channel = supabase
      .channel(`comments-post-${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${post.id}`,
        },
        async () => {
          await loadComments(post.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post]);

  async function loadTags(postId: string) {
    const { data, error } = await supabase
      .from("post_tags")
      .select(`
        tags (
          id,
          name,
          slug
        )
      `)
      .eq("post_id", postId);

    if (error) {
      console.error("Load tags error:", error.message);
      setTags([]);
      return;
    }

    const rows = (data ?? []) as PostTagRow[];

    const loadedTags = rows
      .map((row) => {
        if (Array.isArray(row.tags)) return row.tags[0];
        return row.tags;
      })
      .filter((tag): tag is Tag => Boolean(tag));

    setTags(loadedTags);
  }

  async function loadLikes(postId: string) {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    setLikeCount(count ?? 0);

    if (user) {
      const { data } = await supabase
        .from("likes")
        .select("user_id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      setHasLiked(Boolean(data));
    }
  }

  async function loadBookmarks(postId: string) {
    if (!user) return;

    const { data } = await supabase
      .from("bookmarks")
      .select("user_id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    setHasBookmarked(Boolean(data));
  }

  async function loadComments(postId: string) {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        body,
        created_at,
        author_id,
        profiles:author_id (
          username
        )
      `)
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setComments(data as unknown as Comment[]);
    }
  }

  async function toggleLike() {
    if (!user) {
      alert("Please login to like this post.");
      return;
    }

    if (!post) return;

    if (hasLiked) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      setHasLiked(false);
      setLikeCount((count) => Math.max(0, count - 1));
      return;
    }

    const { error } = await supabase.from("likes").upsert(
      {
        post_id: post.id,
        user_id: user.id,
      },
      {
        onConflict: "user_id,post_id",
        ignoreDuplicates: true,
      }
    );

    if (error) {
      alert(error.message);
      return;
    }

    setHasLiked(true);
    setLikeCount((count) => count + 1);

    await createNotification({
      userId: post.author_id,
      actorId: user.id,
      type: "like",
      postId: post.id,
    });
  }

  async function toggleBookmark() {
    if (!user) {
      alert("Please login to bookmark this post.");
      return;
    }

    if (!post) return;

    if (hasBookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      setHasBookmarked(false);
      return;
    }

    const { error } = await supabase.from("bookmarks").insert({
      post_id: post.id,
      user_id: user.id,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setHasBookmarked(true);
  }

  async function addComment() {
    if (!user) {
      alert("Please login to comment.");
      return;
    }

    if (!post || !commentBody.trim()) return;

    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      author_id: user.id,
      body: commentBody.trim(),
    });

    if (error) {
      alert(error.message);
      return;
    }

    await createNotification({
      userId: post.author_id,
      actorId: user.id,
      type: "comment",
      postId: post.id,
    });

    setCommentBody("");
    await loadComments(post.id);
  }

  if (errorMessage) {
    return (
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
        <p>{errorMessage}</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
        <p>Loading story...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        background: "#fafafa",
        minHeight: "calc(100vh - 72px)",
      }}
    >
      <article
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <header
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "72px 24px 40px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tags/${tag.slug}`}
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                  borderRadius: "999px",
                  padding: "6px 12px",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                #{tag.name}
              </Link>
            ))}
          </div>

          <h1
            style={{
              fontSize: "clamp(42px, 7vw, 72px)",
              lineHeight: 0.95,
              letterSpacing: "-0.06em",
              color: "#111827",
              margin: 0,
            }}
          >
            {post.title}
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
              marginTop: "24px",
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            <span>{post.reading_time_minutes} min read</span>
            <span>•</span>
            <span>{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
            <span>•</span>
            <span>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "28px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={toggleLike}
              style={{
                border: "1px solid #e5e7eb",
                background: hasLiked ? "#111827" : "#fff",
                color: hasLiked ? "#fff" : "#111827",
                borderRadius: "999px",
                padding: "10px 16px",
                fontWeight: 700,
              }}
            >
              {hasLiked ? "Liked" : "Like"} · {likeCount}
            </button>

            <button
              onClick={toggleBookmark}
              style={{
                border: "1px solid #e5e7eb",
                background: hasBookmarked ? "#2563eb" : "#fff",
                color: hasBookmarked ? "#fff" : "#111827",
                borderRadius: "999px",
                padding: "10px 16px",
                fontWeight: 700,
              }}
            >
              {hasBookmarked ? "Bookmarked" : "Bookmark"}
            </button>
          </div>
        </header>

        <section
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "20px 24px 72px",
            color: "#1f2937",
            fontSize: "20px",
            lineHeight: 1.85,
          }}
        >
          <div className="chatter-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSanitize]}
            >
              {post.body_markdown}
            </ReactMarkdown>
          </div>
        </section>
      </article>

      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "24px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "28px",
              letterSpacing: "-0.04em",
              color: "#111827",
            }}
          >
            Conversation ({comments.length})
          </h2>

          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            Join the discussion around this story.
          </p>

          <textarea
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="Share your thoughts..."
            style={{
              width: "100%",
              minHeight: "120px",
              marginTop: "20px",
              padding: "14px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              resize: "vertical",
              font: "inherit",
            }}
          />

          <button
            onClick={addComment}
            style={{
              marginTop: "12px",
              background: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "10px 16px",
              fontWeight: 700,
            }}
          >
            Add comment
          </button>

          <div style={{ marginTop: "32px", display: "grid", gap: "18px" }}>
            {comments.length === 0 && (
              <p style={{ color: "#6b7280" }}>
                No comments yet. Start the conversation.
              </p>
            )}

            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: "18px",
                }}
              >
                <strong style={{ color: "#111827" }}>
                  {comment.profiles?.username || "Unknown user"}
                </strong>

                <p
                  style={{
                    marginTop: "8px",
                    color: "#374151",
                    lineHeight: 1.7,
                  }}
                >
                  {comment.body}
                </p>

                <small style={{ color: "#6b7280" }}>
                  {new Date(comment.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}