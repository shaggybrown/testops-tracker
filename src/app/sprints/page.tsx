'use client';

import { useSprintsStore } from '@/stores/useSprintsStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageHeader } from '@/components/Common';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';

export default function Sprints() {
  const { sprints, fetchSprints, createSprint, updateSprint, deleteSprint } =
    useSprintsStore();
  const { addToast } = useUiStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [editingSprint, setEditingSprint] = useState<any>(null);
  const [deleteSprintId, setDeleteSprintId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchSprints();
  }, []);

  const handleSubmit = async (e: React.FormEvent, isEdit = false) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        archived: false,
        workspaceId: '1',
        piId: editingSprint?.piId || '',
        sprintNumber: editingSprint?.sprintNumber || 0,
      };

      if (isEdit && editingSprint) {
        await updateSprint(editingSprint.id, data);
        addToast('Sprint updated successfully', undefined, 'success');
        setEditingSprint(null);
      } else {
        await createSprint(data);
        addToast('Sprint created successfully', undefined, 'success');
      }
      setFormData({ name: '', goal: '', startDate: '', endDate: '' });
      setOpenCreate(false);
    } catch (error) {
      addToast('Failed to save sprint', undefined, 'error');
    }
  };

  const handleEdit = (sprint: any) => {
    setEditingSprint(sprint);
    setFormData({
      name: sprint.name,
      goal: sprint.goal || '',
      startDate: sprint.startDate.toISOString().split('T')[0],
      endDate: sprint.endDate.toISOString().split('T')[0],
    });
    setOpenCreate(true);
  };

  const handleDeleteSprint = async () => {
    if (!deleteSprintId) return;
    try {
      await deleteSprint(deleteSprintId);
      setDeleteSprintId(null);
      addToast('Sprint deleted successfully', undefined, 'success');
    } catch (error) {
      addToast('Failed to delete sprint', undefined, 'error');
    }
  };

  const columns = [
    { key: 'name' as const, label: 'Sprint Name', sortable: true },
    {
      key: 'startDate' as const,
      label: 'Start Date',
      render: (value: any) => formatDate(value),
    },
    {
      key: 'endDate' as const,
      label: 'End Date',
      render: (value: any) => formatDate(value),
    },
    {
      key: 'goal' as const,
      label: 'Goal',
      render: (value: any) => (
        <span className="text-muted-foreground truncate">{value || '—'}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sprints"
        description="Plan and manage sprint iterations"
        action={
          <Sheet open={openCreate} onOpenChange={setOpenCreate}>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Sprint
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  {editingSprint ? 'Edit Sprint' : 'Create Sprint'}
                </SheetTitle>
                <SheetDescription>
                  {editingSprint ? 'Update sprint details' : 'Define sprint goals and dates'}
                </SheetDescription>
              </SheetHeader>
              <form
                onSubmit={(e) => handleSubmit(e, !!editingSprint)}
                className="space-y-6 mt-6"
              >
                <div>
                  <Label htmlFor="name">Sprint Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Sprint 1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="goal">Goal</Label>
                  <Textarea
                    id="goal"
                    value={formData.goal}
                    onChange={(e) =>
                      setFormData({ ...formData, goal: e.target.value })
                    }
                    placeholder="Sprint goals and objectives..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setOpenCreate(false);
                      setEditingSprint(null);
                      setFormData({
                        name: '',
                        goal: '',
                        startDate: '',
                        endDate: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSprint ? 'Update' : 'Create'} Sprint
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        }
      />

      <DataTable
        columns={columns}
        data={sprints}
        actions={(sprint) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(sprint)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteSprintId(sprint.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      <AlertDialog
        open={!!deleteSprintId}
        onOpenChange={(open) => !open && setDeleteSprintId(null)}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Delete Sprint?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete the sprint and all associated test efforts. This cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSprint}>
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
