import { supabase } from "../supabase";

export const addFriend = async (userId: string, friendId: string): Promise<void> => {
  try {
    const { data: existingRequests, error: fetchError } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`);


    if (fetchError) {
      console.error("Fetch error from Supabase:", fetchError);
      throw new Error(`Failed to check existing friend request: ${fetchError.message}`);
    }

    const { error: insertError } = await supabase
      .from('friend_requests')
      .insert([{
        sender_id: userId,
        receiver_id: friendId,
        status: 'pending'
      }]);

    if (insertError) {
      throw new Error(`Failed to send friend request: ${insertError.message}`);
    }
  } catch (error) {
    console.error("Caught error in addFriend:", error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error sending friend request');
  }
};


export const acceptFriendRequest = async (
  userId: string,
  friendId: string
): Promise<void> => {
  try {
    const { error: updateError } = await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("sender_id", friendId)
      .eq("receiver_id", userId)
      .eq("status", "pending");

    if (updateError) {
      throw new Error(
        `Failed to accept friend request: ${updateError.message}`
      );
    }
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error accepting friend request"
    );
  }
};

export const rejectFriendRequest = async (
  userId: string,
  friendId: string
): Promise<void> => {
  try {
    const { error: updateError } = await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("sender_id", friendId)
      .eq("receiver_id", userId)
      .eq("status", "pending");

    if (updateError) {
      throw new Error(
        `Failed to reject friend request: ${updateError.message}`
      );
    }
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error rejecting friend request"
    );
  }
};

export const getFriendRequests = async (
  userId: string,
  status?: string
): Promise<any[]> => {
  try {
    let query = supabase
      .from("friend_requests")
      .select("*")
      .or(`(sender_id.eq.${userId}),(receiver_id.eq.${userId})`);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch friend requests: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error fetching friend requests"
    );
  }
};

export const getFriendsList = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("friends")
      .select("friend_id")
      .eq("user_id", userId);
    if (error) {
      throw new Error(`Failed to fetch friends list: ${error.message}`);
    }
    return data || [];
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error fetching friends list"
    );
  }
};

export const removeFriend = async (
  userId: string,
  friendId: string
): Promise<void> => {
  try {
    const { error: deleteError } = await supabase
      .from("friends")
      .delete()
      .or(
        `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
      );

    if (deleteError) {
      throw new Error(`Failed to remove friend: ${deleteError.message}`);
    }
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Unknown error removing friend"
    );
  }
};
