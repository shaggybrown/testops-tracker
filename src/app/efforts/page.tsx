'use client';

import { useEffortsStore } from '@/stores/useEffortsStore';
import { useTeamsStore } from '@/stores/useTeamsStore';
import { useSprintsStore } from '@/stores/useSprintsStore';
import { useMembersStore } from '@/stores/useMembersStore';
import { useTestTypesStore } from '@/stores/useTestTypesStore';
import { usePIsStore } from '@/stores/usePIsStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageHeader, EmptyState } from '@/components/Common';
import { Column, DataTable } from '@/components/DataTable';
import { FilterBar } from '@/components/FilterBar';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Zap, Plus, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { TestEffort } from '@/types';

type EffortFormData = {
  piId: string;
  sprintId: string;
  teamId: string;
  testTypeDefinitionId: string;
  title: string;
  description: string;
  status: 'planned' | 'in_progress' | 'blocked' | 'done' | 'verified';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  environmentIds: string[];
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  estimate?: number;
  estimateUnit?: 'hours' | 'points';
  progress?: number;
  tags?: string[];
};

export default function Efforts() {
  const { fetchEfforts, createEffort, updateEffort, deleteEffort, filters, setFilters, getFilteredEfforts } =
    useEffortsStore();
  const { teams, fetchTeams } = useTeamsStore();
  const { sprints, fetchSprints } = useSprintsStore();
  const { members, fetchMembers } = useMembersStore();
  const { testTypes, fetchTestTypes } = useTestTypesStore();
  const { pis, fetchPIs } = usePIsStore();
  const { addToast } = useUiStore();

  const [showSheet, setShowSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EffortFormData>({
    piId: '',
    sprintId: '',
    teamId: '',
    testTypeDefinitionId: '',
    title: '',
    description: '',
    status: 'planned',
    priority: 'medium',
    environmentIds: [],
    tags: [],
  });

  useEffect(() => {
    fetchEfforts();
    fetchTeams();
    fetchSprints();
    fetchMembers();
    fetchTestTypes();
    fetchPIs();
  }, [fetchEfforts, fetchTeams, fetchSprints, fetchMembers, fetchTestTypes, fetchPIs]);

  const filteredEfforts = getFilteredEfforts();

  const handleCreate = () => {
    setFormData({
      piId: '',
      sprintId: '',
      teamId: '',
      testTypeDefinitionId: '',
      title: '',
      description: '',
      status: 'planned',
      priority: 'medium',
      environmentIds: [],
      tags: [],
    });
    setEditingId(null);
    setShowSheet(true);
  };

  const handleEdit = (effort: TestEffort) => {
    setFormData({
      piId: effort.piId,
      sprintId: effort.sprintId,
      teamId: effort.teamId,
      testTypeDefinitionId: effort.testTypeDefinitionId,
      title: effort.title,
      description: effort.description || '',
      status: effort.status,
      priority: effort.priority,
      assigneeId: effort.assigneeId,
      environmentIds: effort.environmentIds,
      plannedStartDate: effort.plannedStartDate,
      plannedEndDate: effort.plannedEndDate,
      estimate: effort.estimate,
      estimateUnit: effort.estimateUnit,
      progress: effort.progress,
      tags: effort.tags || [],
    });
    setEditingId(effort.id);
    setShowSheet(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.piId || !formData.sprintId || !formData.teamId || !formData.testTypeDefinitionId || !formData.title) {
      addToast('Please fill all required fields');
      return;
    }

    if (editingId) {
      updateEffort(editingId, formData);
      addToast('Test effort updated successfully');
    } else {
      createEffort({
        workspaceId: 'ws-1',
        ...formData,
      });
      addToast('Test effort created successfully');
    }

    setShowSheet(false);
  };

  const handleDelete = (id: string) => {
    deleteEffort(id);
    setDeleteId(null);
    addToast('Test effort deleted successfully');
  };

  const getTestTypeName = (ttId: string) => testTypes.find((tt) => tt.id === ttId)?.name || ttId;

  const filterOptions = [
    {
      key: 'piId',
      label: 'PI',
      options: pis.map((p) => ({ value: p.id, label: p.name })),
      value: filters.piId,
      onChange: (value: string) => setFilters({ piId: value || undefined }),
    },
    {
      key: 'sprintId',
      label: 'Sprint',
      options: sprints.map((s) => ({ value: s.id, label: s.name })),
      value: filters.sprintId,
      onChange: (value: string) => setFilters({ sprintId: value || undefined }),
    },
    {
      key: 'teamId',
      label: 'Team',
      options: teams.map((t) => ({ value: t.id, label: t.name })),
      value: filters.teamId,
      onChange: (value: string) => setFilters({ teamId: value || undefined }),
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'planned', label: 'Planned' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'blocked', label: 'Blocked' },
        { value: 'done', label: 'Done' },
        { value: 'verified', label: 'Verified' },
      ],
      value: filters.status,
      onChange: (value: string) => setFilters({ status: value || undefined }),
    },
    {
      key: 'testTypeDefinitionId',
      label: 'Test Type',
      options: testTypes.map((tt) => ({ value: tt.id, label: tt.name })),
      value: filters.testTypeDefinitionId,
      onChange: (value: string) => setFilters({ testTypeDefinitionId: value || undefined }),
    },
  ];

  const columns: Column<TestEffort>[] = [
    {
      key: 'title' as const,
      label: 'Title',
      sortable: true,
      render: (_value: unknown, effort) => (
        <Link href={`/efforts/${effort.id}`} className="font-semibold hover:underline">
          {effort.title}
        </Link>
      ),
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (_value: unknown, effort) => <StatusBadge status={effort.status} />,
    },
    {
      key: 'priority' as const,
      label: 'Priority',
      render: (_value: unknown, effort) => <PriorityBadge priority={effort.priority} />,
    },
    {
      key: 'testTypeDefinitionId' as const,
      label: 'Type',
      render: (_value: unknown, effort) => (
        <span className="text-sm">{getTestTypeName(effort.testTypeDefinitionId)}</span>
      ),
    },
    {
      key: 'plannedEndDate' as const,
      label: 'Due Date',
      render: (_value: unknown, effort) =>
        effort.plannedEndDate ? formatDate(effort.plannedEndDate) : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'progress' as const,
      label: 'Progress',
      render: (_value: unknown, effort) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-muted rounded-full h-2">
            <div className="bg-primary h-full rounded-full" style={{ width: `${effort.progress || 0}%` }} />
          </div>
          <span className="text-xs">{effort.progress || 0}%</span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Test Efforts"
        description="Plan, track, and manage test activities"
        action={
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Effort
          </Button>
        }
      />

      <FilterBar
        filters={filterOptions}
        onSearch={(query) => setFilters({ search: query })}
        onClearFilters={() =>
          setFilters({
            piId: undefined,
            sprintId: undefined,
            teamId: undefined,
            status: undefined,
            testTypeDefinitionId: undefined,
            search: undefined,
          })
        }
      />

      {filteredEfforts.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No test efforts yet"
          description="Create a new effort to start planning your testing"
          action={
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Effort
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredEfforts}
          actions={(effort) => (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(effort)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeleteId(effort.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        />
      )}

      {/* Create/Edit Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent className="max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit Test Effort' : 'New Test Effort'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Row 1: PI and Sprint */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="piId">Program Increment *</Label>
                <Select value={formData.piId} onValueChange={(value) => setFormData({ ...formData, piId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PI" />
                  </SelectTrigger>
                  <SelectContent>
                    {pis.map((pi) => (
                      <SelectItem key={pi.id} value={pi.id}>
                        {pi.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sprintId">Sprint *</Label>
                <Select value={formData.sprintId} onValueChange={(value) => setFormData({ ...formData, sprintId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {sprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Team and Test Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="teamId">Team *</Label>
                <Select value={formData.teamId} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team" />
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
                <Label htmlFor="testTypeDefinitionId">Test Type *</Label>
                <Select
                  value={formData.testTypeDefinitionId}
                  onValueChange={(value) => setFormData({ ...formData, testTypeDefinitionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Test Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map((tt) => (
                      <SelectItem key={tt.id} value={tt.id}>
                        {tt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title and Description */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., API Regression Testing"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this testing effort"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Status, Priority, and Assignee */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value: EffortFormData['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value: EffortFormData['priority']) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assigneeId">Assignee</Label>
                <Select value={formData.assigneeId || ''} onValueChange={(value) => setFormData({ ...formData, assigneeId: value || undefined })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estimate and Progress */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimate">Estimate</Label>
                <Input
                  id="estimate"
                  type="number"
                  placeholder="e.g., 16"
                  value={formData.estimate || ''}
                  onChange={(e) => setFormData({ ...formData, estimate: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>

              <div>
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  placeholder="0-100"
                  value={formData.progress || ''}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value ? Number(e.target.value) : undefined })}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plannedStartDate">Planned Start Date</Label>
                <Input
                  id="plannedStartDate"
                  type="date"
                  value={formData.plannedStartDate ? new Date(formData.plannedStartDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value ? new Date(e.target.value) : undefined })}
                />
              </div>

              <div>
                <Label htmlFor="plannedEndDate">Planned End Date</Label>
                <Input
                  id="plannedEndDate"
                  type="date"
                  value={formData.plannedEndDate ? new Date(formData.plannedEndDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value ? new Date(e.target.value) : undefined })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              {editingId ? 'Update' : 'Create'} Test Effort
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Test Effort</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? This will delete the test effort and cannot be undone.
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
