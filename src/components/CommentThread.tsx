type Comment = {
  id: string;
  body: string;
  username: string;
  createdAt: string;
};

type CommentThreadProps = {
  comments: Comment[];
};

export function CommentThread({ comments }: CommentThreadProps) {
  if (comments.length === 0) {
    return <p>No comments yet.</p>;
  }

  return (
    <section>
      <h2>Comments ({comments.length})</h2>

      {comments.map((comment) => (
        <article key={comment.id}>
          <strong>{comment.username}</strong>
          <p>{comment.body}</p>
          <small>{new Date(comment.createdAt).toLocaleString()}</small>
        </article>
      ))}
    </section>
  );
}