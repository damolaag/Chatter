import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

type Profile = {
  username: string;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  linkedin: string | null;
};

export function EditProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile>({
    username: "",
    bio: "",
    website: "",
    twitter: "",
    github: "",
    linkedin: "",
  });

  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("username, bio, website, twitter, github, linkedin")
        .eq("id", user.id)
        .single();

      if (error) {
        setStatus(error.message);
        return;
      }

      setProfile(data);
    }

    loadProfile();
  }, [user]);

  async function saveProfile() {
    if (!user) return;

    setStatus("Saving...");

    const { error } = await supabase
      .from("profiles")
      .update({
        username: profile.username,
        bio: profile.bio,
        website: profile.website,
        twitter: profile.twitter,
        github: profile.github,
        linkedin: profile.linkedin,
      })
      .eq("id", user.id);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Profile saved");
  }

  function updateField(field: keyof Profile, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Edit Profile</h1>

      <label>Username</label>
      <input
        className="mb-4 w-full rounded border p-2"
        value={profile.username}
        onChange={(e) => updateField("username", e.target.value)}
      />

      <label>Bio</label>
      <textarea
        className="mb-4 w-full rounded border p-2"
        value={profile.bio ?? ""}
        onChange={(e) => updateField("bio", e.target.value)}
      />

      <label>Website</label>
      <input
        className="mb-4 w-full rounded border p-2"
        value={profile.website ?? ""}
        onChange={(e) => updateField("website", e.target.value)}
      />

      <label>Twitter</label>
      <input
        className="mb-4 w-full rounded border p-2"
        value={profile.twitter ?? ""}
        onChange={(e) => updateField("twitter", e.target.value)}
      />

      <label>GitHub</label>
      <input
        className="mb-4 w-full rounded border p-2"
        value={profile.github ?? ""}
        onChange={(e) => updateField("github", e.target.value)}
      />

      <label>LinkedIn</label>
      <input
        className="mb-4 w-full rounded border p-2"
        value={profile.linkedin ?? ""}
        onChange={(e) => updateField("linkedin", e.target.value)}
      />

      <button
        onClick={saveProfile}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Save Profile
      </button>

      {status && <p className="mt-4">{status}</p>}
    </main>
  );
}