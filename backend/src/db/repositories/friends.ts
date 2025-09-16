import { supabase } from '../supabase';


export const addFriend = async (userId: string, friendId: string): Promise<void> => {
    try {
        // Use a raw SQL query to check for existing requests
        const { data: existingRequests, error: fetchError } = await supabase
            .from('friend_requests')
            .select('*')
            .filter('sender_id', 'in', `(${userId},${friendId})`)
            .filter('receiver_id', 'in', `(${userId},${friendId})`);

        if (fetchError) { 
            throw new Error(`Failed to check existing friend request: ${fetchError.message}`);
        }
        
        // Manual filtering for the specific user pair
        const existingRequest = existingRequests?.find(request => 
            (request.sender_id === userId && request.receiver_id === friendId) ||
            (request.sender_id === friendId && request.receiver_id === userId)
        );

        if (existingRequest) {
            throw new Error('A friend request already exists between these users');
        }

        const { error } = await supabase
            .from('friend_requests')
            .insert([{
                sender_id: userId,
                receiver_id: friendId,
                status: 'pending'
            }]);

        if (error) {
            throw new Error(`Failed to send friend request: ${error.message}`);
        }
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Unknown error sending friend request');
    }
};

export const acceptFriendRequest = async (userId: string, friendId: string): Promise<void> => {
    try {
        const { error: updateError } = await supabase
            .from('friend_requests')
            .update({ status: 'accepted' })
            .eq('sender_id', friendId)
            .eq('receiver_id', userId)
            .eq('status', 'pending');

        if (updateError) {
            throw new Error(`Failed to accept friend request: ${updateError.message}`);
        }
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Unknown error accepting friend request');
    }
};

export const rejectFriendRequest = async (userId: string, friendId: string): Promise<void> => {
    try {
        const { error: updateError } = await supabase
            .from('friend_requests')
            .update({ status: 'rejected' })
            .eq('sender_id', friendId)
            .eq('receiver_id', userId)
            .eq('status', 'pending');

        if (updateError) {
            throw new Error(`Failed to reject friend request: ${updateError.message}`);
        }
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Unknown error rejecting friend request');
    }
};

export const getFriendRequests = async (userId: string, status?: string): Promise<any[]> => {
    try {
        let query = supabase
            .from('friend_requests')
            .select('*')
            .or(`(sender_id.eq.${userId}),(receiver_id.eq.${userId})`);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch friend requests: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Unknown error fetching friend requests');
    }
};

export const getFriendsList = async (userId: string): Promise<any[]> => {
    try {
        const { data, error } = await supabase
            .from('friends')
            .select('friend_id')
            .eq('user_id', userId);
        if (error) {
            throw new Error(`Failed to fetch friends list: ${error.message}`);
        }
        return data || [];
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Unknown error fetching friends list');
    }
};

export const removeFriend = async (userId: string, friendId: string): Promise<void> => {
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
        throw new Error(error instanceof Error ? error.message : "Unknown error removing friend");
    }
};
