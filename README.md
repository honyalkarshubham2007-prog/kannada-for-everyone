Kannada for Everyone
An interactive phrasebook and coach that helps people who speak no Kannada learn the Kannada they need today: in autos, buses, restaurants, hospitals and offices.
Built for the Kannada Digital Innovation Hackathon 2026 (HackerRank Campus Crew, NIE Mysuru). Problem statement: help non-Kannada speakers learn practical Kannada through everyday conversations, situations, vocabulary and guided practice.



Features
Home with a phrase of the day, search and situation shortcuts
11 situations, each with phrases, a sample conversation and cultural tips (Phase 2)
Listen button on every Kannada phrase, plus slow speed
Smart search with translation, pronunciation and related phrases (Phase 3)
AI assistant and role-play coach (Phase 4)
Flashcards, quiz, pronunciation check, progress and saved phrases (Phase 5)
No login. Progress and saved phrases stay in your browser (localStorage)
Status: all six phases done. Next step is deploying and submitting.


Tech stack
Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide icons, Google Gemini API (server-side routes only, from Phase 3), Web Speech API.




Search and the AI
/search looks in the bundled phrasebook first. Only when nothing matches (or you tap "Ask the AI instead") does the browser call POST /api/translate, which calls Gemini on the server and returns { kannada, transliteration, meaning_english, usage_tip, related_phrases[] }. Answers are cached in server memory and in your browser (last 40). On a 429 or quota error the page says so and shows the closest phrasebook matches. Nothing is sent on each keystroke, only on submit.


Ask and Coach
/ask has two modes. Ask answers questions with script, transliteration, meaning and a cultural tip. Coach plays a scene (auto driver, waiter, vendor, conductor), corrects your lines gently, offers a hint, and suggests what to learn next. Both call POST /api/chat. If the AI is unavailable, Ask falls back to the closest phrasebook matches.


Read a sign
/scan takes a photo (or one from your gallery), shrinks it in the browser, and sends it to POST /api/scan. Gemini reads the Kannada and returns the text, pronunciation, meaning and a tip, plus other short text on the sign. Photos are passed to Gemini and not stored by this app.


Voice questions
In Ask, the mic button fills the box using the browser's speech recogniser (English; in Coach there is a switch to Kannada). You can check the words before sending. Chrome works best.


Practice
Three modes on /practice, drawn from all phrases, your saved phrases, or one situation: flashcards, a listen-and-pick quiz (with a show-text option for devices with no Kannada voice) and Say it, which uses the browser's speech recogniser (kn-IN, Chrome works best) to compare what you said with the phrase. The check is approximate. Streak and phrases learned are kept in localStorage. Smart review is the default set: it uses Leitner boxes, so a wrong answer brings a phrase back today, and each right answer waits longer (1, 2, 4, 8, then 16 days) before it returns.


Theme and accessibility
Dark mode follows the device, and the sun/moon button on Home overrides it. There is a skip link, visible focus rings, reduced-motion support, and answers are never shown by colour alone.


Listen and offline
Listen uses the browser's Kannada voice (kn-IN). If a device has none, it plays public/audio/<phrase-id>.mp3 when present, otherwise shows a clear message. A small service worker caches pages you've opened, so the phrasebook and situations work offline.




How it works
Seed data in src/data/situations.json is checked first. Gemini is called only when the seed has no answer, and answers are cached. Folders: src/app (pages), src/components, src/lib (data, storage, speech), src/data.
