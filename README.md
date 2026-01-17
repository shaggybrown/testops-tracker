# TestOps Tracker

A comprehensive test operations management tool for planning, scheduling, and tracking test work across multiple Scrum teams.

## Features (MVP)

- **Teams & Members**: Organize test teams and manage member roles
- **Test Configuration**: Define test types, statuses, and workflows
- **Environment Management**: Track environments and prevent resource collisions
- **Sprint Planning**: Create sprints and organize test efforts
- **Test Execution Tracking**: Monitor progress with Kanban views and dashboards
- **Reporting**: Sprint readiness reports and CSV exports

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui + Lucide icons
- **State**: Zustand
- **Validation**: Zod

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000 - automatically redirects to /dashboard

## Project Status

 **Milestone 1 Complete**: Foundation setup with AppShell, core stores, and mock data

### Navigation
- Dashboard: System overview
- My Work: Personal queue
- Kanban: Status-based view
- Schedule: Calendar view
- Efforts: Complete list
- Teams: Team management
- Environments: Environment management
- Reports: Readiness & exports

### Next: Milestone 2 - Core CRUD operations
