'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { useEffortsStore } from '@/stores/useEffortsStore';
import { PageHeader, EmptyState } from '@/components/Common';
import { Column, DataTable } from '@/components/DataTable';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { CheckSquare } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { formatDate } from '@/lib/utils';
import { TestEffort } from '@/types';

export default function MyWork() {
  const { user } = useAuthStore();
  const { efforts, fetchEfforts } = useEffortsStore();

  useEffect(() => {
    fetchEfforts();
  }, [fetchEfforts]);

  const myEfforts = useMemo(
    () =>
      efforts
        .filter((e) => e.assigneeId === user?.id)
        .sort((a, b) => {
          // Sort by due date (earliest first)
          if (!a.plannedEndDate) return 1;
          if (!b.plannedEndDate) return -1;
          return (
            new Date(a.plannedEndDate).getTime() -
            new Date(b.plannedEndDate).getTime()
          );
        }),
    [efforts, user?.id]
  );

  const columns: Column<TestEffort>[] = [
    { key: 'title' as const, label: 'Title', sortable: true },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value) => <StatusBadge status={value as TestEffort['status']} />,
    },
    {
      key: 'priority' as const,
      label: 'Priority',
      render: (value) => <PriorityBadge priority={value as TestEffort['priority']} />,
    },
    {
      key: 'plannedEndDate' as const,
      label: 'Due Date',
      render: (value) =>
        value ? formatDate(value as Date) : <span className="text-muted-foreground">-</span>,
    },
    {
      key: 'progress' as const,
      label: 'Progress',
      render: (value) => {
        const progress = typeof value === 'number' ? value : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs">{progress}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Work"
        description={`${myEfforts.length} effort${myEfforts.length !== 1 ? 's' : ''} assigned to you`}
      />

      {myEfforts.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No efforts assigned"
          description="You're all caught up! Check back soon for new work."
        />
      ) : (
        <DataTable columns={columns} data={myEfforts} />
      )}
    </div>
  );
}
