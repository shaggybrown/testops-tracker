'use client';

import { useEffortsStore } from '@/stores/useEffortsStore';
import { useAuditStore } from '@/stores/useAuditStore';
import { useTeamsStore } from '@/stores/useTeamsStore';
import { useTestTypesStore } from '@/stores/useTestTypesStore';
import { usePIsStore } from '@/stores/usePIsStore';
import { useSprintsStore } from '@/stores/useSprintsStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageHeader } from '@/components/Common';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { Edit2, History, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function EffortDetail() {
  const params = useParams();
  const effortId = params.id as string;

  const { efforts, fetchEfforts, updateEffort } = useEffortsStore();
  const { getEventsByEntity } = useAuditStore();
  const { teams } = useTeamsStore();
  const { testTypes } = useTestTypesStore();
  const { pis } = usePIsStore();
  const { sprints } = useSprintsStore();
  const { addToast } = useUiStore();

  const [editing, setEditing] = useState(false);
  const [effort, setEffort] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchEfforts();
    if (efforts.length === 0) return;
    
    const found = efforts.find((e) => e.id === effortId);
    setEffort(found);
    if (found) {
      setFormData({
        title: found.title,
        description: found.description || '',
        status: found.status,
        priority: found.priority,
        progress: found.progress || 0,
        estimate: found.estimate || 0,
        estimateUnit: found.estimateUnit || 'hours',
      });
    }
  }, [effortId]);

  const handleSave = () => {
    if (!effort) return;
    
    updateEffort(effortId, formData);
    addToast('Effort updated successfully');
    setEffort({ ...effort, ...formData });
    setEditing(false);
  };

  if (!effort) {
    return <div>Loading...</div>;
  }

  const pi = pis.find((p) => p.id === effort.piId);
  const sprint = sprints.find((s) => s.id === effort.sprintId);
  const team = teams.find((t) => t.id === effort.teamId);
  const testType = testTypes.find((tt) => tt.id === effort.testTypeDefinitionId);
  const auditEvents = getEventsByEntity('effort', effortId);

  return (
    <div>
      <PageHeader
        title={effort.title}
        description={`${sprint?.name || 'Unknown Sprint'} in ${pi?.name || 'Unknown PI'}`}
        action={
          <Button onClick={() => setEditing(!editing)} variant={editing ? 'default' : 'outline'} size="sm">
            <Edit2 className="h-4 w-4 mr-2" />
            {editing ? 'Editing' : 'Edit'}
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {editing ? (
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add description..."
                />
              ) : (
                <p className="text-muted-foreground">{effort.description || 'No description'}</p>
              )}
            </CardContent>
          </Card>

          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                {editing ? (
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['planned', 'in_progress', 'blocked', 'done', 'verified'].map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2">
                    <StatusBadge status={effort.status} />
                  </div>
                )}
              </div>

              <div>
                <Label>Priority</Label>
                {editing ? (
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['low', 'medium', 'high'].map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-2">
                    <PriorityBadge priority={effort.priority} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Effort Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Progress %</Label>
                  {editing ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-2 font-semibold">{effort.progress || 0}%</p>
                  )}
                </div>

                <div>
                  <Label>Estimate</Label>
                  {editing ? (
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="number"
                        value={formData.estimate}
                        onChange={(e) => setFormData({ ...formData, estimate: parseInt(e.target.value) })}
                        placeholder="0"
                      />
                      <Select value={formData.estimateUnit} onValueChange={(value) => setFormData({ ...formData, estimateUnit: value })}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">hrs</SelectItem>
                          <SelectItem value="points">pts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <p className="mt-2 font-semibold">
                      {effort.estimate || 0} {effort.estimateUnit === 'hours' ? 'hours' : 'points'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-4 w-4" />
                Activity Timeline
              </CardTitle>
              <CardDescription>Changes and updates to this effort</CardDescription>
            </CardHeader>
            <CardContent>
              {auditEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet</p>
              ) : (
                <div className="space-y-4">
                  {auditEvents.map((event) => (
                    <div key={event.id} className="border-l-2 border-primary pl-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold capitalize">{event.action}</p>
                          <p className="text-sm text-muted-foreground">{event.description || event.action}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</span>
                      </div>
                      {event.changes && Object.keys(event.changes).length > 0 && (
                        <div className="mt-2 space-y-1 text-xs">
                          {Object.entries(event.changes).map(([key, change]: [string, any]) => (
                            <p key={key} className="text-muted-foreground">
                              <span className="font-semibold">{key}:</span> {change.old} → {change.new}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Key Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">PI</p>
                <p className="font-semibold">{pi?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sprint</p>
                <p className="font-semibold">{sprint?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Team</p>
                <p className="font-semibold">{team?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Test Type</p>
                <p className="font-semibold">{testType?.name || 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Planned Start</p>
                <p className="font-semibold">{effort.plannedStartDate ? formatDate(effort.plannedStartDate) : '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Planned End</p>
                <p className="font-semibold">{effort.plannedEndDate ? formatDate(effort.plannedEndDate) : '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Blockers */}
          {effort.blockers && effort.blockers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Blockers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {effort.blockers.map((blocker: any) => (
                  <div key={blocker.id} className="border rounded p-2">
                    <p className="text-sm font-semibold">{blocker.title}</p>
                    <p className="text-xs text-muted-foreground">{blocker.description}</p>
                    <Badge className="mt-1 text-xs" variant={blocker.severity === 'high' ? 'destructive' : 'secondary'}>
                      {blocker.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Actions */}
      {editing && (
        <div className="fixed bottom-6 right-6 flex gap-2">
          <Button variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      )}
    </div>
  );
}
