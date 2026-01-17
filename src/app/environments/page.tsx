'use client';

import { useEnvironmentsStore } from '@/stores/useEnvironmentsStore';
import { useMembersStore } from '@/stores/useMembersStore';
import { useUiStore } from '@/stores/useUiStore';
import { PageHeader, EmptyState } from '@/components/Common';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { HealthBadge } from '@/components/Badges';
import { Plus, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate, getDaysDiff } from '@/lib/utils';

type ReservationFormData = {
  memberId: string;
  startDate: string;
  endDate: string;
  notes: string;
};

export default function Environments() {
  const { environments, fetchEnvironments, reservations, createReservation, checkReservationConflict } = useEnvironmentsStore();
  const { members, fetchMembers } = useMembersStore();
  const { addToast } = useUiStore();

  const [showSheet, setShowSheet] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReservationFormData>({
    memberId: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [hasConflict, setHasConflict] = useState(false);

  useEffect(() => {
    fetchEnvironments();
    fetchMembers();
  }, []);

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

  const getEnvReservations = (envId: string) => {
    return reservations.filter((r) => r.environmentId === envId);
  };

  const getMemberName = (memberId: string) => {
    return members.find((m) => m.id === memberId)?.name || 'Unknown';
  };

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
                </CardHeader>
                <CardContent className="space-y-4">
                  {env.url && <p className="text-sm text-muted-foreground">{env.url}</p>}
                  {env.healthReason && (
                    <p className="text-xs text-muted-foreground">{env.healthReason}</p>
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
