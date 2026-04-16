'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { ChatRoom, ChatMessage } from '@/lib/types';
import { Send, MessageSquare, Plus, Search, X, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface UserSearchResult {
  id: number;
  username: string;
  role: string;
  city: string;
}

// Normalise a WS message (raw) or REST message into ChatMessage shape
function normaliseMsg(raw: Record<string, unknown>, currentUserId: number): ChatMessage {
  // REST shape: { id, sender: {id, username,...}, content, created_at, is_read }
  // WS shape:  { id, sender: string, sender_id: number, content, created_at }
  if (raw.sender && typeof raw.sender === 'object') {
    return raw as unknown as ChatMessage;
  }
  return {
    id: raw.id as number,
    sender: {
      id: raw.sender_id as number,
      username: raw.sender as string,
    } as ChatMessage['sender'],
    content: raw.content as string,
    is_read: false,
    created_at: raw.created_at as string,
  };
}

function ChatPageInner() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [showNewChat, setShowNewChat] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Load rooms
  const loadRooms = () => {
    api.get('/chat/rooms/').then((res) => {
      setRooms(res.data.results || res.data);
    }).catch(() => {});
  };

  useEffect(() => {
    loadRooms();
    if (targetUserId) openChatWith(Number(targetUserId));
  }, [targetUserId]);

  // Search users
  useEffect(() => {
    if (!userSearch.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.get(`/auth/admin/users/?search=${encodeURIComponent(userSearch)}`);
        const all: UserSearchResult[] = res.data.results || res.data;
        // Exclude self
        setSearchResults(all.filter((u) => u.id !== user?.id).slice(0, 8));
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [userSearch, user?.id]);

  const openChatWith = async (userId: number) => {
    try {
      const res = await api.post('/chat/rooms/create_or_get/', { user_id: userId });
      const room: ChatRoom = res.data;
      setActiveRoom(room);
      setRooms((prev) => {
        const exists = prev.find((r) => r.id === room.id);
        return exists ? prev : [room, ...prev];
      });
      setShowNewChat(false);
      setUserSearch('');
    } catch { alert('Could not open chat.'); }
  };

  // Load messages + connect WS when room changes
  useEffect(() => {
    if (!activeRoom) return;

    // Close old socket
    if (wsRef.current) wsRef.current.close();

    // Fetch history
    api.get(`/chat/rooms/${activeRoom.id}/messages/`).then((res) => {
      const msgs = (res.data.results || res.data) as Record<string, unknown>[];
      setMessages(msgs.map((m) => normaliseMsg(m, user?.id ?? 0)));
    }).catch(() => setMessages([]));

    // WebSocket
    const token = localStorage.getItem('access_token');
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/chat/${activeRoom.id}/?token=${token}`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;
    setWsStatus('connecting');

    socket.onopen = () => setWsStatus('connected');
    socket.onclose = () => setWsStatus('disconnected');
    socket.onerror = () => setWsStatus('disconnected');

    socket.onmessage = (e) => {
      const raw = JSON.parse(e.data) as Record<string, unknown>;
      const msg = normaliseMsg(raw, user?.id ?? 0);
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    setWs(socket);
    return () => { socket.close(); };
  }, [activeRoom?.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ message: input }));
    } else {
      // Fallback: REST (no WS)
      api.post(`/chat/rooms/${activeRoom?.id}/messages/`, { content: input })
        .then((res) => setMessages((prev) => [...prev, res.data]))
        .catch(() => {});
    }
    setInput('');
  };

  const otherUser = (room: ChatRoom) => room.participants.find((p) => p.id !== user?.id);

  return (
    <div style={{ height: 'calc(100vh - 7rem)', display: 'flex', gap: 16 }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: 280, flexShrink: 0,
        background: '#fff', borderRadius: 16,
        border: '1.5px solid #ebebeb',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,.05)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 15 }}>Messages</h2>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: showNewChat ? '#e12454' : '#fde8ee',
                color: showNewChat ? '#fff' : '#e12454',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="New conversation"
            >
              {showNewChat ? <X size={15} /> : <Plus size={15} />}
            </button>
          </div>

          {/* New chat search */}
          {showNewChat && (
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input
                autoFocus
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users..."
                style={{
                  width: '100%', padding: '8px 10px 8px 30px',
                  border: '1.5px solid #ebebeb', borderRadius: 8,
                  fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif',
                }}
              />
              {searching && <Loader2 size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', animation: 'spin 1s linear infinite' }} />}
            </div>
          )}
        </div>

        {/* Search results */}
        {showNewChat && searchResults.length > 0 && (
          <div style={{ borderBottom: '1px solid #f0f0f0', maxHeight: 200, overflowY: 'auto' }}>
            {searchResults.map((u) => (
              <button key={u.id} onClick={() => openChatWith(u.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fde8ee')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#e12454,#8b0000)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>
                  {u.username[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{u.username}</div>
                  <div style={{ fontSize: 11, color: '#e12454', textTransform: 'capitalize' }}>{u.role}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {showNewChat && userSearch && searchResults.length === 0 && !searching && (
          <div style={{ padding: '12px 16px', fontSize: 12, color: '#aaa', borderBottom: '1px solid #f0f0f0' }}>
            No users found for &quot;{userSearch}&quot;
          </div>
        )}

        {/* Room list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {rooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#bbb' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: .4 }} />
              <p style={{ fontSize: 13 }}>No conversations yet</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Click + to start one</p>
            </div>
          ) : (
            rooms.map((room) => {
              const other = otherUser(room);
              const isActive = activeRoom?.id === room.id;
              return (
                <button key={room.id} onClick={() => setActiveRoom(room)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', background: isActive ? '#fde8ee' : 'none',
                  border: 'none', borderBottom: '1px solid #f9f9f9',
                  cursor: 'pointer', textAlign: 'left',
                  borderLeft: isActive ? '3px solid #e12454' : '3px solid transparent',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? 'linear-gradient(135deg,#e12454,#8b0000)' : '#fde8ee',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? '#fff' : '#e12454', fontWeight: 700, fontSize: 14,
                  }}>
                    {other?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {other?.username || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {room.last_message?.content || 'No messages yet'}
                    </div>
                  </div>
                  {room.unread_count > 0 && (
                    <span style={{
                      background: '#e12454', color: '#fff',
                      fontSize: 10, fontWeight: 700,
                      borderRadius: 50, width: 18, height: 18,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {room.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: 16,
        border: '1.5px solid #ebebeb',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,.05)',
      }}>
        {!activeRoom ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#ccc' }}>
            <MessageSquare size={52} style={{ opacity: .3 }} />
            <p style={{ fontSize: 15, color: '#bbb' }}>Select a conversation to start chatting</p>
            <button onClick={() => setShowNewChat(true)} style={{
              marginTop: 8, padding: '10px 24px', borderRadius: 50,
              background: '#e12454', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Start New Chat
            </button>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
              {(() => {
                const other = otherUser(activeRoom);
                return (
                  <>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#e12454,#8b0000)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 15,
                    }}>
                      {other?.username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 14 }}>{other?.username}</div>
                      <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: wsStatus === 'connected' ? '#22c55e' : wsStatus === 'connecting' ? '#f59e0b' : '#d1d5db',
                          display: 'inline-block',
                        }} />
                        <span style={{ color: wsStatus === 'connected' ? '#22c55e' : '#aaa' }}>
                          {wsStatus === 'connected' ? 'Connected' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                        </span>
                      </div>
                    </div>
                    {activeRoom.blood_request && (
                      <div style={{ fontSize: 11, background: '#fde8ee', color: '#e12454', padding: '4px 10px', borderRadius: 50, fontWeight: 600 }}>
                        Re: Blood Request #{activeRoom.blood_request}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#ccc', marginTop: 40, fontSize: 13 }}>
                  No messages yet. Say hello! 👋
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.sender?.id === user?.id;
                const showTime = idx === 0 || (new Date(msg.created_at).getTime() - new Date(messages[idx - 1].created_at).getTime()) > 5 * 60 * 1000;
                return (
                  <div key={msg.id ?? idx}>
                    {showTime && (
                      <div style={{ textAlign: 'center', fontSize: 11, color: '#ccc', margin: '8px 0' }}>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && (
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: '#fde8ee', color: '#e12454',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, marginRight: 8, alignSelf: 'flex-end',
                        }}>
                          {msg.sender?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div style={{
                        maxWidth: '65%',
                        padding: '10px 14px',
                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMe ? 'linear-gradient(135deg,#e12454,#c0183f)' : '#f4f4f5',
                        color: isMe ? '#fff' : '#1a1a2e',
                        fontSize: 14, lineHeight: 1.5,
                        boxShadow: isMe ? '0 2px 8px rgba(225,36,84,.25)' : '0 1px 4px rgba(0,0,0,.06)',
                      }}>
                        <p style={{ margin: 0 }}>{msg.content}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 10, opacity: .65, textAlign: 'right' }}>
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                style={{
                  flex: 1, padding: '11px 16px',
                  border: '1.5px solid #ebebeb', borderRadius: 50,
                  fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
                  transition: 'border-color .2s',
                }}
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                onFocus={(e) => (e.target.style.borderColor = '#e12454')}
                onBlur={(e) => (e.target.style.borderColor = '#ebebeb')}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: input.trim() ? 'linear-gradient(135deg,#e12454,#c0183f)' : '#f0f0f0',
                  color: input.trim() ? '#fff' : '#ccc',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .2s', flexShrink: 0,
                  boxShadow: input.trim() ? '0 4px 12px rgba(225,36,84,.3)' : 'none',
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#aaa' }}>Loading chat...</div>}>
      <ChatPageInner />
    </Suspense>
  );
}
