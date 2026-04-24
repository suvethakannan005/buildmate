import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, where, doc, updateDoc, arrayUnion, deleteDoc, or } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Github, Globe, Users, Clock, CheckCircle2, X, Check, Bell } from 'lucide-react';
import ProjectModal from './ProjectModal';

export default function BuildMode() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    if (!profile?.uid) return;

    // Fetch Projects
    const qProjects = query(collection(db, 'projects'), where('visibility', '==', 'public'));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projs);
      setLoading(false);
    }, (error) => {
      console.error('BuildMode Projects Error:', error);
      setLoading(false);
    });

    // Fetch Requests (where user is owner or requester)
    const qRequests = query(
      collection(db, 'projectRequests'),
      or(
        where('ownerId', '==', profile.uid),
        where('userId', '==', profile.uid)
      )
    );
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(reqs);
    }, (error) => {
      console.error('BuildMode Requests Error:', error);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeRequests();
    };
  }, [profile]);

  const handleApply = async (project: any) => {
    if (!profile?.uid) return;
    setJoiningId(project.id);
    try {
      await addDoc(collection(db, 'projectRequests'), {
        projectId: project.id,
        projectTitle: project.title,
        userId: profile.uid,
        userName: profile.name,
        ownerId: project.ownerId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error applying to project:', error);
    } finally {
      setJoiningId(null);
    }
  };

  const handleAcceptRequest = async (request: any) => {
    try {
      // Add user to project team
      await updateDoc(doc(db, 'projects', request.projectId), {
        team: arrayUnion(request.userId)
      });
      // Delete the request
      await deleteDoc(doc(db, 'projectRequests', request.id));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'projectRequests', requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const pendingRequestsForMe = requests.filter(r => r.ownerId === profile?.uid && r.status === 'pending');
  const mySentRequests = requests.filter(r => r.userId === profile?.uid);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Hub</h2>
          <p className="text-gray-500">Join a team or start your own masterpiece.</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowRequests(!showRequests)}
            className="relative p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all"
          >
            <Bell size={24} />
            {pendingRequestsForMe.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingRequestsForMe.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
          >
            <Plus size={20} />
            Post Project
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showRequests && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-8">
              <h3 className="text-xl font-bold mb-6">Join Requests</h3>
              {pendingRequestsForMe.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No pending requests for your projects.</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequestsForMe.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div>
                        <p className="font-bold text-sm">{req.userName} <span className="font-normal text-gray-500">wants to join</span> {req.projectTitle}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Just now</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAcceptRequest(req)}
                          className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleRejectRequest(req.id)}
                          className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-[2rem]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-2 bg-white p-12 rounded-[2rem] border border-dashed border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Be the first to start a project and invite others to build with you.</p>
            </div>
          ) : (
            projects.map((project) => {
              const hasApplied = mySentRequests.some(r => r.projectId === project.id);
              const isMember = project.team?.includes(profile?.uid);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">
                        {project.domain || 'General'}
                      </span>
                      <h3 className="text-2xl font-bold">{project.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      {project.githubLink && <Github size={20} className="text-gray-400" />}
                      {project.liveUrl && <Globe size={20} className="text-gray-400" />}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-8 line-clamp-3 flex-1">{project.description}</p>

                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-3">Roles Needed</span>
                      <div className="flex flex-wrap gap-2">
                        {project.rolesNeeded?.map((role: string) => (
                          <span key={role} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{role}</span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-gray-400">+{project.team?.length || 0} members</span>
                      </div>
                      
                      {isMember ? (
                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl">
                          <CheckCircle2 size={18} />
                          Joined
                        </div>
                      ) : hasApplied ? (
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl">
                          <Clock size={18} />
                          Pending
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleApply(project)}
                          disabled={joiningId === project.id}
                          className="bg-black text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50"
                        >
                          {joiningId === project.id ? 'Applying...' : 'Apply to Join'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
