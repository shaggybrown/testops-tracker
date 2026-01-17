'use client';

import { useEffortsStore } from '@/stores/useEffortsStore';
import { useTeamsStore } from '@/stores/useTeamsStore';
import { useSprintsStore } from '@/stores/useSprintsStore';
import { useMembersStore } from '@/stores/useMembersStore';
import { useTestTypesStore } from '@/stores/useTestTypesStore';
import { usePIsStore } from '@/stores/usePIsStore';
import { PageHeader, EmptyState } from '@/components/Common';
import { DataTable } from '@/components/DataTable';
import { FilterBar } from '@/components/FilterBar';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { Button } from '@/components/ui/button';
import { Zap, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function Efforts() {
  const { efforts, fetchEfforts, filters, setFilters, getFilteredEfforts } =
    useEffortsStore();
  const { teams, fetchTeams } = useTeamsStore();
  const { sprints, fetchSprints } = useSprintsStore();
  const { members, fetchMembers } = useMembersStore();
  const { testTypes, fetchTestTypes } = useTestTypesStore();
  const { pis, fetchPIs } = usePIsStore();

  useEffect(() => {
    fetchEfforts();
    fetchTeams();
    fetchSprints();
    fetchMembers();
    fetchTestTypes();
    fetchPIs();
  }, []);

  const filteredEfforts = getFilteredEfforts();

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
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'planned', label: 'Planned' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'blocked', label: 'Blocked' },
        { value: 'done', label: 'Done' },
      ],
      value: filters.status,
      onChange: (value: string) =>
        setFilters({ status: value || undefined }),
    },
    {
      key: 'testTypeDefinitionId',
      label: 'Test Type',
      options: testTypes.map((tt) => ({
        value: tt.id,
        label: tt.name,
      })),
      value: filters.testTypeDefinitionId,
      onChange: (value: string) =>
        setFilters({ testTypeDefinitionId: value || undefined }),
    },
  ];

  const columns = [
    { key: 'title' as const, label: 'Title', sortable: true },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: any) => <StatusBadge status={value} />,
    },
    {
      key: 'priority' as const,
      label: 'Priority',
      render: (value: any) => <PriorityBadge priority={value} />,
    },
    {
      key: 'testTypeDefinitionId' as const,
      label: 'Type',
      render: (value: any, effort: any) => {
        const testType = testTypes.find((tt) => tt.id === effort.testTypeDefinitionId);
        return <span className="text-sm">{testType?.name || 'Unknown'}</span>;
      },
    },
    {
      key: 'plannedEndDate' as const,
      label: 'Due Date',
      render: (value: any) =>
        value ? formatDate(value) : <span className="text-muted-foreground">—</span>,
    },
    {
      key: 'progress' as const,
      label: 'Progress',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-muted rounded-full h-2">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-xs">{value}%</span>
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
          <Button className="gap-2">
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
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Effort
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={filteredEfforts} />
      )}
    </div>
  );
}
