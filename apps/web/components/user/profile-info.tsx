import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";

interface ProfileInfoProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    profileImageUrl?: string | null;
  };
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3 flex flex-row items-center gap-4">
        <Avatar className="h-10 w-10">
          {user.profileImageUrl && <AvatarImage src={user.profileImageUrl} alt={user.fullName} />}
          <AvatarFallback className="text-xs bg-muted text-muted-foreground">{user.fullName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-sm font-bold leading-none">{user.fullName}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">{user.email}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3.5 text-xs">
        <div className="flex flex-col gap-1 border-t border-border/60 pt-3">
          <span className="font-semibold text-muted-foreground">User ID</span>
          <span className="font-mono text-2xs select-all break-all text-foreground bg-muted/30 px-2 py-1 rounded border border-border/50">{user.id}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="font-semibold text-muted-foreground">Verification status</span>
          <span className="text-2xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium border border-emerald-500/20">Verified Account</span>
        </div>
      </CardContent>
    </Card>
  );
}
