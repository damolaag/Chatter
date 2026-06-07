import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "../pages/LoginPage";

vi.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resend: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

import { supabase } from "../lib/supabase";

const mockedSupabase = vi.mocked(supabase, true);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
  });

  it("renders login form", () => {
    render(<LoginPage />);

    expect(screen.getByText("Login to Chatter")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("signs in with email and password", async () => {
    const user = userEvent.setup();

    mockedSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        },
        session: null,
      },
      error: null,
    } as any);

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email address"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByText("Sign In"));

    expect(mockedSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("shows alert when sign in fails", async () => {
    const user = userEvent.setup();

    mockedSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: {
        message: "Invalid credentials",
      },
    } as any);

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email address"), "bad@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "wrongpass");
    await user.click(screen.getByText("Sign In"));

    expect(window.alert).toHaveBeenCalledWith("Invalid credentials");
  });

  it("creates account with email and password", async () => {
    const user = userEvent.setup();

    mockedSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: null,
    } as any);

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email address"), "new@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByText("Create Account"));

    expect(mockedSupabase.auth.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "password123",
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
  });

  it("starts Google OAuth login", async () => {
    const user = userEvent.setup();

    mockedSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: {
        provider: "google",
        url: "http://localhost:5173",
      },
      error: null,
    } as any);

    render(<LoginPage />);

    await user.click(screen.getByText("Continue with Google"));

    expect(mockedSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  });

  it("starts GitHub OAuth login", async () => {
    const user = userEvent.setup();

    mockedSupabase.auth.signInWithOAuth.mockResolvedValue({
      data: {
        provider: "github",
        url: "http://localhost:5173",
      },
      error: null,
    } as any);

    render(<LoginPage />);

    await user.click(screen.getByText("Continue with GitHub"));

    expect(mockedSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    });
  });

  it("alerts when resending confirmation without email", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByText("Resend Confirmation Email"));

    expect(window.alert).toHaveBeenCalledWith("Enter your email first.");
  });
});