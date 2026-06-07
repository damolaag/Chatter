type AnalyticsDashboardProps = {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
  followers: number;
};

export function AnalyticsDashboard({
  totalPosts,
  totalLikes,
  totalComments,
  totalBookmarks,
  followers,
}: AnalyticsDashboardProps) {
  return (
    <section>
      <h1>Dashboard</h1>

      <div>
        <h2>{totalPosts}</h2>
        <p>Total Posts</p>
      </div>

      <div>
        <h2>{totalLikes}</h2>
        <p>Total Likes</p>
      </div>

      <div>
        <h2>{totalComments}</h2>
        <p>Total Comments</p>
      </div>

      <div>
        <h2>{totalBookmarks}</h2>
        <p>Total Bookmarks</p>
      </div>

      <div>
        <h2>{followers}</h2>
        <p>Followers</p>
      </div>
    </section>
  );
}