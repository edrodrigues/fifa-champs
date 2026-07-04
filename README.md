# FIFA Champs

A modern web application for managing FIFA tournament brackets and matches. Organize tournaments with automatic group seeding, match scheduling, and real-time bracket visualization.

## Features

- **Create Tournaments** - Set up new championships with custom names and descriptions
- **Participant Management** - Add players via comma-separated text input with automatic validation
- **Automatic Seeding** - Distribute players evenly across groups (2-6 players per group)
- **Match Scheduling** - Auto-generate first round matches with balanced pairings
- **Result Tracking** - Record match outcomes and advance winners through bracket phases
- **Live Bracket View** - Visualize tournament progress with interactive bracket display
- **Playoff Stages** - Support for semi-finals, third-place match, and grand finale

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install

# Set up the database
npm run db:generate
npm run db:push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

- **Frontend**: Next.js 15+ with TypeScript and React
- **Styling**: Tailwind CSS with PostCSS
- **Database**: Drizzle ORM
- **API**: Next.js API routes
- **Logic**: Custom tournament engine for bracket generation and advancement

## Project Structure

```
src/
├── app/              # Next.js app router pages and API endpoints
├── components/       # React components (bracket view, etc.)
├── db/              # Database schema and queries
└── lib/             # Tournament engine logic
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

### Database

This project uses Drizzle ORM for type-safe database operations.

```bash
npm run db:generate  # Generate migration files
npm run db:push      # Apply migrations to database
npm run db:studio    # Open Drizzle Studio (GUI)
```

## API Endpoints

- `POST /api/championships` - Create a new championship
- `GET /api/championships` - List all championships
- `GET /api/championships/[id]` - Get championship details
- `POST /api/participants` - Add participants to a championship
- `POST /api/draw` - Execute automatic group seeding
- `POST /api/matches` - Create matches for a phase
- `POST /api/advance` - Record match result and advance winners

## Tournament Rules

### Group Stage
- Groups contain 2-6 players
- All players face each other once
- Top 50% advance to next phase

### Playoff Stages
- Single elimination format
- Losers eliminated immediately
- Semi-finals lead to grand final and third-place match

### Tiebreakers
- Wins (primary)
- Goal differential
- Goals scored
- Head-to-head record
- Manual decision by tournament organizer

## License

This project is provided as-is for tournament management purposes.
