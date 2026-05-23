import React from "react";
import InvitationRow from "@/components/invitation/InvitationRow";
import type { Invitation } from "@/lib/api/types";

interface InvitationTableProps {
  invitations: Invitation[];
  isLoading?: boolean;
}

export default function InvitationTable({ invitations, isLoading }: InvitationTableProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-base font-semibold mb-4">Invitations</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground border-b">
            <th className="py-2 text-left">Email</th>
            <th className="py-2 text-left">Workspace</th>
            <th className="py-2 text-left">Role</th>
            <th className="py-2 text-left">Status</th>
            <th className="py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={5}>Loading...</td></tr>
          ) : invitations.length === 0 ? (
            <tr><td colSpan={5}>No invitations found.</td></tr>
          ) : (
            invitations.map((inv) => (
              <InvitationRow key={inv.id} invitation={inv} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
