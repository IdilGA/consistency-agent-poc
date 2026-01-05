# Consistency Agent (PoC)

A small Proof of Concept that performs a **consistency check** based on:

- a briefing
- brand & style rules
- a task

The output is a **score and a list of violations**.

## Current version

**v1 – Rule-based consistency checker (no AI)**

This version uses manual rules and simple validation logic to test the concept.

## Features (v1)

- Input: briefing, brand/style rules, task
- Rule-based consistency logic
- Output: score + violations
- API route: `src/app/api/consistency/route.tsx`

## Tech stack

- Next.js (App Router)
- TypeScript

## Run locally

```bash
npm install
npm run dev
```
