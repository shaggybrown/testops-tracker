'use client';

import { useEnvironmentsStore } from '@/stores/useEnvironmentsStore';
import { useMembersStore } from '@/stores/useMembersStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageHeader, EmptyState } from '@/components/Common';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HealthBadge } from '@/components/Badges';
import { Plus, AlertCircle, Link2, PlugZap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Environment } from '@/types';

type ReservationFormData = {
  memberId: string;
  startDate: string;
  endDate: string;
  notes: string;
};

export default function Environments() {
  const {
    environments,
    connections,
    fetchEnvironments,
    fetchConnections,
    fetchReservations,
    reservations,
    createConnection,
    createReservation,
    checkReservationConflict,
  } = useEnvironmentsStore();
  const { members, fetchMembers } = useMembersStore();
  const { addToast } = useUiStore();

  const [showSheet, setShowSheet] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);
  const [draggingEnvId, setDraggingEnvId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReservationFormData>({
    memberId: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [hasConflict, setHasConflict] = useState(false);

  useEffect(() => {
    fetchEnvironments();
    fetchConnections();
    fetchReservations();
    fetchMembers();
  }, [fetchEnvironments, fetchConnections, fetchReservations, fetchMembers]);

  const handleCreateReservation = (envId: string) => {
    setSelectedEnv(envId);
    setFormData({
      memberId: '',
      startDate: '',
      endDate: '',
      notes: '',
    });
    setHasConflict(false);
    setShowSheet(true);
  };

  const handleCheckConflict = () => {
    if (!selectedEnv || !formData.startDate || !formData.endDate) {
      setHasConflict(false);
      return;
    }

    const conflict = checkReservationConflict(selectedEnv, new Date(formData.startDate), new Date(formData.endDate));
    setHasConflict(conflict);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasConflict) {
      addToast('Conflict: Another reservation exists in this time period');
      return;
    }

    if (!formData.memberId || !formData.startDate || !formData.endDate) {
      addToast('Please fill all required fields');
      return;
    }

    createReservation({
      workspaceId: 'ws-1',
      environmentId: selectedEnv!,
      memberId: formData.memberId,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      notes: formData.notes,
    });

    addToast('Reservation created successfully');

    setShowSheet(false);
  };

  const handleConnect = (fromId: string | null, toId: string) => {
    if (!fromId || fromId === toId) return;
    createConnection(fromId, toId);
    addToast('Integration link created');
    setDraggingEnvId(null);
    setDropTargetId(null);
  };

  const getEnvReservations = (envId: string) => {
    return reservations.filter((r) => r.environmentId === envId);
  };

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || 'Unknown';
  };

  const groupedEnvironments = useMemo(() => {
    const groups: Record<string, { label: string; environments: Environment[] }> = {};
    environments.forEach((env) => {
      const label =
        env.location === 'aws'
          ? `${env.awsAccountName || 'AWS Account'}${env.awsRegion ? ` (${env.awsRegion})` : ''}`
          : 'On-Premise';
      if (!groups[label]) {
        groups[label] = { label, environments: [] };
      }
      groups[label].environments.push(env);
    });
    return Object.values(groups);
  }, [environments]);

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const columnCount = Math.max(groupedEnvironments.length, 1);
    groupedEnvironments.forEach((group, columnIndex) => {
      const rowCount = Math.max(group.environments.length, 1);
      group.environments.forEach((env, rowIndex) => {
        const x = ((columnIndex + 0.5) / columnCount) * 100;
        const ySpacing = 70 / (rowCount + 1);
        const y = 15 + ySpacing * (rowIndex + 1);
        positions[env.id] = { x, y };
      });
    });
    return positions;
  }, [groupedEnvironments]);

  const getConnectionsForEnv = (envId: string) =>
    connections.filter(
      (connection) =>
        connection.fromEnvironmentId === envId ||
        connection.toEnvironmentId === envId
    );

  return (
    <div>
      <PageHeader
        title="Environments"
        description="Manage test environments and reservations"
      />

      {environments.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No environments"
          description="Create your first test environment"
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg">Integration Canvas</CardTitle>
                  <CardDescription>
                    Drag a node onto another to declare bidirectional connectivity.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs uppercase tracking-wide">
                  Drag to connect
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-2xl border border-border bg-[linear-gradient(120deg,rgba(12,74,110,0.08),rgba(14,116,144,0.08),rgba(15,23,42,0.02))] p-6">
                <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]" />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
                  <defs>
                    <linearGradient id="connGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#0ea5a4" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  {connections.map((connection) => {
                    const from = nodePositions[connection.fromEnvironmentId];
                    const to = nodePositions[connection.toEnvironmentId];
                    if (!from || !to) return null;
                    return (
                      <line
                        key={connection.id}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="url(#connGradient)"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                    );
                  })}
                </svg>
                <div
                  className="absolute left-6 right-6 top-6 grid gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                  style={{ gridTemplateColumns: `repeat(${groupedEnvironments.length}, minmax(0, 1fr))` }}
                >
                  {groupedEnvironments.map((group) => (
                    <div key={group.label} className="text-center">
                      {group.label}
                    </div>
                  ))}
                </div>
                <div className="relative h-[420px]">
                  {environments.map((env) => {
                    const position = nodePositions[env.id];
                    if (!position) return null;
                    const isDropTarget = dropTargetId === env.id;
                    return (
                      <div
                        key={env.id}
                        draggable
                        onDragStart={() => setDraggingEnvId(env.id)}
                        onDragEnd={() => {
                          setDraggingEnvId(null);
                          setDropTargetId(null);
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDropTargetId(env.id);
                        }}
                        onDrop={() => handleConnect(draggingEnvId, env.id)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-sm transition-all ${
                          isDropTarget ? 'ring-2 ring-teal-500/70' : 'hover:-translate-y-0.5 hover:shadow-md'
                        }`}
                        style={{ left: `${position.x}%`, top: `${position.y}%` }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{env.name}</p>
                            <p className="text-xs text-muted-foreground">{env.type.toUpperCase()}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Link2 className="h-3 w-3" />
                            {getConnectionsForEnv(env.id).length}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {environments.map((env) => {
            const envReservations = getEnvReservations(env.id);
            const now = new Date();
            const activeReservations = envReservations.filter(
              (r) => new Date(r.startDate) <= now && new Date(r.endDate) >= now
            );

            return (
              <Card key={env.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{env.name}</CardTitle>
                      <CardDescription className="capitalize">{env.type}</CardDescription>
                    </div>
                    <HealthBadge health={env.health} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {env.location === 'aws' ? 'AWS' : 'On-Prem'}
                    </Badge>
                    {env.awsAccountName && (
                      <Badge variant="secondary" className="text-xs">
                        {env.awsAccountName}
                      </Badge>
                    )}
                    {env.instanceGroup && (
                      <Badge variant="secondary" className="text-xs">
                        {env.instanceGroup.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {env.url && <p className="text-sm text-muted-foreground">{env.url}</p>}
                  {env.awsAccountId && (
                    <p className="text-xs text-muted-foreground">Account: {env.awsAccountId}</p>
                  )}
                  {env.healthReason && (
                    <p className="text-xs text-muted-foreground">{env.healthReason}</p>
                  )}
                  {getConnectionsForEnv(env.id).length > 0 && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                      <div className="flex items-center gap-2 font-semibold">
                        <PlugZap className="h-3 w-3" />
                        Integrated with {getConnectionsForEnv(env.id).length} environment
                        {getConnectionsForEnv(env.id).length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}

                  {/* Active Reservations */}
                  {activeReservations.length > 0 && (
                    <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-3 border border-orange-200 dark:border-orange-900">
                      <p className="text-xs font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Reserved by {activeReservations.map((r) => getMemberName(r.memberId)).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Upcoming Reservations */}
                  {envReservations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-2">Recent Reservations</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {envReservations.slice(0, 5).map((res) => (
                          <div key={res.id} className="text-xs border rounded p-2">
                            <p className="font-semibold">{getMemberName(res.memberId)}</p>
                            <p className="text-muted-foreground">
                              {formatDate(res.startDate)} - {formatDate(res.endDate)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateReservation(env.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Reserve
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>
      )}

      {/* Reservation Sheet */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Reserve Environment</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="member">Team Member *</Label>
              <Select value={formData.memberId} onValueChange={(value) => setFormData({ ...formData, memberId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
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

            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  setTimeout(handleCheckConflict, 100);
                }}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  setTimeout(handleCheckConflict, 100);
                }}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                placeholder="Purpose of reservation..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              />
            </div>

            {hasConflict && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-900">
                <p className="text-xs font-semibold text-red-900 dark:text-red-100 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Conflict: Another reservation exists in this time period
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={hasConflict}>
              Create Reservation
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
