import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, UserPlus, Star, ArrowRight, Check, User, X } from 'lucide-react';
import ProfileModal from './ProfileModal';
import { cn } from '../lib/utils';

const COMMON_SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 
  'Figma', 'UI Design', 'UX Design', 'Tailwind CSS', 'Next.js',
  'Firebase', 'MongoDB', 'SQL', 'Data Science', 'Machine Learning',
  'Product Management', 'Marketing', 'SEO', 'Copywriting'
];

interface LearnModeProps {
  onNavigateToMessages?: (user?: any) => void;
}

export default function LearnMode({ onNavigateToMessages }: LearnModeProps) {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [swapUser, setSwapUser] = useState<any>(null);

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const suggestions = COMMON_SKILLS.filter(s => 
    s.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm !== ''
  ).slice(0, 5);

  useEffect(() => {
    if (!profile?.uid) return;

    // Simple matching: find users who offer what I want OR want what I offer
    // For now, we'll just list all users except current
    const q = query(collection(db, 'users'), where('uid', '!=', profile.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatches(users);
      setLoading(false);
    }, (error) => {
      console.error('LearnMode Snapshot Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const filteredMatches = matches.filter(m => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Check if the searched term is in the skills they offer (Ready to Teach)
    const skillMatch = m.skillsOffered?.some((s: string) => s.toLowerCase().includes(searchLower));
    
    // Also allow searching by name, but prioritize skill matches
    const nameMatch = m.name.toLowerCase().includes(searchLower);
    
    return skillMatch || nameMatch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Skill Exchange</h2>
          <p className="text-gray-500">Find someone to teach you something new today.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search skills (e.g. React, Figma)..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black transition-all"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setSearchTerm(s);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm font-medium flex items-center justify-between group"
                >
                  {s}
                  <Check size={14} className="text-black opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-[2rem]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleUserClick(match)}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-sm">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{match.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">{match.role}</p>
                  </div>
                </div>
                {searchTerm && match.skillsOffered?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase())) && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider animate-pulse">
                      Teacher Found
                    </div>
                    <span className="text-[10px] text-green-600 font-bold">Available for {searchTerm}</span>
                  </div>
                )}
              </div>

              {match.bio && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-6 italic">
                  "{match.bio}"
                </p>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Ready to Teach</span>
                  <div className="flex flex-wrap gap-2">
                    {match.skillsOffered?.map((skill: string) => (
                      <span key={skill} className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full transition-all",
                        searchTerm && skill.toLowerCase().includes(searchTerm.toLowerCase())
                          ? "bg-black text-white scale-110 shadow-lg"
                          : "bg-green-50 text-green-700"
                      )}>
                        {skill}
                      </span>
                    )) || <span className="text-xs text-gray-400 italic">No skills listed</span>}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Wants to Learn</span>
                  <div className="flex flex-wrap gap-2">
                    {match.skillsWanted?.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full">{skill}</span>
                    )) || <span className="text-xs text-gray-400 italic">No skills listed</span>}
                  </div>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSwapUser(match);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 text-black py-3 rounded-xl font-bold group-hover:bg-black group-hover:text-white transition-all"
              >
                Send Swap Request
                <ArrowRight size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <ProfileModal 
        user={selectedUser} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onNavigateToMessages={onNavigateToMessages}
      />

      {/* Swap Request Modal */}
      <AnimatePresence>
        {swapUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Send Swap Request</h3>
                <button onClick={() => setSwapUser(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-[2rem] mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold">{swapUser.name}</p>
                    <p className="text-xs text-gray-500">{swapUser.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  You are about to send a skill swap request to <strong>{swapUser.name}</strong>. 
                  You can start a conversation to discuss the details.
                </p>
              </div>

              <button 
                onClick={() => {
                  onNavigateToMessages?.(swapUser);
                  setSwapUser(null);
                }}
                className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
              >
                Send Message
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
