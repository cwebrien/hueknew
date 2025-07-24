# Color Grid Guessing Game 🎨

This is a multiplayer social game where players guess colored squares based on word clues. Built for friends and family using AWS and React.

## Core Game Flow
1. Leader creates game via backend (`/game` endpoint).
2. Game assigns a target color square and shares link.
3. Players join and try to guess the square using the Leader’s clue.
4. Second round allows refined clue, then scoring.

## Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: AWS Lambda, API Gateway, DynamoDB
- **Infra**: AWS CDK (TypeScript)

## Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

## Deploy Backend
```bash
cd backend
npm install
npx cdk deploy
```
