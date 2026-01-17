'use client';

import { usePIsStore } from '@/stores/usePIsStore';
import { useSprintsStore } from '@/stores/useSprintsStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageHeader, EmptyState } from '@/components/Common';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';

type PIFormData = {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
};

export default function PIs() {
  const { pis, fetchPIs, createPI, updatePI, deletePI } = usePIsStore();
  const { getSprintsByPI } = useSprintsStore();
  const { addToast } = useUiStore();

  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PIFormData>({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchPIs();
  }, []);

  const handleCreate = () => {
    setFormData({ name: '', goal: '', startDate: '', endDate: '' });
    setEditingId(null);
    setShowSheet(true);
  };

  const handleEdit = (pi: any) => {
    setFormData({
      name: pi.name,
      goal: pi.goal || '',
      startDate: pi.startDate.toISOString().split('T')[0],
      endDate: pi.endDate.toISOString().split('T')[0],
    });
    setEditingId(pi.id);
    setShowSheet(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      addToast('Please fill all required fields');
      return;
    }

    if (editingId) {
      updatePI(editingId, {
        name: formData.name,
        goal: formData.goal,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      });
      addToast('PI updated successfully');
    } else {
      createPI({
        workspaceId: 'ws-1',
        name: formData.name,
        goal: formData.goal,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        archived: false,
      });
      addToast('PI created successfully');
    }

    setShowSheet(false);
    setFormData({ name: '', goal: '', startDate: '', endDate: '' });
  };

  const handleDelete = (id: string) => {
    deletePI(id);
    setDeleteId(null);
    addToast('PI deleted successfully');
  };

  const columns = [
    {
      key: 'name',
      label: 'PI Name',
      render: (pi: any) => <span className="font-semibold">{pi.name}</span>,
    },
    {
      key: 'goal',
      label: 'Goal',
      render: (pi: any) => <span className="text-sm text-muted-foreground">{pi.goal || '-'}</span>,
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (pi: any) => (
        <span className="text-sm">
          {formatDate(pi.startDate)} → {formatDate(pi.endDate)}
        </span>
      ),
    },
    {
      key: 'sprints',
      label: 'Sprints',
      render: (pi: any) => {
        const sprints = getSprintsByPI(pi.id);
        return <span className="font-semibold">{sprints.length}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (pi: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(pi)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteId(pi.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Program Increments"
        description="Manage PIs and their associated sprints"
        action={
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New PI
          </Button>
        }
      />

      {pis.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No PIs"
          description="Create your first Program Increment to get started"
        />
      ) : (
        <div className="space-y-4">
          {pis.map((pi) => {
            const sprints = getSprintsByPI(pi.id);
            return (
              <Card key={pi.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pi.name}</CardTitle>
                      <CardDescription>{pi.goal}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(pi)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(pi.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-semibold">Start Date</p>
                      <p className="text-muted-foreground">{formatDate(pi.startDate)}</p>
                    </div>
                    <div>
                      <p className="font-semibold">End Date</p>
                      <p className="text-muted-foreground">{formatDate(pi.endDate)}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Sprints</p>
                      <p className="text-muted-foreground">{sprints.length} sprints</p>
                    </div>
                  </div>
                  {sprints.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="font-semibold text-sm mb-2">Sprints in this PI:</p>
                      <div className="space-y-1">
                        {sprints.map((sprint) => (
                          <div key={sprint.id} className="text-sm text-muted-foreground">
                            • {sprint.name} ({formatDate(sprint.startDate)} - {formatDate(sprint.endDate)})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit PI' : 'New PI'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">PI Name *</Label>
              <Input
                id="name"
                placeholder="e.g., PI 2026-01"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="goal">Goal</Label>
              <Textarea
                id="goal"
                placeholder="What is the goal of this PI?"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full">
              {editingId ? 'Update' : 'Create'} PI
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete PI</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? This will delete the PI and cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
