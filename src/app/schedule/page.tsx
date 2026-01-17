'use client';

import { useEffortsStore } from '@/stores/useEffortsStore';
import { useEnvironmentsStore } from '@/stores/useEnvironmentsStore';
import { useSprintsStore } from '@/stores/useSprintsStore';
import { PageHeader, EmptyState } from '@/components/Common';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate, getDaysDiff } from '@/lib/utils';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isToday } from 'date-fns';

export default function Schedule() {
  const { efforts, fetchEfforts } = useEffortsStore();
  const { fetchEnvironments } = useEnvironmentsStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchEfforts();
    fetchEnvironments();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for each day
  const getEventsForDay = (day: Date) => {
    return efforts.filter((effort) => {
      if (!effort.plannedStartDate || !effort.plannedEndDate) return false;
      const dayTime = day.getTime();
      const startTime = new Date(effort.plannedStartDate).getTime();
      const endTime = new Date(effort.plannedEndDate).getTime();
      return dayTime >= startTime && dayTime <= endTime;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const gridDays = [];
  const firstDayOfMonth = monthStart.getDay();
  for (let i = 0; i < firstDayOfMonth; i++) {
    gridDays.push(null);
  }
  gridDays.push(...daysInMonth);

  return (
    <div>
      <PageHeader
        title="Schedule"
        description="Calendar view of test efforts and environment reservations"
      />

      <div className="grid gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
                <CardDescription>Test efforts timeline</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div key={day} className="text-center font-semibold text-sm py-2">
                  {day}
                </div>
              ))}
              {gridDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`min-h-24 p-2 rounded border ${
                    day === null
                      ? 'bg-muted/20'
                      : isToday(day)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                  }`}
                >
                  {day && (
                    <div className="space-y-1">
                      <p
                        className={`text-sm font-semibold ${
                          isToday(day) ? 'text-primary' : ''
                        }`}
                      >
                        {format(day, 'd')}
                      </p>
                      <div className="space-y-0.5">
                        {getEventsForDay(day).map((effort) => (
                          <div
                            key={effort.id}
                            className="text-xs bg-primary/10 text-primary rounded px-1 py-0.5 truncate cursor-pointer hover:bg-primary/20"
                            title={effort.title}
                          >
                            {effort.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Efforts */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Efforts</CardTitle>
            <CardDescription>Test activities scheduled for the next 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {efforts.filter((e) => {
              if (!e.plannedStartDate) return false;
              const daysUntilStart = getDaysDiff(new Date(), e.plannedStartDate);
              return daysUntilStart >= 0 && daysUntilStart <= 14;
            }).length === 0 ? (
              <p className="text-sm text-muted-foreground">No efforts scheduled</p>
            ) : (
              <div className="space-y-3">
                {efforts
                  .filter((e) => {
                    if (!e.plannedStartDate) return false;
                    const daysUntilStart = getDaysDiff(new Date(), e.plannedStartDate);
                    return daysUntilStart >= 0 && daysUntilStart <= 14;
                  })
                  .sort((a, b) => {
                    const dateA = a.plannedStartDate || new Date(0);
                    const dateB = b.plannedStartDate || new Date(0);
                    return new Date(dateA).getTime() - new Date(dateB).getTime();
                  })
                  .map((effort) => (
                    <div key={effort.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{effort.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {effort.plannedStartDate &&
                            `Starts: ${formatDate(effort.plannedStartDate)}`}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {effort.testType}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
