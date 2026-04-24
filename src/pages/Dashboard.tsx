import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  Plus,
  Search,
  User,
  Clock,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { collection, query, where, onSnapshot, or } from 'firebase/firestore';
import { db } from '../lib/firebase';

import LearnMode from '../components/LearnMode';
import BuildMode from '../components/BuildMode';
import Messages from '../components/Messages';
import ProfileModal from '../components/ProfileModal';
import { seedSampleData } from '../lib/seedData';

export default function Dashboard() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<any>(null);
  const [joinedProjects, setJoinedProjects] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;

    // Joined Projects
    const qProjects = query(collection(db, 'projects'), where('team', 'array-contains', profile.uid));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJoinedProjects(projs);
    });

    // Pending Requests for projects I own
    const qRequests = query(
      collection(db, 'projectRequests'),
      where('ownerId', '==', profile.uid),
      where('status', '==', 'pending')
    );
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingRequests(reqs);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeRequests();
    };
  }, [profile]);

  const handleNavigateToMessages = (user?: any) => {
    if (user) setSelectedChatUser(user);
    setActiveTab('messages');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Plus size={18} />
            </div>
            BuildMate
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<BookOpen size={20} />} label="Learn Mode" active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} />
          <NavItem icon={<Users size={20} />} label="Build Mode" active={activeTab === 'build'} onClick={() => setActiveTab('build')} />
          <NavItem icon={<MessageSquare size={20} />} label="Messages" active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-bottom border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-900 capitalize">{activeTab}</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search skills or projects..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-black transition-all w-64"
              />
            </div>
            
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"
            >
              <User size={20} />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Welcome Card */}
              <div className="md:col-span-2 bg-black text-white p-8 rounded-[2rem] relative overflow-hidden">
                <div className="relative z-10">
                  <h1 className="text-4xl font-bold mb-2">Welcome back, {profile?.name?.split(' ')[0]}!</h1>
                  <p className="text-gray-400 mb-6 max-w-md">
                    {pendingRequests.length > 0 
                      ? `You have ${pendingRequests.length} project requests waiting for your review.`
                      : 'You have 3 upcoming skill sessions and no new project requests.'}
                  </p>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setActiveTab('learn')}
                      className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
                    >
                      View Schedule
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              </div>

              {/* Stats Card - Now showing Active Projects instead of Reputation */}
              <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-gray-500 font-medium mb-4 uppercase text-xs tracking-widest">Active Projects</h3>
                <div className="text-5xl font-bold mb-2">{joinedProjects.length}</div>
                <p className="text-blue-500 text-sm font-medium">Joined {joinedProjects.length} projects</p>
                <div className="mt-8 pt-8 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-sm text-gray-400">Level {Math.floor(joinedProjects.length / 2) + 1} Builder</span>
                </div>
              </div>

              <div className="md:col-span-3 mt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold">Your Projects</h3>
                  <button onClick={() => setActiveTab('build')} className="text-sm font-semibold text-gray-500 hover:text-black">View All</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedProjects.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-[2rem] border border-dashed border-gray-200 text-center">
                      <p className="text-gray-500">You haven't joined any projects yet.</p>
                      <button 
                        onClick={() => setActiveTab('build')}
                        className="mt-4 text-black font-bold hover:underline"
                      >
                        Explore Projects
                      </button>
                    </div>
                  ) : (
                    joinedProjects.map((project) => (
                      <div 
                        key={project.id} 
                        onClick={() => setActiveTab('build')}
                        className="bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                            <Users size={24} />
                          </div>
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-600">Build</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1">{project.title}</h4>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {project.team?.slice(0, 3).map((memberId: string, idx: number) => (
                              <div key={idx} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                                <User size={12} className="text-gray-400" />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {project.team?.length} members
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'learn' && <LearnMode onNavigateToMessages={handleNavigateToMessages} />}
          {activeTab === 'build' && <BuildMode />}
          {activeTab === 'messages' && <Messages initialUser={selectedChatUser} />}
        </div>

        {/* Activity Details Modal */}
        {selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-2">{selectedActivity.title}</h3>
              <p className="text-gray-500 mb-6">{selectedActivity.desc}</p>
              <div className="bg-gray-50 p-4 rounded-2xl mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold">{selectedActivity.user}</p>
                    <p className="text-xs text-gray-400">Participant</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedActivity(null)}
                className="w-full py-3 bg-black text-white rounded-xl font-bold"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}

        <ProfileModal 
          user={profile} 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
          onNavigateToMessages={handleNavigateToMessages}
        />
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-medium",
        active 
          ? "bg-black text-white shadow-lg shadow-black/10" 
          : "text-gray-500 hover:bg-gray-100 hover:text-black"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
