export type AnalyticsPost = {
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
};

export function calculateTotalLikes(posts: AnalyticsPost[]) {
  return posts.reduce((total, post) => total + post.likesCount, 0);
}

export function calculateTotalComments(posts: AnalyticsPost[]) {
  return posts.reduce((total, post) => total + post.commentsCount, 0);
}

export function calculateTotalBookmarks(posts: AnalyticsPost[]) {
  return posts.reduce((total, post) => total + post.bookmarksCount, 0);
}

export function calculateTotalEngagement(posts: AnalyticsPost[]) {
  return posts.reduce(
    (total, post) =>
      total + post.likesCount + post.commentsCount + post.bookmarksCount,
    0
  );
}