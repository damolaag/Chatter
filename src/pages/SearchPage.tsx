import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

type PostResult = {
  id: string;
  title: string;
  slug: string;
  reading_time_minutes: number | null;
  published_at: string | null;
};

type ProfileResult = {
  id: string;
  username: string | null;
  bio: string | null;
};

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [profileResults, setProfileResults] = useState<ProfileResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function runSearch(searchQuery: string) {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setPostResults([]);
      setProfileResults([]);
      setSearched(false);
      setErrorMessage("");
      setSearchParams({});
      return;
    }

    setLoading(true);
    setSearched(true);
    setErrorMessage("");
    setSearchParams({ q: trimmedQuery });

    const [postsResponse, profilesResponse] = await Promise.all([
      supabase
        .from("posts")
        .select("id, title, slug, reading_time_minutes, published_at")
        .eq("status", "published")
        .ilike("title", `%${trimmedQuery}%`)
        .order("published_at", { ascending: false })
        .limit(20),

      supabase
        .from("profiles")
        .select("id, username, bio")
        .ilike("username", `%${trimmedQuery}%`)
        .limit(20),
    ]);

    if (postsResponse.error || profilesResponse.error) {
      setErrorMessage(
        postsResponse.error?.message ||
          profilesResponse.error?.message ||
          "Search failed."
      );
      setLoading(false);
      return;
    }

    setPostResults(postsResponse.data ?? []);
    setProfileResults(profilesResponse.data ?? []);
    setLoading(false);
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
          Discover Chatter
        </p>

        <h1
          style={{
            fontSize: "56px",
            letterSpacing: "-0.05em",
            margin: "12px 0",
            color: "#111827",
          }}
        >
          Search ideas, stories, and creators.
        </h1>

        <p
          style={{
            color: "#6b7280",
            fontSize: "18px",
            marginBottom: "32px",
          }}
        >
          Explore posts and profiles from across the Chatter community.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runSearch(query);
          }}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "24px",
            padding: "18px",
            display: "flex",
            gap: "12px",
            boxShadow: "0 14px 40px rgba(15,23,42,0.06)",
          }}
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts or profiles..."
            style={{
              flex: 1,
              padding: "16px",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              fontSize: "18px",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "0 22px",
              borderRadius: "16px",
              border: "none",
              background: "#111827",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Search
          </button>
        </form>

        {loading && <p style={{ marginTop: "24px" }}>Searching...</p>}

        {errorMessage && <p style={{ marginTop: "24px" }}>{errorMessage}</p>}

        {searched && !loading && !errorMessage && (
          <div
            style={{
              marginTop: "42px",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 360px)",
              gap: "28px",
            }}
          >
            <section>
              <h2
                style={{
                  fontSize: "30px",
                  letterSpacing: "-0.04em",
                  color: "#111827",
                }}
              >
                Posts
              </h2>

              {postResults.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No posts found.</p>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {postResults.map((post) => (
                    <article
                      key={post.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "22px",
                        padding: "22px",
                        boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
                      }}
                    >
                      <Link to={`/posts/${post.slug}`}>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "24px",
                            letterSpacing: "-0.03em",
                            color: "#111827",
                          }}
                        >
                          {post.title}
                        </h3>
                      </Link>

                      <p style={{ color: "#6b7280", marginTop: "10px" }}>
                        {post.reading_time_minutes ?? 1} min read
                      </p>

                      {post.published_at && (
                        <small style={{ color: "#6b7280" }}>
                          {new Date(post.published_at).toLocaleDateString()}
                        </small>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2
                style={{
                  fontSize: "30px",
                  letterSpacing: "-0.04em",
                  color: "#111827",
                }}
              >
                Profiles
              </h2>

              {profileResults.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No profiles found.</p>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {profileResults.map((profile) => (
                    <article
                      key={profile.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "22px",
                        padding: "22px",
                      }}
                    >
                      <Link to={`/profiles/${profile.id}`}>
                        <h3
                          style={{
                            margin: 0,
                            color: "#111827",
                            fontSize: "22px",
                          }}
                        >
                          {profile.username || "Unnamed user"}
                        </h3>
                      </Link>

                      <p style={{ color: "#6b7280", marginTop: "10px" }}>
                        {profile.bio || "No bio yet"}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}