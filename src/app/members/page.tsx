'use client';

import { useMembersStore } from '@/stores/useMembersStore';
import { useTeamsStore } from '@/stores/useTeamsStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageHeader } from '@/components/Common';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MemberForm } from '@/components/Forms';
import { Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Members() {
  const { members, fetchMembers, isLoading, createMember, updateMember, deleteMember } =
    useMembersStore();
  const { teams, fetchTeams } = useTeamsStore();
  const { addToast } = useUiStore();
  const [editingMember, setEditingMember] = useState<any>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
    fetchTeams();
  }, []);

  const handleCreateMember = async (data: any) => {
    try {
      await createMember({
        ...data,
        workspaceId: '1',
        active: true,
      });
      addToast('Member added successfully', undefined, 'success');
    } catch (error) {
      addToast('Failed to add member', undefined, 'error');
    }
  };

  const handleUpdateMember = async (data: any) => {
    try {
      await updateMember(editingMember.id, data);
      setEditingMember(null);
      addToast('Member updated successfully', undefined, 'success');
    } catch (error) {
      addToast('Failed to update member', undefined, 'error');
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteMemberId) return;
    try {
      await deleteMember(deleteMemberId);
      setDeleteMemberId(null);
      addToast('Member deleted successfully', undefined, 'success');
    } catch (error) {
      addToast('Failed to delete member', undefined, 'error');
    }
  };

  const columns = [
    { key: 'name' as const, label: 'Name', sortable: true },
    { key: 'email' as const, label: 'Email', sortable: true },
    {
      key: 'roles' as const,
      label: 'Roles',
      render: (value: any) => (
        <div className="flex gap-1 flex-wrap">
          {value.map((role: string) => (
            <Badge key={role} variant="outline" className="text-xs">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'active' as const,
      label: 'Status',
      render: (value: any) => (
        <span className={value ? 'text-green-600' : 'text-muted-foreground'}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Members"
        description="Manage team members and roles"
        action={<MemberForm teams={teams} onSubmit={handleCreateMember} />}
      />

      <DataTable
        columns={columns}
        data={members}
        actions={(member) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingMember(member)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteMemberId(member.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      {editingMember && (
        <MemberForm
          member={editingMember}
          teams={teams}
          isOpen={true}
          onOpenChange={(open) => !open && setEditingMember(null)}
          onSubmit={handleUpdateMember}
        />
      )}

      <AlertDialog open={!!deleteMemberId} onOpenChange={(open) => !open && setDeleteMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Remove Member?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The member will be removed from all teams and assigned efforts.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember}>
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
