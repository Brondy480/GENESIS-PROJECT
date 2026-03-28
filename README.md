# Genesis Project

A crowdfunding platform connecting project creators with investors.

## Project Structure

- `backend/` - Node.js Express API
- `frontend/genesis-frontend/` - React frontend application
- `mobile/` - Mobile application

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB (local or Atlas)
- Redis (optional, for caching)

### Backend Setup

```bash
cd backend
npm install
# Create .env file based on .env.example
npm run dev
```

### Frontend Setup

```bash
cd frontend/genesis-frontend
npm install
npm run dev
```

### Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

## Large Media Files

Due to GitHub file size limits, video files are stored separately.

**Video files location:** `frontend/genesis-frontend/video-assets/`

Required files:
- `DGaveclebic.mp4`
- `DGenveste.mp4`
- `Jeune.mp4`
- `projectsurpapier.mp4`
- `Vueaeriene.mp4`

**To restore:** Copy these files back to `frontend/genesis-frontend/src/assets/` after cloning.

## Environment Variables

Create `.env` files in:
- `backend/.env`
- `frontend/genesis-frontend/.env`

See `.env.example` or existing `.env.*.local` files for required variables.

## License

Private - All rights reserved
