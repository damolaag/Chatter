import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PostCard } from "../components/PostCard";
import { TagPill } from "../components/TagPill";
import { CommentThread } from "../components/CommentThread";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";

describe("component tests", () => {
  it("renders PostCard with post details", () => {
    render(
      <BrowserRouter>
        <PostCard
          title="React Testing Guide"
          slug="react-testing-guide"
          readingTime={4}
          likesCount={3}
          commentsCount={2}
        />
      </BrowserRouter>
    );

    expect(screen.getByText("React Testing Guide")).toBeInTheDocument();
    expect(screen.getByText("4 min read")).toBeInTheDocument();
    expect(screen.getByText("3 likes · 2 comments")).toBeInTheDocument();
  });

  it("renders TagPill link", () => {
    render(
      <BrowserRouter>
        <TagPill name="React" slug="react" />
      </BrowserRouter>
    );

    expect(screen.getByText("#React")).toBeInTheDocument();
    expect(screen.getByText("#React")).toHaveAttribute("href", "/tags/react");
  });

  it("renders CommentThread with comments", () => {
    render(
      <CommentThread
        comments={[
          {
            id: "1",
            username: "dami",
            body: "Great post!",
            createdAt: "2026-06-07T10:00:00.000Z",
          },
        ]}
      />
    );

    expect(screen.getByText("Comments (1)")).toBeInTheDocument();
    expect(screen.getByText("dami")).toBeInTheDocument();
    expect(screen.getByText("Great post!")).toBeInTheDocument();
  });

  it("renders empty CommentThread state", () => {
    render(<CommentThread comments={[]} />);

    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("renders AnalyticsDashboard stats", () => {
    render(
      <AnalyticsDashboard
        totalPosts={6}
        totalLikes={2}
        totalComments={1}
        totalBookmarks={1}
        followers={0}
      />
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Total Posts")).toBeInTheDocument();
    expect(screen.getByText("Total Likes")).toBeInTheDocument();
    expect(screen.getByText("Total Comments")).toBeInTheDocument();
    expect(screen.getByText("Total Bookmarks")).toBeInTheDocument();
    expect(screen.getByText("Followers")).toBeInTheDocument();
  });
});