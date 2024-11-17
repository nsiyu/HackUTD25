import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { FiEdit2, FiSave, FiX, FiArrowLeft, FiAward, FiBook, FiActivity, FiClock, FiTrendingUp } from 'react-icons/fi';

interface Profile {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  bio: string | null;
  total_notes: number;
  joined_date: string;
  achievements: Achievement[];
  stats: UserStats;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_date: string;
}

interface UserStats {
  total_words: number;
  total_edits: number;
  ai_interactions: number;
  streak_days: number;
  avg_words_per_note: number;
}

function Profile() {
  const navigate = useNavigate();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    username: null,
    full_name: null,
    avatar_url: null,
    updated_at: null,
    bio: null,
    total_notes: 0,
    joined_date: new Date().toISOString(),
    achievements: [],
    stats: {
      total_words: 0,
      total_edits: 0,
      ai_interactions: 0,
      streak_days: 0,
      avg_words_per_note: 0
    }
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      if (!session?.user) throw new Error('No user');

      setLoading(true);
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { 
        throw profileError;
      }

      // Fetch stats separately
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', session.user.id);

      if (profileData) {
        setProfile({
          ...profileData,
          stats: statsData || {
            total_words: 0,
            total_edits: 0,
            ai_interactions: 0,
            streak_days: 0,
            avg_words_per_note: 0
          },
          achievements: achievementsData || []
        });
        if (profileData.avatar_url) {
          setAvatarUrl(profileData.avatar_url);
        }
      } else {
        const defaultProfile = {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || null,
          full_name: null,
          avatar_url: null,
          updated_at: new Date().toISOString(),
          bio: null,
          total_notes: 0,
          joined_date: new Date().toISOString(),
          achievements: [],
          stats: {
            total_words: 0,
            total_edits: 0,
            ai_interactions: 0,
            streak_days: 0,
            avg_words_per_note: 0
          }
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([defaultProfile]);

        if (insertError) throw insertError;
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!session?.user) throw new Error('No user');

      setLoading(true);
      const updates = {
        id: session.user.id,
        username: profile?.username,
        full_name: profile?.full_name,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      if (avatar) {
        // Delete old avatar if it exists
        if (profile?.avatar_url) {
          const oldAvatarPath = profile.avatar_url.split('/').pop();
          if (oldAvatarPath) {
            await supabase.storage
              .from('avatars')
              .remove([`${session.user.id}/${oldAvatarPath}`]);
          }
        }

        // Upload new avatar
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatar, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update profile with new avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: data.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);

        if (updateError) throw updateError;
        setAvatarUrl(data.publicUrl);
      }

      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
    <div className="bg-white/50 dark:bg-dark-surface/50 p-4 rounded-xl border border-maya/10">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="text-maya" size={20} />
        <span className="text-sm font-medium text-jet/70 dark:text-dark-text/70">{label}</span>
      </div>
      <div className="text-2xl font-bold text-jet dark:text-dark-text">
        {value?.toLocaleString() || '0'}
      </div>
    </div>
  );

  const AchievementBadge = ({ achievement }: { achievement: Achievement }) => (
    <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-dark-surface/50 rounded-xl border border-maya/10">
      <div className="w-12 h-12 bg-maya/10 rounded-xl flex items-center justify-center">
        <FiAward className="text-maya" size={24} />
      </div>
      <div>
        <h3 className="font-medium text-jet dark:text-dark-text">{achievement.name}</h3>
        <p className="text-sm text-jet/70 dark:text-dark-text/70">{achievement.description}</p>
        <div className="text-xs text-jet/50 dark:text-dark-text/50 mt-1">
          Earned {new Date(achievement.earned_date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-jet">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-dark-bg flex flex-col">
      <nav className="h-[56px] border-b border-jet/5 dark:border-white/5 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm flex items-center">
        <div className="flex-1 flex items-center gap-6 px-4">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-maya/80 to-pink/80 rounded-lg flex items-center justify-center text-white">
              <FiArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-jet dark:text-dark-text">Profile</span>
          </button>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="mr-4 px-4 py-2 text-maya hover:text-maya/80 transition-colors flex items-center gap-2"
          >
            <FiEdit2 size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2 mr-4">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-pink hover:text-pink/80 transition-colors flex items-center gap-2"
            >
              <FiX size={16} /> Cancel
            </button>
            <button
              onClick={updateProfile}
              className="px-4 py-2 bg-gradient-to-r from-maya to-pink/80 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
            >
              <FiSave size={16} /> Save Changes
            </button>
          </div>
        )}
      </nav>

      <div className="flex-1 overflow-y-auto bg-white/90 dark:bg-dark-surface/90">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[300px,1fr] gap-8">
            <div className="space-y-6">
              <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl p-6 border border-jet/10 dark:border-white/10 shadow-sm">
                <div className="relative mb-6">
                  <img
                    src={avatarUrl || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-maya/20"
                  />
                  {editing && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-jet/70 dark:text-dark-text/70 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile?.username || ''}
                      onChange={(e) => setProfile({ ...profile!, username: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-dark-surface/50 rounded-xl border border-jet/10 dark:border-white/10 focus:outline-none focus:border-maya dark:focus:border-maya disabled:opacity-50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-jet/70 dark:text-dark-text/70 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile?.full_name || ''}
                      onChange={(e) => setProfile({ ...profile!, full_name: e.target.value })}
                      disabled={!editing}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-dark-surface/50 rounded-xl border border-jet/10 dark:border-white/10 focus:outline-none focus:border-maya dark:focus:border-maya disabled:opacity-50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-jet/70 dark:text-dark-text/70 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={profile?.bio || ''}
                      onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
                      disabled={!editing}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-dark-surface/50 rounded-xl border border-jet/10 dark:border-white/10 focus:outline-none focus:border-maya dark:focus:border-maya disabled:opacity-50 transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-maya/10">
                  <div className="flex items-center gap-2 text-jet/50 dark:text-dark-text/50">
                    <FiClock size={14} />
                    <span className="text-sm">
                      Joined {new Date(profile.joined_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard 
                  icon={FiBook} 
                  label="Total Notes" 
                  value={profile?.total_notes || 0} 
                />
                <StatCard 
                  icon={FiActivity} 
                  label="Total Words" 
                  value={profile?.stats?.total_words || 0} 
                />
                <StatCard 
                  icon={FiTrendingUp} 
                  label="Day Streak" 
                  value={profile?.stats?.streak_days || 0} 
                />
              </div>

              <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl p-6 border border-jet/10 dark:border-white/10 shadow-sm">
                <h2 className="text-xl font-bold text-jet dark:text-dark-text mb-4">Achievements</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {profile.achievements.map((achievement) => (
                    <AchievementBadge 
                      key={achievement.id} 
                      achievement={achievement} 
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-xl p-6 border border-jet/10 dark:border-white/10 shadow-sm">
                <h2 className="text-xl font-bold text-jet dark:text-dark-text mb-4">Activity</h2>
                <div className="h-64 bg-white/50 dark:bg-dark-surface/50 rounded-xl border border-jet/5 dark:border-white/5">
                  {/* Add your preferred charting library here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
