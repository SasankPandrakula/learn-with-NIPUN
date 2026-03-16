import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2, User, Lock, Mail, Shield } from "lucide-react";

const Settings = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Whether user signed up with email (can change password) vs OAuth only
  const hasEmailProvider = true; // TODO: Replace with actual logic

  useEffect(() => {
    if (!user) return;
    // TODO: Replace with API calls to fetch data from MongoDB
    setFullName(user.fullName || "");
    setAvatarUrl(null);
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar must be under 2MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    // TODO: Replace with API calls to upload avatar
    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    // TODO: Replace with API calls to save profile
    setSavingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    // TODO: Replace with API calls to change password
    setChangingPassword(false);
  };

  const initials = fullName
    ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold mb-1">Profile Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">Manage your account and preferences</p>

      {/* Avatar & Profile */}
      <div className="rounded-2xl border border-border bg-card p-6 card-shadow mb-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg font-semibold">Profile</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="h-24 w-24 rounded-2xl overflow-hidden bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-background" />
              ) : (
                <Camera className="h-5 w-5 text-background" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Name + Email */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Role</label>
              <div className="flex items-center gap-2 rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground capitalize">
                <Shield className="h-4 w-4" />
                {role || "No role assigned"}
              </div>
            </div>
            <Button
              variant="hero"
              size="sm"
              onClick={handleSaveProfile}
              disabled={savingProfile}
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Password */}
      {hasEmailProvider && (
        <div className="rounded-2xl border border-border bg-card p-6 card-shadow">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-lg font-semibold">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" disabled={changingPassword}>
              {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        </div>
      )}

      {!hasEmailProvider && (
        <div className="rounded-2xl border border-border bg-card p-6 card-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-lg font-semibold">Password</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            You signed in with Google. Password management is handled by your Google account.
          </p>
        </div>
      )}
    </div>
  );
};

export default Settings;
