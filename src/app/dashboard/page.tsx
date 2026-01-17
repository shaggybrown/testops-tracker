'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { useTeamsStore } from '@/stores/useTeamsStore';
import { useEnvironmentsStore } from '@/stores/useEnvironmentsStore';
import { PageHeader } from '@/components/Common';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Database, Zap } from 'lucide-react';
import { useEffect } from 'react';

export default function Dashboard() {
  const { isLoading: authLoading } = useAuthStore();
  const { teams, fetchTeams, isLoading: teamsLoading } = useTeamsStore();
  const { environments, fetchEnvironments } = useEnvironmentsStore();

  useEffect(() => {
    fetchTeams();
    fetchEnvironments();
  }, [fetchTeams, fetchEnvironments]);

  if (authLoading || teamsLoading) {
    return <div className='text-center py-12'>Loading...</div>;
  }

  const stats = [
    {
      label: 'Teams',
      value: teams.length,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Environments',
      value: environments.length,
      icon: Database,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      label: 'Efforts',
      value: 0,
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      label: 'Sprints',
      value: 0,
      icon: BarChart3,
      color: 'bg-green-500/10 text-green-600',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your test operations."
      />

      {/* Stats Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{stat.label}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <Icon className='h-4 w-4' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Recent Activity</CardTitle>
            <CardDescription>Latest changes in your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <p className='text-sm text-muted-foreground'>No recent activity yet.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Getting Started</CardTitle>
            <CardDescription>Set up your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2 text-sm'>
              <li className='flex items-center gap-2'>
                <span className='h-2 w-2 rounded-full bg-primary' />
                Create a Scrum team
              </li>
              <li className='flex items-center gap-2'>
                <span className='h-2 w-2 rounded-full bg-primary' />
                Add team members
              </li>
              <li className='flex items-center gap-2'>
                <span className='h-2 w-2 rounded-full bg-primary' />
                Configure environments
              </li>
              <li className='flex items-center gap-2'>
                <span className='h-2 w-2 rounded-full bg-primary' />
                Create a sprint
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
