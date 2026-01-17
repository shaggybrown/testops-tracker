'use client';

import { useMembersStore } from '@/stores/useMembersStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageHeader } from '@/components/Common';
import { Column, DataTable } from '@/components/DataTable';
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
import { Member } from '@/types';

export default function Members() {
  const { members, fetchMembers, createMember, updateMember, deleteMember } =
    useMembersStore();
  const { addToast } = useUiStore();
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleCreateMember = async (data: Pick<Member, 'name' | 'email' | 'roles' | 'teamIds'>) => {
    try {
      await createMember({
        ...data,
        workspaceId: '1',
        active: true,
      });
      addToast('Member added successfully', undefined, 'success');
    } catch {
      addToast('Failed to add member', undefined, 'error');
    }
  };

  const handleUpdateMember = async (data: Pick<Member, 'name' | 'email' | 'roles' | 'teamIds'>) => {
    if (!editingMember) return;
    try {
      await updateMember(editingMember.id, data);
      setEditingMember(null);
      addToast('Member updated successfully', undefined, 'success');
    } catch {
      addToast('Failed to update member', undefined, 'error');
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteMemberId) return;
    try {
      await deleteMember(deleteMemberId);
      setDeleteMemberId(null);
      addToast('Member deleted successfully', undefined, 'success');
    } catch {
      addToast('Failed to delete member', undefined, 'error');
    }
  };

  const columns: Column<Member>[] = [
    { key: 'name' as const, label: 'Name', sortable: true },
    { key: 'email' as const, label: 'Email', sortable: true },
    {
      key: 'roles' as const,
      label: 'Roles',
      render: (value) => (
        <div className="flex gap-1 flex-wrap">
          {(value as Member['roles']).map((role) => (
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
      render: (value) => (
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
        action={<MemberForm onSubmit={handleCreateMember} />}
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
