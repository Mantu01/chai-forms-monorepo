import Link from "next/link";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface ProfileSubmissionsProps {
  submissions: {
    id: string;
    status: string | null;
    createdAt: string | Date | null;
  }[];
}

export function ProfileSubmissions({ submissions }: ProfileSubmissionsProps) {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/30">
            <TableHead className="text-muted-foreground text-[11px] font-bold py-2.5">Submission ID</TableHead>
            <TableHead className="text-muted-foreground text-[11px] font-bold py-2.5">Status</TableHead>
            <TableHead className="text-muted-foreground text-[11px] font-bold py-2.5">Date</TableHead>
            <TableHead className="text-muted-foreground text-[11px] font-bold py-2.5 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub) => (
            <TableRow key={sub.id} className="border-border hover:bg-muted/20">
              <TableCell className="font-mono text-2xs py-2 select-all text-foreground/90">
                {sub.id}
              </TableCell>
              <TableCell className="py-2">
                <Badge variant="secondary" className="capitalize text-[9px] px-1.5 py-0 h-4">
                  {sub.status || "Completed"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-2xs py-2">
                {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "N/A"}
              </TableCell>
              <TableCell className="py-2 text-right">
                <Button size="xs" variant="outline" asChild className="h-6 text-[10px] px-2 rounded-md">
                  <Link href={`/submissions/${sub.id}`}>
                    View Details
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
