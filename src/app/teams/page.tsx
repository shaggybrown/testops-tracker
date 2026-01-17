'use client';

import { useTeamsStore } from '@/stores/useTeamsStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageHeader } from '@/components/Common';
import { Column, DataTable } from '@/components/DataTable';
import { TeamForm } from '@/components/Forms';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Team } from '@/types';

export default function Teams() {
  const { teams, fetchTeams, createTeam, updateTeam, deleteTeam } =
    useTeamsStore();
  const { addToast } = useUiStore();
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleCreateTeam = async (data: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) => {
    try {
      await createTeam({ ...data, workspaceId: '1' });
      addToast('Team created successfully', undefined, 'success');
    } catch {
      addToast('Failed to create team', undefined, 'error');
    }
  };

  const handleUpdateTeam = async (data: Partial<Team>) => {
    if (!editingTeam) return;
    try {
      await updateTeam(editingTeam.id, data);
      setEditingTeam(null);
      addToast('Team updated successfully', undefined, 'success');
    } catch {
      addToast('Failed to update team', undefined, 'error');
    }
  };

  const handleDeleteTeam = async () => {
    if (!deleteTeamId) return;
    try {
      await deleteTeam(deleteTeamId);
      setDeleteTeamId(null);
      addToast('Team deleted successfully', undefined, 'success');
    } catch {
      addToast('Failed to delete team', undefined, 'error');
    }
  };

  const columns: Column<Team>[] = [
    { key: 'name' as const, label: 'Team Name', sortable: true },
    {
      key: 'description' as const,
      label: 'Description',
      render: (value) => {
        const description = typeof value === 'string' && value.trim() ? value : '-';
        return <span className="text-muted-foreground">{description}</span>;
      },
    },
    {
      key: 'archived' as const,
      label: 'Status',
      render: (value) => (
        <span className={value ? 'text-muted-foreground' : 'text-green-600'}>
          {value ? 'Archived' : 'Active'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Teams"
        description="Manage Scrum teams and configurations"
        action={<TeamForm onSubmit={handleCreateTeam} />}
      />

      <DataTable
        columns={columns}
        data={teams}
        actions={(team) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingTeam(team)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTeamId(team.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      {editingTeam && (
        <TeamForm
          team={editingTeam}
          isOpen={true}
          onOpenChange={(open) => !open && setEditingTeam(null)}
          onSubmit={handleUpdateTeam}
          trigger={null}
        />
      )}

      <AlertDialog open={!!deleteTeamId} onOpenChange={(open) => !open && setDeleteTeamId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Team?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the team and remove all associated data.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam}>
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
