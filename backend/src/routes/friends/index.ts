import { Router } from 'express';
import { addFriend, acceptFriendRequest, rejectFriendRequest, getFriendRequests, getFriendsList, removeFriend } from '../../db';

const router = Router();

// Send a friend request
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { friendId } = req.body;
    if (!userId || !friendId) {
    return res.status(400).json({ success: false, error: 'User ID and Friend ID are required' });
    }
    try {
    await addFriend(userId, friendId);
    return res.json({ success: true, message: 'Friend request sent' });
    } catch (error) {
    console.error('Error sending friend request:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
    }

});
// Respond to a friend request (accept or reject)
router.post('/:userId/friend-requests/:friendId', async (req, res) => {
  const { userId, friendId } = req.params;
  const { action } = req.body;

  if (!userId || !friendId || !action) {
    return res.status(400).json({ success: false, error: 'User ID, Friend ID, and action are required' });
  }

  try {
    if (action === 'accept') {
      await acceptFriendRequest(userId, friendId);
      return res.json({ success: true, message: 'Friend request accepted' });
    } else if (action === 'reject') {
      await rejectFriendRequest(userId, friendId);
      return res.json({ success: true, message: 'Friend request rejected' });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error responding to friend request:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get all friend requests (incoming + outgoing)
router.get('/:userId/friend-requests', async (req, res) => {
  const { userId } = req.params;
  const { status } = req.query; // Optional: filter by status ('pending', 'accepted', 'rejected')   
    if (!userId) {
    return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    try {   
    const requests = await getFriendRequests(userId, status as string | undefined);
    return res.json({ success: true, data: requests });
    } catch (error) {
    console.error('Error fetching friend requests:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
    }

});

// Get current friends list
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
    if (!userId) {
    return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
    const friends = await getFriendsList(userId);
    return res.json({ success: true, data: friends });
    } catch (error) {
    console.error('Error fetching friends list:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Remove a friend
router.delete('/:userId/:friendId', async (req, res) => {
  const { userId, friendId } = req.params;

  if (!userId || !friendId) {
    return res.status(400).json({ success: false, error: 'User ID and Friend ID are required' });
  }

  try {
    await removeFriend(userId, friendId);
    return res.json({ success: true, message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
