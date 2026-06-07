import { Link } from "react-router-dom";

type PostCardProps = {
  title: string;
  slug: string;
  readingTime: number;
  likesCount?: number;
  commentsCount?: number;
};

export function PostCard({
  title,
  slug,
  readingTime,
  likesCount = 0,
  commentsCount = 0,
}: PostCardProps) {
  return (
    <article>
      <Link to={`/posts/${slug}`}>
        <h2>{title}</h2>
      </Link>

      <p>{readingTime} min read</p>

      <p>
        {likesCount} {likesCount === 1 ? "like" : "likes"} · {commentsCount}{" "}
        {commentsCount === 1 ? "comment" : "comments"}
      </p>
    </article>
  );
}