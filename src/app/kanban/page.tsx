'use client';

import { useEffortsStore } from '@/stores/useEffortsStore';
import { useTeamsStore } from '@/stores/useTeamsStore';
import { useSprintsStore } from '@/stores/useSprintsStore';
import { useUiStore } from '@/stores/useUiStore';
import { useConfigStore } from '@/stores/useConfigStore';
import { PageHeader, EmptyState } from '@/components/Common';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { FilterBar } from '@/components/FilterBar';
import { Status, TestEffort } from '@/types';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface KanbanCardProps {
  effort: TestEffort;
  onStatusChange: (id: string, newStatus: Status) => void;
}

function KanbanCardItem({ effort, onStatusChange }: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={`cursor-grab p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm line-clamp-2 flex-1">
            {effort.title}
          </h4>
          <PriorityBadge priority={effort.priority} />
        </div>
        {effort.blockers && effort.blockers.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            {effort.blockers.length} blocker{effort.blockers.length > 1 ? 's' : ''}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{effort.progress}% complete</p>
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  status: Status;
  label: string;
  efforts: TestEffort[];
  onStatusChange: (id: string, newStatus: Status) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: Status) => void;
}

function KanbanColumn({
  status,
  label,
  efforts,
  onStatusChange,
  onDragOver,
  onDrop,
}: KanbanColumnProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
      className="flex-1 min-w-80 bg-muted/30 rounded-lg p-4 border border-border"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-sm">{label}</h3>
        <p className="text-xs text-muted-foreground">{efforts.length} efforts</p>
      </div>
      <div className="space-y-3 min-h-96">
        {efforts.map((effort) => (
          <KanbanCardItem
            key={effort.id}
            effort={effort}
            onStatusChange={onStatusChange}
          />
        ))}
        {efforts.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No efforts</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Kanban() {
  const { efforts, fetchEfforts, updateEffort, filters, setFilters, getFilteredEfforts } =
    useEffortsStore();
  const { teams, fetchTeams } = useTeamsStore();
  const { sprints, fetchSprints } = useSprintsStore();
  const { statuses } = useConfigStore();
  const { addToast } = useUiStore();
  const [draggedEffortId, setDraggedEffortId] = useState<string | null>(null);

  useEffect(() => {
    fetchEfforts();
    fetchTeams();
    fetchSprints();
  }, []);

  const filteredEfforts = getFilteredEfforts();

  const effortsByStatus: Record<Status, TestEffort[]> = {
    planned: [],
    in_progress: [],
    blocked: [],
    done: [],
    verified: [],
  };

  filteredEfforts.forEach((effort) => {
    if (effortsByStatus[effort.status]) {
      effortsByStatus[effort.status].push(effort);
    }
  });

  const handleStatusChange = async (effortId: string, newStatus: Status) => {
    try {
      await updateEffort(effortId, { status: newStatus });
      addToast('Status updated', undefined, 'success');
    } catch (error) {
      addToast('Failed to update status', undefined, 'error');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-primary');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-primary');
  };

  const handleDrop =
    (newStatus: Status) => (e: React.DragEvent) => {
      e.preventDefault();
      e.currentTarget.classList.remove('ring-2', 'ring-primary');
      const effortId = e.dataTransfer.getData('effortId');
      if (effortId && draggedEffortId) {
        handleStatusChange(draggedEffortId, newStatus);
        setDraggedEffortId(null);
      }
    };

  const filterOptions = [
    {
      key: 'sprintId',
      label: 'Sprint',
      options: sprints.map((s) => ({ value: s.id, label: s.name })),
      value: filters.sprintId,
      onChange: (value: string) =>
        setFilters({ sprintId: value || undefined }),
    },
    {
      key: 'teamId',
      label: 'Team',
      options: teams.map((t) => ({ value: t.id, label: t.name })),
      value: filters.teamId,
      onChange: (value: string) =>
        setFilters({ teamId: value || undefined }),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Kanban Board"
        description="Visualize and manage test efforts across status columns"
      />

      <FilterBar
        filters={filterOptions}
        onClearFilters={() =>
          setFilters({
            sprintId: undefined,
            teamId: undefined,
          })
        }
      />

      {filteredEfforts.length === 0 ? (
        <EmptyState
          title="No efforts to display"
          description="Create or filter efforts to see them on the Kanban board"
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(['planned', 'in_progress', 'blocked', 'done'] as Status[]).map(
            (status) => (
              <KanbanColumn
                key={status}
                status={status}
                label={
                  status === 'in_progress'
                    ? 'In Progress'
                    : status.charAt(0).toUpperCase() + status.slice(1)
                }
                efforts={effortsByStatus[status]}
                onStatusChange={handleStatusChange}
                onDragOver={handleDragOver}
                onDrop={handleDrop(status)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
