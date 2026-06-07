import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { createNotification } from "../lib/notifications";
import { useAuth } from "../context/AuthContext";

type Profile = {
  id: string;
  username: string;
  bio: string | null;
  website: string | null;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  reading_time_minutes: number;
  published_at: string;
};

export function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, username, bio, website")
        .eq("id", id)
        .single();

      if (data) {
        setProfile(data);
        await loadFollowStats(data.id);
        await loadAuthorPosts(data.id);
      }
    }

    loadProfile();
  }, [id, user]);

  async function loadAuthorPosts(profileId: string) {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, slug, reading_time_minutes, published_at")
      .eq("author_id", profileId)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
  }

  async function loadFollowStats(profileId: string) {
    const { count: followerCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profileId);

    const { count: followingCount } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profileId);

    setFollowers(followerCount ?? 0);
    setFollowing(followingCount ?? 0);

    if (user) {
      const { data } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", user.id)
        .eq("following_id", profileId)
        .maybeSingle();

      setIsFollowing(Boolean(data));
    }
  }

  async function toggleFollow() {
    if (!user || !profile) return;

    if (user.id === profile.id) {
      alert("You cannot follow yourself.");
      return;
    }

    if (isFollowing) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", profile.id);

      if (error) {
        alert(error.message);
        return;
      }

      setIsFollowing(false);
      setFollowers((count) => Math.max(0, count - 1));
      return;
    }

    const { error } = await supabase.from("follows").insert({
      follower_id: user.id,
      following_id: profile.id,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setIsFollowing(true);
    setFollowers((count) => count + 1);

    await createNotification({
      userId: profile.id,
      actorId: user.id,
      type: "follow",
    });
  }

  if (!profile) {
    return <p style={{ padding: "24px" }}>Loading profile...</p>;
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
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "30px",
            padding: "36px",
            boxShadow: "0 20px 60px rgba(15,23,42,0.06)",
          }}
        >
          <p
            style={{
              color: "#2563eb",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "13px",
            }}
          >
            Chatter Creator
          </p>

          <h1
            style={{
              fontSize: "56px",
              letterSpacing: "-0.06em",
              margin: "12px 0",
              color: "#111827",
            }}
          >
            {profile.username}
          </h1>

          <p
            style={{
              color: "#4b5563",
              fontSize: "18px",
              lineHeight: 1.7,
              maxWidth: "720px",
            }}
          >
            {profile.bio || "This creator has not added a bio yet."}
          </p>

          <div
            style={{
              display: "flex",
              gap: "22px",
              flexWrap: "wrap",
              marginTop: "28px",
            }}
          >
            <div>
              <strong style={{ fontSize: "28px", color: "#111827" }}>
                {followers}
              </strong>
              <p style={{ color: "#6b7280" }}>Followers</p>
            </div>

            <div>
              <strong style={{ fontSize: "28px", color: "#111827" }}>
                {following}
              </strong>
              <p style={{ color: "#6b7280" }}>Following</p>
            </div>

            <div>
              <strong style={{ fontSize: "28px", color: "#111827" }}>
                {posts.length}
              </strong>
              <p style={{ color: "#6b7280" }}>Stories</p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "28px",
              flexWrap: "wrap",
            }}
          >
            {user && user.id !== profile.id && (
              <button
                onClick={toggleFollow}
                style={{
                  border: "none",
                  background: isFollowing ? "#fff" : "#111827",
                  color: isFollowing ? "#111827" : "#fff",
                  borderRadius: "999px",
                  padding: "12px 18px",
                  fontWeight: 700,
                  borderColor: "#d1d5db",
                  borderWidth: isFollowing ? "1px" : "0",
                  borderStyle: "solid",
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "999px",
                  padding: "12px 18px",
                  fontWeight: 700,
                  color: "#2563eb",
                }}
              >
                Visit website
              </a>
            )}
          </div>
        </div>

        <section style={{ marginTop: "48px" }}>
          <h2
            style={{
              fontSize: "34px",
              letterSpacing: "-0.04em",
              margin: 0,
              color: "#111827",
            }}
          >
            Published Stories
          </h2>

          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            Essays and posts from {profile.username}.
          </p>

          {posts.length === 0 ? (
            <div
              style={{
                marginTop: "24px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "22px",
                padding: "28px",
              }}
            >
              <p style={{ color: "#6b7280" }}>No published posts yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
              {posts.map((post) => (
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
                  <Link to={`/posts/${post.slug}`}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "26px",
                        letterSpacing: "-0.04em",
                        color: "#111827",
                      }}
                    >
                      {post.title}
                    </h3>
                  </Link>

                  <p style={{ color: "#6b7280", marginTop: "10px" }}>
                    {post.reading_time_minutes} min read ·{" "}
                    {new Date(post.published_at).toLocaleDateString()}
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
      </section>
    </main>
  );
}