import { useState } from "react";
import { supabase } from "../lib/supabase";

const redirectUrl = window.location.origin;

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signInWithEmail() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/editor";
  }

  async function signUpWithEmail() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${redirectUrl}/login`,
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      "Account created. Check your email and click the confirmation link."
    );
  }

  async function resendConfirmation() {
    if (!email.trim()) {
      alert("Enter your email first.");
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${redirectUrl}/login`,
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Confirmation email resent.");
  }

  async function signInWithProvider(provider: "google" | "github") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      alert(error.message);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #ffffff 0%, #f8fafc 45%, #eef2ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: "48px",
          alignItems: "center",
        }}
      >
        <section>
          <p
            style={{
              color: "#2563eb",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: "13px",
            }}
          >
            Welcome to Chatter
          </p>

          <h1
            style={{
              fontSize: "clamp(52px, 7vw, 86px)",
              lineHeight: 0.95,
              letterSpacing: "-0.06em",
              margin: "16px 0",
              color: "#111827",
            }}
          >
            Publish ideas that travel the world.
          </h1>

          <p
            style={{
              fontSize: "20px",
              color: "#4b5563",
              lineHeight: 1.8,
              maxWidth: "650px",
            }}
          >
            Chatter helps creators, engineers, writers, founders, and thinkers
            share knowledge with a global audience.
          </p>

          <div
            style={{
              display: "flex",
              gap: "18px",
              marginTop: "36px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong style={{ fontSize: "30px" }}>Global</strong>
              <p style={{ color: "#6b7280" }}>
                Built for worldwide publishing
              </p>
            </div>

            <div>
              <strong style={{ fontSize: "30px" }}>Fast</strong>
              <p style={{ color: "#6b7280" }}>
                Write, publish, engage
              </p>
            </div>

            <div>
              <strong style={{ fontSize: "30px" }}>Modern</strong>
              <p style={{ color: "#6b7280" }}>
                Designed for creators
              </p>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "28px",
            padding: "32px",
            boxShadow: "0 20px 60px rgba(15,23,42,0.08)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "32px",
              letterSpacing: "-0.04em",
            }}
          >
            Login to Chatter
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginTop: "8px",
              marginBottom: "28px",
            }}
          >
            Continue your publishing journey.
          </p>

          <input
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #d1d5db",
              marginBottom: "14px",
              fontSize: "16px",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #d1d5db",
              marginBottom: "18px",
              fontSize: "16px",
            }}
          />

          <button
            onClick={signInWithEmail}
            style={{
              width: "100%",
              background: "#111827",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              padding: "14px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Sign In
          </button>

          <button
            onClick={signUpWithEmail}
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "14px",
              padding: "14px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Create Account
          </button>

          <button
            onClick={resendConfirmation}
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "14px",
              padding: "14px",
              marginBottom: "24px",
            }}
          >
            Resend Confirmation Email
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                height: "1px",
                background: "#e5e7eb",
                flex: 1,
              }}
            />
            <span
              style={{
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              OR
            </span>
            <div
              style={{
                height: "1px",
                background: "#e5e7eb",
                flex: 1,
              }}
            />
          </div>

          <button
            onClick={() => signInWithProvider("google")}
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "14px",
              padding: "14px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Continue with Google
          </button>

          <button
            onClick={() => signInWithProvider("github")}
            style={{
              width: "100%",
              background: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: "14px",
              padding: "14px",
              fontWeight: 600,
            }}
          >
            Continue with GitHub
          </button>
        </section>
      </div>
    </main>
  );
}