import { useEffect, useMemo, useState } from "react";
import api from "@/api/axios";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMinus, UserPlus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PendingRequestRow } from "@/components/golf/PendingRequest";

interface FriendListItem {
  friend_id: string;
  users: {
    id: string;
    user_name: string | null;
    first_name: string | null;
    last_name: string | null;
    profile_picture_url: string | null;
  } | null;
}

interface FriendRequestItem {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at?: string;
}

export const FriendsPage = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [friendUsernameInput, setFriendUsernameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pending, setPending] = useState<FriendRequestItem[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  const userId = user?.id;

  const displayName = (f: FriendListItem) => {
    const u = f.users;
    if (!u) return f.friend_id;
    const nameFromFirstLast = [u.first_name, u.last_name].filter(Boolean).join(" ");
    return nameFromFirstLast || u.user_name || u.id;
  };

  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const loadFriends = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get(`/friends/${userId}`);
      if (data.success) {
        setFriends(data.data || []);
      } else {
        setError("Failed to load friends");
      }
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to load friends");
      toast({ title: "Error", description: "Could not load friends.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, [userId]);

  const handleRemove = async (friendId: string) => {
    if (!userId) return;
    try {
      await api.delete(`/friends/${userId}/${friendId}`);
      toast({ title: "Removed", description: "Friend removed successfully." });
      loadFriends();
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.error || "Failed to remove friend", variant: "destructive" });
    }
  };

  const handleAddFriend = async () => {
    if (!userId) return;
    const trimmed = friendUsernameInput.trim();
    if (!trimmed) {
      toast({ title: "Missing username", description: "Enter a username to send a request.", variant: "destructive" });
      return;
    }
    console.log("trimmed: ", trimmed);
    try {
      setIsSubmitting(true);
      await api.post(`/friends/${userId}/by-username`, { friendUsername: trimmed });
      toast({ title: "Request sent", description: "Your friend request was sent." });
      setFriendUsernameInput("");
      setIsAddOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.error || "Failed to send friend request", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedFriends = useMemo(() => {
    return [...friends].sort((a, b) => displayName(a).localeCompare(displayName(b)));
  }, [friends]);

  const loadPendingRequests = async () => {
    if (!userId) return;
    try {
      setIsLoadingRequests(true);
      const { data } = await api.get(`/friends/${userId}/friend-requests`, { params: { status: 'pending' } });
      if (data.success) {
        const all: FriendRequestItem[] = data.data || [];
        const incoming = all.filter((r) => r.receiver_id === userId);
        setPending(incoming);
      }
    } catch (e) {
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleRespond = async (senderId: string, action: 'accept' | 'reject') => {
    if (!userId) return;
    try {
      await api.post(`/friends/${userId}/friend-requests/${senderId}`, { action });
      toast({ title: action === 'accept' ? 'Friend added' : 'Request declined' });
      await Promise.all([loadFriends(), loadPendingRequests()]);
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || 'Failed to update request', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-10 p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-300">Loading friends...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-10 p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadFriends}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-blue-100 dark:bg-blue-900/40 shadow-sm">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{sortedFriends.length}</div>
            <div className="text-sm text-blue-600 dark:text-blue-300">Total Friends</div>
          </div>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4" />
              Add Friend
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Friend</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">Enter your friend's username.</p>
              <Input
                placeholder="Friend username"
                value={friendUsernameInput}
                onChange={(e) => setFriendUsernameInput(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="destructive" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAddFriend} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Requests</h2>
          {isLoadingRequests && (
            <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
          )}
        </div>
        {pending.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl shadow-none">
            <CardContent className="py-6 text-center text-gray-500 dark:text-gray-300">
              <p>No pending friend requests.</p>
            </CardContent>
          </Card>
        ) : (
          pending.map((req) => (
            <PendingRequestRow key={req.id} request={req} onRespond={handleRespond} />
          ))
        )}
      </div>

      <div className="space-y-4">
        {sortedFriends.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl shadow-none">
            <CardContent className="py-12 text-center text-gray-500 dark:text-gray-300">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No friends yet. Connect with friends to compare rounds.</p>
            </CardContent>
          </Card>
        ) : (
          sortedFriends.map((f) => {
            const name = displayName(f);
            const profileUrl = f.users?.profile_picture_url;
            const username = f.users?.user_name;
            const id = f.users?.id || f.friend_id;

            return (
              <Card
                key={id}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 dark:bg-blue-500 dark:text-white">
                      {profileUrl ? (
                        <AvatarImage src={profileUrl} alt={name} />
                      ) : (
                        <AvatarFallback>{initials(name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{name}</p>
                      {username && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">@{username}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemove(id)}
                  >
                    <UserMinus className="h-4 w-4" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};