export type TrendingInput = {
  likesCount: number;
  commentsCount: number;
  bookmarksCount: number;
};

export function calculateTrendingScore(post: TrendingInput) {
  return post.likesCount + post.commentsCount + post.bookmarksCount * 2;
}