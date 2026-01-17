'use client';

import { useSprintsStore } from '@/stores/useSprintsStore';
import { useEffortsStore } from '@/stores/useEffortsStore';
import { useTestTypesStore } from '@/stores/useTestTypesStore';
import { PageHeader } from '@/components/Common';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, TrendingUp } from 'lucide-react';
import { useEffect } from 'react';
import { formatDate } from '@/lib/utils';

export default function Reports() {
  const { sprints, fetchSprints } = useSprintsStore();
  const { efforts, fetchEfforts } = useEffortsStore();
  const { testTypes, fetchTestTypes } = useTestTypesStore();

  useEffect(() => {
    fetchSprints();
    fetchEfforts();
    fetchTestTypes();
  }, [fetchSprints, fetchEfforts, fetchTestTypes]);

  const getSprintEfforts = (sprintId: string) => {
    return efforts.filter((e) => e.sprintId === sprintId);
  };

  const getTestTypeDistribution = (sprintId: string) => {
    const sprintEfforts = getSprintEfforts(sprintId);
    const distribution: Record<string, number> = {};
    testTypes.forEach((type) => {
      distribution[type.name] = sprintEfforts.filter((e) => e.testTypeDefinitionId === type.id).length;
    });
    return distribution;
  };

  const getSprintMetrics = (sprintId: string) => {
    const sprintEfforts = getSprintEfforts(sprintId);
    const completed = sprintEfforts.filter((e) => e.status === 'done').length;
    const inProgress = sprintEfforts.filter((e) => e.status === 'in_progress').length;
    const blocked = sprintEfforts.filter((e) => e.status === 'blocked').length;
    const planned = sprintEfforts.filter((e) => e.status === 'planned').length;

    return {
      total: sprintEfforts.length,
      completed,
      inProgress,
      blocked,
      planned,
      completionRate: sprintEfforts.length > 0 ? (completed / sprintEfforts.length) * 100 : 0,
      onTrack: inProgress + completed,
      atRisk: blocked,
    };
  };

  const exportToCSV = () => {
    const headers = ['Sprint', 'Effort Title', 'Status', 'Type', 'Priority', 'Team', 'Start Date', 'End Date', 'Progress %'];
    const rows = sprints.flatMap((sprint) =>
      getSprintEfforts(sprint.id).map((effort) => [
        sprint.name,
        effort.title,
        effort.status,
        testTypes.find((tt) => tt.id === effort.testTypeDefinitionId)?.name || 'Unknown',
        effort.priority,
        effort.teamId,
        effort.plannedStartDate ? formatDate(effort.plannedStartDate) : '',
        effort.plannedEndDate ? formatDate(effort.plannedEndDate) : '',
        `${effort.progress || 0}%`,
      ])
    );

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test-efforts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Sprint readiness and effort tracking analytics"
        action={
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-6">
        {sprints.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">No sprints available for reporting.</p>
            </CardContent>
          </Card>
        ) : (
          sprints.map((sprint) => {
            const metrics = getSprintMetrics(sprint.id);
            const distribution = getTestTypeDistribution(sprint.id);

            return (
              <Card key={sprint.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{sprint.name}</CardTitle>
                      <CardDescription>
                        {formatDate(sprint.startDate)} to {formatDate(sprint.endDate)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{metrics.total} efforts</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Metrics */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">COMPLETION RATE</p>
                      <p className="text-2xl font-bold mt-1">{metrics.completionRate.toFixed(0)}%</p>
                      <Progress value={metrics.completionRate} className="mt-2" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">ON TRACK</p>
                      <p className="text-2xl font-bold mt-1">{metrics.onTrack}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        In progress + completed
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">AT RISK</p>
                      <p className="text-2xl font-bold text-destructive mt-1">{metrics.atRisk}</p>
                      <p className="text-xs text-muted-foreground mt-2">Blocked efforts</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">REMAINING</p>
                      <p className="text-2xl font-bold mt-1">{metrics.planned}</p>
                      <p className="text-xs text-muted-foreground mt-2">Not started</p>
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Status Distribution</h4>
                    <div className="space-y-2">
                      {[
                        { status: 'done', label: 'Completed', color: 'bg-green-500', count: metrics.completed },
                        { status: 'in_progress', label: 'In Progress', color: 'bg-blue-500', count: metrics.inProgress },
                        { status: 'blocked', label: 'Blocked', color: 'bg-red-500', count: metrics.blocked },
                        { status: 'planned', label: 'Planned', color: 'bg-slate-400', count: metrics.planned },
                      ].map((item) => (
                        <div key={item.status} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span>{item.label}</span>
                          </div>
                          <span className="font-semibold">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Type Coverage */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Test Type Coverage</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(distribution).map(([type, count]) => (
                        <div key={type} className="border rounded-lg p-3 text-center">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">{type}</p>
                          <p className="text-2xl font-bold mt-1">{count}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {metrics.total > 0 ? ((count / metrics.total) * 100).toFixed(0) : 0}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Readiness Summary */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Sprint Readiness
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {metrics.completionRate >= 80
                        ? 'Sprint is on track for completion with solid progress.'
                        : metrics.completionRate >= 50
                          ? 'Sprint is progressing steadily. Monitor blocked items.'
                          : 'Sprint needs attention. Address blocked efforts urgently.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
