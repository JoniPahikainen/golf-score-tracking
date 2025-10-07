import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

interface FriendRequestItem {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: string;
    created_at?: string;
}

export const PendingRequestRow = ({ request, onRespond }: { request: FriendRequestItem; onRespond: (senderId: string, action: 'accept' | 'reject') => void }) => {
    const [userData, setUserData] = useState<{ name: string; profileUrl?: string }>({ name: request.sender_id });
    const [loading, setLoading] = useState<boolean>(true);
    const [username, setUsername] = useState<string>("");

    const initials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await api.get(`/users/${request.sender_id}`);
                if (data?.success && data.data) {
                    const nameFromUser = [data.data.first_name, data.data.last_name].filter(Boolean).join(" ") || data.data.user_name || request.sender_id;
                    setUserData({ name: data.data.userName, profileUrl: data.data.profile_picture_url || data.data.userName });
                } else {
                    setUserData({ name: request.sender_id });
                }
            } catch {
                setUserData({ name: request.sender_id });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [request.sender_id]);

    return (
        <Card className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800">
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 dark:bg-blue-500 dark:text-white">
                        {userData.profileUrl ? (
                            <AvatarImage src={userData.profileUrl} alt={userData.name} />
                        ) : (
                            <AvatarFallback>{initials(userData.name)}</AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{loading ? "..." : userData.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => onRespond(request.sender_id, "accept")}>Accept</Button>
                    <Button size="sm" variant="destructive" onClick={() => onRespond(request.sender_id, "reject")}>Decline</Button>
                </div>
            </CardContent>
        </Card>
    );
};
