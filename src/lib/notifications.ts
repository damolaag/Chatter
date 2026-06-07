import { supabase } from "./supabase";

type NotificationType = "like" | "comment" | "follow";

export async function createNotification({
  userId,
  actorId,
  type,
  postId,
}: {
  userId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
}) {
  if (userId === actorId) return;

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    actor_id: actorId,
    post_id: postId ?? null,
    type,
    is_read: false,
  });

  if (error) {
    console.error("Create notification error:", error.message);
  }
}