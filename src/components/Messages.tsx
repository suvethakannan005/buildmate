import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Send, MoreVertical, Phone, Video, User } from 'lucide-react';
import { cn } from '../lib/utils';

const DUMMY_CHATS = [
  {
    id: '1',
    name: 'Anusha',
    lastMessage: 'Sure, let\'s meet at 10 AM tomorrow.',
    time: '2m ago',
    unread: 2,
    online: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anusha'
  },
  {
    id: '2',
    name: 'Suvetha',
    lastMessage: 'The design looks great! Can we add more icons?',
    time: '1h ago',
    unread: 0,
    online: false,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suvetha'
  },
  {
    id: '3',
    name: 'Yamuna',
    lastMessage: 'I\'ve updated the project roadmap.',
    time: '3h ago',
    unread: 0,
    online: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yamuna'
  },
  {
    id: '4',
    name: 'Thara',
    lastMessage: 'Can you help me with the React hooks?',
    time: '5h ago',
    unread: 0,
    online: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thara'
  }
];

const DUMMY_MESSAGES = [
  { id: 1, text: 'Hey Arun, are you free for the React session?', sender: 'me', time: '10:00 AM' },
  { id: 2, text: 'Hey! Yes, I am. What topics should we cover?', sender: 'them', time: '10:02 AM' },
  { id: 3, text: 'I want to learn about Custom Hooks and Performance optimization.', sender: 'me', time: '10:05 AM' },
  { id: 4, text: 'Perfect. Those are my favorite topics. Let\'s meet at 10 AM tomorrow.', sender: 'them', time: '10:07 AM' },
];

interface MessagesProps {
  initialUser?: any;
}

export default function Messages({ initialUser }: MessagesProps) {
  const [chats, setChats] = useState(DUMMY_CHATS);
  const [activeChat, setActiveChat] = useState<any>(DUMMY_CHATS[0]);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (initialUser) {
      const existingChat = chats.find(c => c.name === initialUser.name);
      if (existingChat) {
        setActiveChat(existingChat);
      } else {
        // Create a temporary chat for the new user
        const newChat = {
          id: initialUser.uid || Math.random().toString(),
          name: initialUser.name,
          lastMessage: 'Start a conversation...',
          time: 'Just now',
          unread: 0,
          online: true,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${initialUser.name}`
        };
        setChats([newChat, ...chats]);
        setActiveChat(newChat);
      }
    }
  }, [initialUser]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex h-[calc(100vh-12rem)]">
      {/* Chat List */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold mb-4">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={cn(
                "w-full p-4 flex gap-3 hover:bg-gray-50 transition-all text-left border-l-4",
                activeChat.id === chat.id ? "bg-gray-50 border-black" : "border-transparent"
              )}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white">
                  <User size={20} />
                </div>
                {chat.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm truncate">{chat.name}</h4>
                  <span className="text-[10px] text-gray-400 font-medium">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        {/* Chat Header */}
        <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white">
              <User size={18} />
            </div>
            <div>
              <h4 className="font-bold text-sm">{activeChat.name}</h4>
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all"><Phone size={20} /></button>
            <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all"><Video size={20} /></button>
            <button className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {DUMMY_MESSAGES.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.sender === 'me' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[70%] p-4 rounded-2xl text-sm shadow-sm",
                msg.sender === 'me' ? "bg-black text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none"
              )}>
                <p>{msg.text}</p>
                <span className={cn("text-[10px] mt-2 block", msg.sender === 'me' ? "text-gray-400" : "text-gray-400")}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-6 bg-white border-t border-gray-100">
          <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black transition-all"
            />
            <button className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
