import { describe, expect, it } from "vitest";
import {
  calculateTotalBookmarks,
  calculateTotalComments,
  calculateTotalEngagement,
  calculateTotalLikes,
} from "../lib/analytics";
import { calculateTrendingScore } from "../lib/trending";
import {
  isValidEmail,
  isValidPassword,
  isValidPostTitle,
} from "../lib/validation";

describe("unit tests", () => {
  it("calculates total likes", () => {
    expect(
      calculateTotalLikes([
        { likesCount: 2, commentsCount: 1, bookmarksCount: 0 },
        { likesCount: 3, commentsCount: 2, bookmarksCount: 1 },
      ])
    ).toBe(5);
  });

  it("calculates total comments", () => {
    expect(
      calculateTotalComments([
        { likesCount: 2, commentsCount: 1, bookmarksCount: 0 },
        { likesCount: 3, commentsCount: 2, bookmarksCount: 1 },
      ])
    ).toBe(3);
  });

  it("calculates total bookmarks", () => {
    expect(
      calculateTotalBookmarks([
        { likesCount: 2, commentsCount: 1, bookmarksCount: 4 },
        { likesCount: 3, commentsCount: 2, bookmarksCount: 1 },
      ])
    ).toBe(5);
  });

  it("calculates total engagement", () => {
    expect(
      calculateTotalEngagement([
        { likesCount: 2, commentsCount: 1, bookmarksCount: 4 },
        { likesCount: 3, commentsCount: 2, bookmarksCount: 1 },
      ])
    ).toBe(13);
  });

  it("calculates trending score with weighted bookmarks", () => {
    expect(
      calculateTrendingScore({
        likesCount: 3,
        commentsCount: 2,
        bookmarksCount: 4,
      })
    ).toBe(13);
  });

  it("validates email, password, and post title", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("bad-email")).toBe(false);

    expect(isValidPassword("secret1")).toBe(true);
    expect(isValidPassword("123")).toBe(false);

    expect(isValidPostTitle("My post")).toBe(true);
    expect(isValidPostTitle("   ")).toBe(false);
  });
});