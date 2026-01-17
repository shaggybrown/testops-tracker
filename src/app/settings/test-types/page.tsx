'use client';

import { useTestTypesStore } from '@/stores/useTestTypesStore';
import { useTeamsStore } from '@/stores/useTeamsStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageHeader, EmptyState } from '@/components/Common';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type TestTypeFormData = {
  name: string;
  description: string;
  ownerTeamId: string;
  participatingTeamIds: string[];
};

export default function TestTypesPage() {
  const { testTypes, fetchTestTypes, createTestType, updateTestType, deleteTestType } = useTestTypesStore();
  const { teams, fetchTeams } = useTeamsStore();
  const { addToast } = useUiStore();

  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestTypeFormData>({
    name: '',
    description: '',
    ownerTeamId: '',
    participatingTeamIds: [],
  });

  useEffect(() => {
    fetchTestTypes();
    fetchTeams();
  }, []);

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      ownerTeamId: '',
      participatingTeamIds: [],
    });
    setEditingId(null);
    setShowSheet(true);
  };

  const handleEdit = (tt: any) => {
    setFormData({
      name: tt.name,
      description: tt.description || '',
      ownerTeamId: tt.ownerTeamId,
      participatingTeamIds: tt.participatingTeamIds,
    });
    setEditingId(tt.id);
    setShowSheet(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ownerTeamId) {
      addToast('Please fill all required fields');
      return;
    }

    if (editingId) {
      updateTestType(editingId, formData);
      addToast('Test type updated successfully');
    } else {
      createTestType({
        workspaceId: 'ws-1',
        ...formData,
        active: true,
      });
      addToast('Test type created successfully');
    }

    setShowSheet(false);
  };

  const handleDelete = (id: string) => {
    deleteTestType(id);
    setDeleteId(null);
    addToast('Test type deleted successfully');
  };

  const toggleTeam = (teamId: string) => {
    setFormData((prev) => ({
      ...prev,
      participatingTeamIds: prev.participatingTeamIds.includes(teamId)
        ? prev.participatingTeamIds.filter((id) => id !== teamId)
        : [...prev.participatingTeamIds, teamId],
    }));
  };

  const getTeamName = (teamId: string) => {
    return teams.find((t) => t.id === teamId)?.name || teamId;
  };

  const columns: any[] = [
    {
      key: 'name',
      label: 'Test Type',
      render: (tt: any) => <span className="font-semibold">{tt.name}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (tt: any) => (
        <span className="text-sm text-muted-foreground">{tt.description || '-'}</span>
      ),
    },
    {
      key: 'owner',
      label: 'Owner Team',
      render: (tt: any) => <Badge variant="outline">{getTeamName(tt.ownerTeamId)}</Badge>,
    },
    {
      key: 'teams',
      label: 'Participating Teams',
      render: (tt: any) => (
        <div className="flex gap-1 flex-wrap">
          {tt.participatingTeamIds.length === 0 ? (
            <span className="text-xs text-muted-foreground">None</span>
          ) : (
            tt.participatingTeamIds.map((teamId: string) => (
              <Badge key={teamId} variant="secondary" className="text-xs">
                {getTeamName(teamId)}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (tt: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(tt)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(tt.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Test Types"
        description="Define and manage test types with team assignments"
        action={
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Test Type
          </Button>
        }
      />

      {testTypes.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No test types"
          description="Create your first test type definition"
        />
      ) : (
        <DataTable columns={columns} data={testTypes} />
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent className="max-w-md">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit Test Type' : 'New Test Type'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Test Type Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Performance Testing"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this type of testing"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="ownerTeam">Owner Team *</Label>
              <Select value={formData.ownerTeamId} onValueChange={(value) => setFormData({ ...formData, ownerTeamId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Participating Teams</Label>
              <div className="space-y-2 mt-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                {teams.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No teams available</p>
                ) : (
                  teams.map((team) => (
                    <label key={team.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.participatingTeamIds.includes(team.id)}
                        onChange={() => toggleTeam(team.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{team.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <Button type="submit" className="w-full">
              {editingId ? 'Update' : 'Create'} Test Type
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Test Type</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? This will delete the test type definition and cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
