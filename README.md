# Kannada for Everyone

Learn the Kannada you need today: in an auto, on a bus, at a hospital counter.

I built this for the Kannada Digital Innovation Hackathon 2026 (HackerRank Campus Crew, NIE Mysuru). I picked problem statement 1: help people who don't speak Kannada learn practical Kannada through everyday conversations, situations, vocabulary and guided practice.

**Live demo:** <your-vercel-link>

## The idea

Someone who has just moved to Bengaluru or Mysuru doesn't need to start with the alphabet. They need to say "put the meter on" on day one. So this app starts from the situation, not the lesson. You pick where you are, hear the phrases, and practise them.

Kannada script is always the biggest thing on the screen. Under it you get how it sounds in English letters and what it means.

## What it does

- **Home:** a phrase of the day, a search bar, shortcuts to every situation, and a link back to the last situation you opened.
- **Situations:** 11 everyday places: auto and cab, BMTC bus and Namma Metro, restaurant and street food, vegetable market, hospital and pharmacy, hotel, asking directions, neighbours and landlord, office and college, bank and government offices, and emergency. Each one has phrases, a sample two-way conversation, and notes on what to know and what is better not to say. There are 104 phrases in total.
- **Listen:** a speaker button and a slow-speed button on every Kannada phrase.
- **Search:** type English, or Kannada in English letters, and get the Kannada script, how to say it, the meaning, and a few related phrases people usually need next.
- **Ask:** ask a question in plain English (typed, or spoken with the mic button) and get the answer with script, pronunciation and a cultural tip.
- **Coach:** a role-play mode. I pretend to be an auto driver, a waiter, a vegetable vendor or a bus conductor, you reply, and the coach corrects you gently, gives a hint if you're stuck, and suggests what to learn next.
- **Read a sign:** take a photo of a bus board or shop sign and the app reads the Kannada and explains it.
- **Practice:** flashcards, a listen-and-pick quiz, and "Say it", which listens to you and checks your pronunciation. Smart review brings back the phrases you miss sooner and the ones you know later. There is a streak and a count of phrases learned.
- **Saved:** your own phrasebook. It works offline for phrases already in the app.
- Dark mode, and no login anywhere. Everything you save stays in your browser.

## Tech stack

- Next.js 14 (App Router), React 18 and TypeScript
- Tailwind CSS with my own colour and font tokens
- Lucide for icons
- Google Gemini API through the official `@google/genai` SDK
- Web Speech API (speech output and speech recognition), localStorage, a small service worker for offline use
- Deployed on Vercel

## How it works

The phrasebook is plain JSON in `src/data/situations.json`, so most of the app works without any AI at all.

1. When you search, the app looks in the built-in phrases first. If it finds a match, you get it instantly.
2. If there is no match, it checks the answers your browser has already saved.
3. Only then does the browser call one of my API routes (`/api/translate`, `/api/chat` or `/api/scan`). Those routes call Gemini from the server.

The Gemini key lives only on the server. It is read from an environment variable and never reaches the browser. I ask Gemini for JSON in a fixed shape, check the reply before showing it, cache it, and limit how often one visitor can call it, so the free tier lasts. The system prompt tells it to use natural spoken Kannada, always give script, pronunciation and meaning, and say "I'm not sure" instead of guessing.

If Gemini is unavailable or the free limit is hit, the app says so in plain words and shows the closest phrases from the phrasebook instead.

## Running it locally

You need Node.js 18.17 or newer.

```bash
git clone https://github.com/<your-username>/kannada-for-everyone.git
cd kannada-for-everyone
npm install
cp .env.example .env.local
```

Open `.env.local` and paste your Gemini key after `GEMINI_API_KEY=`, with no quotes or spaces. You can get a free key from Google AI Studio. Then start the app:

```bash
npm run dev
```

Open http://localhost:3000. To check that the key was picked up, open http://localhost:3000/api/health. It should say `"geminiKeyFound": true`.

Restart `npm run dev` any time you change `.env.local`, because it is only read when the server starts.

## Environment variables

| Name | What it is |
|---|---|
| `GEMINI_API_KEY` | Your Gemini API key. Server only. Never commit it. |
| `GEMINI_MODEL` | The Gemini model to use. I'm using `gemini-3.5-flash`. |

## Deploying to Vercel

1. Push the repo to GitHub.
2. On vercel.com, choose Add New, then Project, and import the repo.
3. Add `GEMINI_API_KEY` and `GEMINI_MODEL` under Environment Variables. Vercel does not read `.env.local`.
4. Deploy. Then open `/api/health` on the live site and try Ask.

Every push to `main` deploys again. If you change an environment variable later, redeploy so it takes effect.

## Project structure

```
src/
  app/          pages and API routes (api/translate, api/chat, api/scan, api/health)
  components/   screens and shared pieces (phrase card, tab bar, practice modes)
  lib/          search, storage, speech, practice logic, Gemini code (lib/server)
  data/         situations.json, the phrasebook
public/         service worker and the folder for recorded audio
```

## Things to know

- **Listen** uses the Kannada voice on your device. Some phones don't have one. In that case the app plays a recording from `public/audio` if there is one, and otherwise tells you. I haven't recorded any audio yet.
- **Say it** and the mic in Ask use the browser's speech recognition. It works best in Chrome and the check is approximate, not a grade.
- The AI features run on the free Gemini tier, so they can hit a limit.
- The phrases need a check by native Kannada speakers. If you find a mistake, please open an issue.

## What I'd like to add

- Recorded audio for every phrase
- More phrases and more situations
- Regional speech from other parts of Karnataka
- A voice-first coach
- Explanations in Hindi, Tamil, Telugu and Malayalam
