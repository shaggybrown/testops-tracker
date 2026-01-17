'use client';

import React, { useState } from 'react';
import { Member, Team } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Plus } from 'lucide-react';

interface TeamFormProps {
  team?: Team;
  onSubmit: (data: Omit<Team, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) => Promise<void>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function TeamForm({
  team,
  onSubmit,
  isOpen,
  onOpenChange,
  trigger,
}: TeamFormProps) {
  const [open, setOpen] = useState(isOpen || false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: team?.name || '',
    description: team?.description || '',
    archived: team?.archived || false,
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', description: '', archived: false });
      handleOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Team
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{team ? 'Edit Team' : 'Create Team'}</SheetTitle>
          <SheetDescription>
            {team ? 'Update team details' : 'Add a new Scrum team'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., QA Team"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Team responsibilities and scope..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Team'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

type MemberFormData = Pick<Member, 'name' | 'email' | 'roles' | 'teamIds'>;

interface MemberFormProps {
  member?: Member;
  onSubmit: (data: MemberFormData) => Promise<void>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MemberForm({
  member,
  onSubmit,
  isOpen,
  onOpenChange,
}: MemberFormProps) {
  const [open, setOpen] = useState(isOpen || false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MemberFormData>({
    name: member?.name || '',
    email: member?.email || '',
    roles: member?.roles || ['MEMBER'],
    teamIds: member?.teamIds || [],
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '', roles: ['MEMBER'], teamIds: [] });
      handleOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{member ? 'Edit Member' : 'Add Member'}</SheetTitle>
          <SheetDescription>
            {member ? 'Update member details' : 'Add a new team member'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="email@example.com"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Member'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
