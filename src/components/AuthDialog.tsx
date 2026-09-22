import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OWNER_ADMIN_EMAIL, OWNER_ADMIN_NAME, useStore } from "@/lib/store";

export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { signInAdmin, signUpAdmin } = useStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState(OWNER_ADMIN_NAME);
  const [email, setEmail] = useState(OWNER_ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setPassword("");
    setConfirm("");
    setMode("signin");
    setName(OWNER_ADMIN_NAME);
    setEmail(OWNER_ADMIN_EMAIL);
  }, [open]);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "signin") {
        const res = await signInAdmin(email, password);
        if (!res.ok) return setError(res.error);
        toast.success("Signed in as Administrator");
        onOpenChange(false);
        return;
      }
      if (password !== confirm) return setError("Passwords do not match.");
      const res = await signUpAdmin(name, email, password);
      if (!res.ok) return setError(res.error);
      toast.success("Administrator account created");
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  const signup = mode === "signup";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {signup ? "Create the administrator account" : "Administrator sign in"}
          </DialogTitle>
          <DialogDescription>
            {signup
              ? `Set up the owner account for ${OWNER_ADMIN_EMAIL}. This is a one-time step.`
              : "Enter your administrator details to unlock editing."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {signup ? (
            <div>
              <Label htmlFor="adm-name">Full name</Label>
              <Input id="adm-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          ) : null}
          <div>
            <Label htmlFor="adm-email">Email</Label>
            <Input
              id="adm-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="adm-pass">Password</Label>
            <Input
              id="adm-pass"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void submit()}
            />
          </div>
          {signup ? (
            <div>
              <Label htmlFor="adm-confirm">Confirm password</Label>
              <Input
                id="adm-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void submit()}
              />
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="button"
            className="justify-self-start text-xs font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setMode(signup ? "signin" : "signup");
              setError("");
            }}
          >
            {signup ? "Already have the account? Sign in" : "First time here? Create the owner account"}
          </button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={busy}>
            {signup ? "Create account" : "Sign in"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
