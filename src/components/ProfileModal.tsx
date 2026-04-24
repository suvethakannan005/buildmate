import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Github, Linkedin, ExternalLink, Star, Briefcase, GraduationCap, User, Plus, Trash2, Save, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProfileModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMessages?: (user?: any) => void;
}

export default function ProfileModal({ user, isOpen, onClose, onNavigateToMessages }: ProfileModalProps) {
  const { profile: currentProfile } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedSkillsOffered, setEditedSkillsOffered] = React.useState<string[]>([]);
  const [editedSkillsWanted, setEditedSkillsWanted] = React.useState<string[]>([]);
  const [newOfferedSkill, setNewOfferedSkill] = React.useState('');
  const [newWantedSkill, setNewWantedSkill] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setEditedSkillsOffered(user.skillsOffered || []);
      setEditedSkillsWanted(user.skillsWanted || []);
    }
  }, [user]);

  if (!user) return null;

  const isOwnProfile = currentProfile?.uid === user.uid;

  const handleSave = async () => {
    if (!isOwnProfile) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        skillsOffered: editedSkillsOffered,
        skillsWanted: editedSkillsWanted
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (type: 'offered' | 'wanted') => {
    if (type === 'offered' && newOfferedSkill.trim()) {
      setEditedSkillsOffered([...editedSkillsOffered, newOfferedSkill.trim()]);
      setNewOfferedSkill('');
    } else if (type === 'wanted' && newWantedSkill.trim()) {
      setEditedSkillsWanted([...editedSkillsWanted, newWantedSkill.trim()]);
      setNewWantedSkill('');
    }
  };

  const removeSkill = (type: 'offered' | 'wanted', index: number) => {
    if (type === 'offered') {
      setEditedSkillsOffered(editedSkillsOffered.filter((_, i) => i !== index));
    } else {
      setEditedSkillsWanted(editedSkillsWanted.filter((_, i) => i !== index));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {/* Header/Cover */}
            <div className="h-12 bg-black relative">
              <button 
                onClick={onClose}
                className="absolute top-2 right-4 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-8 pb-8">
              {/* Profile Info */}
              <div className="relative -mt-6 mb-6 flex items-end justify-between flex-wrap gap-4">
                <div className="flex items-end gap-4">
                  <div className="w-16 h-16 bg-white p-1 rounded-2xl shadow-lg">
                    <div className="w-full h-full bg-black rounded-xl flex items-center justify-center text-white">
                      <User size={28} />
                    </div>
                  </div>
                  <div className="pb-0.5">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{user.name}</h2>
                    <p className="text-gray-500 text-xs font-medium capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="flex gap-2 pb-2">
                  {isOwnProfile && (
                    <button 
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      disabled={saving}
                      className="p-3 bg-black text-white rounded-2xl transition-all flex items-center gap-2 hover:bg-gray-800"
                    >
                      {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
                      <span className="text-sm font-bold">{isEditing ? (saving ? 'Saving...' : 'Save') : 'Edit'}</span>
                    </button>
                  )}
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noreferrer" className="p-3 bg-gray-100 hover:bg-black hover:text-white rounded-2xl transition-all">
                      <Github size={20} />
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noreferrer" className="p-3 bg-gray-100 hover:bg-black hover:text-white rounded-2xl transition-all">
                      <Linkedin size={20} />
                    </a>
                  )}
                </div>
              </div>

              {user.bio && (
                <div className="mb-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <p className="text-gray-700 leading-relaxed italic">
                    "{user.bio}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Skills */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2"><Star size={14} /> Skills Offered</span>
                    </h3>
                    
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={newOfferedSkill}
                            onChange={(e) => setNewOfferedSkill(e.target.value)}
                            placeholder="Add skill..."
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-black transition-all"
                            onKeyPress={(e) => e.key === 'Enter' && addSkill('offered')}
                          />
                          <button 
                            onClick={() => addSkill('offered')}
                            className="p-2 bg-black text-white rounded-xl"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {editedSkillsOffered.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center gap-2">
                              {skill}
                              <button onClick={() => removeSkill('offered', idx)} className="hover:text-red-500">
                                <Trash2 size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.skillsOffered?.map((skill: string) => (
                          <span key={skill} className="px-4 py-2 bg-green-50 text-green-700 text-sm font-bold rounded-2xl">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2"><GraduationCap size={14} /> Learning Interests</span>
                    </h3>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={newWantedSkill}
                            onChange={(e) => setNewWantedSkill(e.target.value)}
                            placeholder="Add skill..."
                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-black transition-all"
                            onKeyPress={(e) => e.key === 'Enter' && addSkill('wanted')}
                          />
                          <button 
                            onClick={() => addSkill('wanted')}
                            className="p-2 bg-black text-white rounded-xl"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {editedSkillsWanted.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex items-center gap-2">
                              {skill}
                              <button onClick={() => removeSkill('wanted', idx)} className="hover:text-red-500">
                                <Trash2 size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.skillsWanted?.map((skill: string) => (
                          <span key={skill} className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-2xl">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Portfolio/Projects */}
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                      <Briefcase size={14} /> Portfolio
                    </h3>
                    <div className="space-y-3">
                      {user.portfolio?.length > 0 ? (
                        user.portfolio.map((item: string, idx: number) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-all">
                            <span className="font-medium text-gray-700">{item}</span>
                            <ExternalLink size={16} className="text-gray-400 group-hover:text-black" />
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400 italic">No portfolio items added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <button 
                  onClick={() => {
                    onClose();
                    onNavigateToMessages?.(user);
                  }}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
                >
                  Send Message
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
