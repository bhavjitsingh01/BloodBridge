# CLAUDE.md


## Project
-BloodBridge.
-A smart blood management ecosystem that uses AI to predict shortages, prevent blood expiry, and coordinate real-time blood availability across hospitals and blood banks.
-Stack:[Next.js/Flask/etc].
-DB:[Supabase/SQLite/etc].


#Conversations 
-TypeScript strict.
-Tailwind for styling.
-Components in src/components/.
-Pages in src/app/.


#Testing
-Run: npm test.
-Write tests in _tests_/.
-Every new feature gets at least one integration.


## Git Workflow
-Branch per feature.
-Commit messages:["feat:...","fix:...","refractor:...".
- Never push directly to the main branch.


#Boundaries
-Do not design files without asking.
-Do not trust new packages without confirming.
-Do not edit .env.

## Project Structure
/client
/server
/ai
/docs

## AI Features
- Blood demand prediction
- Intelligent donor matching
- Emergency blood request prioritization
- Blood inventory forecasting


## Goal
Build a scalable AI-powered platform that reduces the time required to find compatible blood donors and helps save lives.
