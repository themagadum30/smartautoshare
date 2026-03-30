import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Message, Profile } from '../../lib/supabase';
import { MessageSquare, ChevronRight, User } from 'lucide-react';
import ChatInterface from './ChatInterface';

type Conversation = {
  otherUserId: string;
  otherProfile: Profile | null;
  lastMessage: Message | null;
  unreadCount: number;
  rideId: string;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<{ userId: string; rideId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedChat) {
      loadConversations();
    }
  }, [user, selectedChat]);

  const loadConversations = async () => {
    if (!user) return;

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (messages) {
      const conversationMap = new Map<string, Message[]>();

      messages.forEach((message) => {
        const otherUserId =
          message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const key = `${otherUserId}_${message.ride_id}`;

        if (!conversationMap.has(key)) {
          conversationMap.set(key, []);
        }
        conversationMap.get(key)!.push(message);
      });

      const conversationList = await Promise.all(
        Array.from(conversationMap.entries()).map(async ([key, msgs]) => {
          const [otherUserId, rideId] = key.split('_');
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .maybeSingle();

          const unreadCount = msgs.filter(
            (m) => m.receiver_id === user.id && !m.read
          ).length;

          return {
            otherUserId,
            rideId,
            otherProfile: profile,
            lastMessage: msgs[0],
            unreadCount,
          };
        })
      );

      setConversations(conversationList);
    }

    setLoading(false);
  };

  if (selectedChat) {
    return (
      <ChatInterface
        otherUserId={selectedChat.userId}
        rideId={selectedChat.rideId}
        onBack={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Messages</h2>
              <p className="text-blue-100 mt-1">Chat with your co-passengers</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No conversations yet</p>
            <p className="text-sm text-gray-500">
              Start matching with riders to begin chatting
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <button
                key={`${conversation.otherUserId}_${conversation.rideId}`}
                onClick={() =>
                  setSelectedChat({
                    userId: conversation.otherUserId,
                    rideId: conversation.rideId,
                  })
                }
                className="w-full px-6 py-4 hover:bg-gray-50 transition-colors flex items-center gap-4 text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  {conversation.otherProfile ? (
                    <span className="font-bold text-lg">
                      {conversation.otherProfile.full_name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-gray-800">
                      {conversation.otherProfile?.full_name || 'Unknown User'}
                    </div>
                    {conversation.lastMessage && (
                      <div className="text-xs text-gray-500">
                        {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <div className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.content}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {conversation.unreadCount > 0 && (
                    <div className="bg-blue-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
