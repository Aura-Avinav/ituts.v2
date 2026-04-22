import { useRef, useState, useEffect } from 'react';
import { User, Loader2, Upload, Mail, LogOut, Trash2 } from 'lucide-react';
import { useStore } from '../../../hooks/useStore';
import { supabase } from '../../../lib/supabase';
import { Modal, Button } from '../../ui/Modal';


export function AccountSettings() {
    const { session, signOut, resetData } = useStore();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [originalDisplayName, setOriginalDisplayName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modals
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const email = session?.user?.email || 'guest@example.com';
    const userId = session?.user?.id;

    // Load Profile
    useEffect(() => {
        if (!userId) return;

        const getProfile = async () => {
            try {
                setLoading(true);

                // 1. Try to get display name from Auth Metadata first (Source of Truth for Display Name)
                const metaName = session?.user?.user_metadata?.full_name;

                // 2. Fetch Profile for Avatar (and fallback username)
                const { data, error } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', userId)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                // Prioritize metadata name -> profile username -> empty
                const finalName = metaName || data?.username || '';
                setDisplayName(finalName);
                setOriginalDisplayName(finalName);

                if (data?.avatar_url) {
                    // Check if it's a full URL (e.g. google auth) or a path
                    if (data.avatar_url.startsWith('http')) {
                        setAvatarUrl(data.avatar_url);
                    } else {
                        // Generate signed URL or public URL for storage path
                        const { data: publicUrlData } = supabase
                            .storage
                            .from('avatars')
                            .getPublicUrl(data.avatar_url);
                        setAvatarUrl(publicUrlData.publicUrl);
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        getProfile();
    }, [userId, session]); // Added session dep to react to metadata updates

    const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${userId}/${Math.random()}.${fileExt}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 2. Update Profile with path
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    avatar_url: filePath,
                    updated_at: new Date().toISOString(),
                });

            if (updateError) throw updateError;

            // 3. Update Local State
            const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(publicUrlData.publicUrl);

        } catch (error: any) {
            alert(`Error uploading avatar: ${error.message || 'Unknown error'}`);
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const updateProfile = async () => {
        try {
            setLoading(true);

            // Update Auth Metadata (No unique constraint on this)
            const { error } = await supabase.auth.updateUser({
                data: { full_name: displayName }
            });

            if (error) throw error;

            setOriginalDisplayName(displayName);
            // alert('Profile updated!'); // Removed alert per user preference for no external prompts, maybe add toast later?
        } catch (error: any) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setIsDeleting(true);
            if (!userId) return;

            // 1. Wipe Data
            await resetData();

            // 2. Delete Profile (ResetData doesn't do this yet)
            await supabase.from('profiles').delete().eq('id', userId);

            // 3. Sign Out
            await signOut();

            // 4. Close Modal (although we will likely be redirected)
            setIsDeleteOpen(false);

        } catch (e) {
            console.error("Delete failed", e);
        } finally {
            setIsDeleting(false);
        }
    };

    const hasChanges = displayName !== originalDisplayName;

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-2xl px-1">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">My Account</h2>
                <p className="text-sm text-secondary leading-relaxed">Manage your personal details and public profile.</p>
            </div>

            {/* Avatar Card */}
            <div className="flex items-center gap-6">
                <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full bg-surfaceHighlight overflow-hidden flex items-center justify-center text-3xl font-bold text-secondary transition-transform duration-300 group-hover:scale-[1.02]">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span>{email[0].toUpperCase()}</span>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-3 flex-1">
                    <div>
                        <div className="font-semibold text-foreground text-lg">{displayName || 'Your Profile'}</div>
                        <p className="text-xs text-secondary">Accepted file types: .png, .jpg, .jpeg</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="text-xs font-medium px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all shadow-sm flex items-center gap-2 active:scale-95"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {uploading ? 'Uploading...' : 'Upload New Photo'}
                        </button>
                        <button
                            className="text-xs font-medium px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors active:scale-95"
                            onClick={async () => {
                                if (!window.confirm("Remove profile photo?")) return;
                                await supabase.from('profiles').upsert({ id: userId, avatar_url: null, updated_at: new Date().toISOString() });
                                setAvatarUrl(null);
                            }}
                        >
                            Remove
                        </button>
                    </div>
                    <input
                        type="file"
                        id="avatar"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleUploadAvatar}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Details Card */}
            <div className="space-y-6">
                <div className="space-y-1">
                    <h3 className="text-base font-medium text-foreground flex items-center gap-2">
                        Profile Information
                    </h3>
                    <p className="text-xs text-secondary">Update your account details here.</p>
                </div>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-secondary">Email Address</label>
                        <div className="flex items-center gap-3 p-3 bg-transparent rounded-lg text-sm text-foreground/80 cursor-not-allowed select-none border-b border-border/5">
                            <Mail className="w-4 h-4 text-secondary" />
                            {email}
                        </div>
                        <p className="text-[10px] text-secondary/70">Email cannot be changed directly.</p>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-secondary">Display Name</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your display name"
                                autoComplete="off"
                                className="w-full pl-10 p-3 bg-transparent hover:bg-surfaceHighlight/30 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-secondary/40"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            onClick={updateProfile}
                            disabled={loading || !hasChanges}
                            className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-all shadow-sm active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {hasChanges ? 'Save Changes' : 'Saved'}
                        </button>
                        {hasChanges && (
                            <button
                                onClick={() => setDisplayName(originalDisplayName)}
                                disabled={loading}
                                className="px-5 py-2.5 bg-transparent text-secondary hover:text-foreground text-sm font-medium rounded-lg transition-colors hover:bg-surfaceHighlight/50 active:scale-95 fade-in animate-in slide-in-from-left-2 duration-200"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Account Actions (Log Out / Delete) */}
            <div className="space-y-4 p-5 rounded-xl border border-red-500/20 bg-red-500/5">
                <div className="space-y-1">
                    <h3 className="text-base font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                        Danger Zone
                    </h3>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => setIsLogoutOpen(true)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-500/10 transition-all group border border-transparent hover:border-red-200/20"
                    >
                        <div className="text-left">
                            <div className="text-sm font-medium text-foreground flex items-center gap-2">
                                <LogOut className="w-4 h-4 text-secondary group-hover:text-red-500 transition-colors" />
                                Log Out
                            </div>
                            <p className="text-[10px] text-secondary">Sign out of your account on this device.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setIsDeleteOpen(true)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-500/20 transition-all group border border-transparent hover:border-red-500/20"
                    >
                        <div className="text-left">
                            <div className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                                Delete Account
                            </div>
                            <p className="text-[10px] text-red-500/70">Permanently remove your account and all data.</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Logout Modal */}
            <Modal
                isOpen={isLogoutOpen}
                onClose={() => setIsLogoutOpen(false)}
                title="Log Out?"
            >
                <div className="space-y-6">
                    <p className="text-secondary">
                        Are you sure you want to sign out? Your data will remain safely stored.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsLogoutOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={() => { signOut(); setIsLogoutOpen(false); }}>Log Out</Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title="Delete Account?"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-500 text-sm font-medium flex items-start gap-2">
                            <Trash2 className="w-4 h-4 shrink-0 mt-0.5" />
                            Warning: This action is permanent.
                        </p>
                    </div>
                    <p className="text-secondary text-sm leading-relaxed">
                        This will <span className="text-foreground font-bold">permanently delete</span> your account, habits, journal entries, and achievements.
                        <br /><br />
                        This action <u>cannot</u> be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
