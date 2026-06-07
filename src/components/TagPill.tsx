import { Link } from "react-router-dom";

type TagPillProps = {
  name: string;
  slug: string;
};

export function TagPill({ name, slug }: TagPillProps) {
  return <Link to={`/tags/${slug}`}>#{name}</Link>;
}