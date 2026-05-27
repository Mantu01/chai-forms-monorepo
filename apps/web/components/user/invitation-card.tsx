import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { IconMailOpened, IconCheck, IconX } from "@tabler/icons-react";

interface Invite {
  id: string;
  workspaceName: string;
  role: string;
  token: string;
}

interface InvitationCardProps {
  invite: Invite;
  onAccept: (token: string) => void;
  onReject: (inviteId: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export function InvitationCard({ invite, onAccept, onReject, isAccepting, isRejecting }: InvitationCardProps) {
  return (
    <Card className="bg-card border-border flex items-center justify-between p-4 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
          <IconMailOpened className="size-4" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h4 className="text-xs font-bold leading-tight">{invite.workspaceName}</h4>
          <span className="text-[10px] text-muted-foreground capitalize">Role: {invite.role}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="xs"
          onClick={() => onAccept(invite.token)}
          disabled={isAccepting || isRejecting}
          className="h-7 text-[10px] gap-1 px-2.5 rounded-lg"
        >
          <IconCheck className="size-3" />
          <span>Accept</span>
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => onReject(invite.id)}
          disabled={isAccepting || isRejecting}
          className="h-7 text-[10px] gap-1 px-2.5 rounded-lg text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30"
        >
          <IconX className="size-3" />
          <span>Reject</span>
        </Button>
      </div>
    </Card>
  );
}
