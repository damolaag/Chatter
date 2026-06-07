import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function calculateReadingTime(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function parseTags(tagsText: string) {
  return tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => ({
      name: tag,
      slug: slugify(tag),
    }))
    .filter((tag, index, array) => {
      return array.findIndex((item) => item.slug === tag.slug) === index;
    });
}

export function EditorPage() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("Write your post...");
  const [tagsText, setTagsText] = useState("");
  const [postId, setPostId] = useState<string | null>(null);
  const [postSlug, setPostSlug] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState("Not saved");

  async function saveTagsForPost(currentPostId: string) {
    const parsedTags = parseTags(tagsText);

    await supabase.from("post_tags").delete().eq("post_id", currentPostId);

    if (parsedTags.length === 0) return;

    const { error: tagUpsertError } = await supabase.from("tags").upsert(
      parsedTags,
      {
        onConflict: "slug",
        ignoreDuplicates: false,
      }
    );

    if (tagUpsertError) {
      setSavedStatus(tagUpsertError.message);
      return;
    }

    const { data: savedTags, error: fetchTagsError } = await supabase
      .from("tags")
      .select("id, slug")
      .in(
        "slug",
        parsedTags.map((tag) => tag.slug)
      );

    if (fetchTagsError) {
      setSavedStatus(fetchTagsError.message);
      return;
    }

    const postTagRows =
      savedTags?.map((tag) => ({
        post_id: currentPostId,
        tag_id: tag.id,
      })) ?? [];

    if (postTagRows.length === 0) return;

    const { error: postTagsError } = await supabase
      .from("post_tags")
      .insert(postTagRows);

    if (postTagsError) {
      setSavedStatus(postTagsError.message);
    }
  }

  async function saveDraft() {
    if (!user || !title.trim()) {
      setSavedStatus("Add a title first");
      return;
    }

    setSavedStatus("Saving...");

    const slug = postSlug ?? `${slugify(title)}-${Date.now()}`;

    const payload = {
      author_id: user.id,
      title,
      slug,
      body_markdown: body,
      status: "draft",
      reading_time_minutes: calculateReadingTime(body),
      updated_at: new Date().toISOString(),
    };

    if (postId) {
      const { error } = await supabase
        .from("posts")
        .update(payload)
        .eq("id", postId);

      if (error) {
        setSavedStatus(error.message);
        return;
      }

      await saveTagsForPost(postId);
      setSavedStatus("Saved");
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert(payload)
      .select("id, slug")
      .single();

    if (error) {
      setSavedStatus(error.message);
      return;
    }

    setPostId(data.id);
    setPostSlug(data.slug);

    await saveTagsForPost(data.id);

    setSavedStatus("Saved");
  }

  async function publishPost() {
    if (!user || !title.trim()) {
      alert("Add a title first");
      return;
    }

    let currentPostId = postId;
    let currentSlug = postSlug;

    if (!currentPostId) {
      setSavedStatus("Saving before publishing...");

      const slug = `${slugify(title)}-${Date.now()}`;

      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          title,
          slug,
          body_markdown: body,
          status: "draft",
          reading_time_minutes: calculateReadingTime(body),
          updated_at: new Date().toISOString(),
        })
        .select("id, slug")
        .single();

      if (error) {
        setSavedStatus(error.message);
        return;
      }

      currentPostId = data.id;
      currentSlug = data.slug;
      setPostId(data.id);
      setPostSlug(data.slug);
    }

    if (!currentPostId) {
  alert("Could not find post to publish.");
  return;
}

await saveTagsForPost(currentPostId);
    const { error } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentPostId);

    if (error) {
      alert(error.message);
      return;
    }

    setSavedStatus("Published");

    if (currentSlug) {
      window.location.href = `/posts/${currentSlug}`;
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (title.trim()) {
        void saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [title, body, tagsText, postId, postSlug]);

  return (
    <main
      style={{
        background: "#fafafa",
        minHeight: "calc(100vh - 72px)",
        padding: "48px 24px",
      }}
    >
      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <p
            style={{
              color: "#2563eb",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "13px",
            }}
          >
            New Story
          </p>

          <h1
            style={{
              fontSize: "52px",
              letterSpacing: "-0.05em",
              margin: "12px 0",
              color: "#111827",
            }}
          >
            Write something worth reading.
          </h1>

          <p style={{ color: "#6b7280", fontSize: "18px" }}>
            Draft, tag, save, and publish your ideas to the Chatter community.
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "28px",
            padding: "28px",
            boxShadow: "0 18px 50px rgba(15,23,42,0.06)",
          }}
        >
          <input
            placeholder="Post title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "44px",
              lineHeight: 1.1,
              letterSpacing: "-0.05em",
              fontWeight: 800,
              color: "#111827",
              marginBottom: "18px",
            }}
          />

          <input
            placeholder="Tags, separated by commas. Example: react, supabase, typescript"
            value={tagsText}
            onChange={(event) => setTagsText(event.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              marginBottom: "16px",
              fontSize: "16px",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              marginBottom: "18px",
              color: "#6b7280",
            }}
          >
            <p>{savedStatus}</p>
            <p>{calculateReadingTime(body)} min read</p>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <MDEditor value={body} onChange={(value) => setBody(value ?? "")} />
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "22px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={saveDraft}
              style={{
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#111827",
                borderRadius: "999px",
                padding: "12px 18px",
                fontWeight: 700,
              }}
            >
              Save draft
            </button>

            <button
              onClick={publishPost}
              style={{
                border: "none",
                background: "#111827",
                color: "#fff",
                borderRadius: "999px",
                padding: "12px 18px",
                fontWeight: 700,
              }}
            >
              Publish
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}