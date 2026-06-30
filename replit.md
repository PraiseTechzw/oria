# Level-Up Bible (oria)

A gamified Bible reading tracker built with **Expo / React Native**. Users read through the entire Bible, earn points, unlock milestones, take chapter quizzes, and now play Bible games.

## Stack
- **Framework**: Expo SDK 54 / React Native 0.81
- **Navigation**: React Navigation (Bottom Tabs + Native Stack via Expo Router hybrid)
- **State**: Redux Toolkit + redux-persist (AsyncStorage)
- **Bible text**: ESV API (api.esv.org) + bible-api.com for KJV / WEB / ASV / YLT / BBE

## Running the app
```bash
npm install
npx expo start          # interactive menu (iOS/Android/Web)
npx expo start --web --port 5000   # web only (used by the Replit workflow)
```

The configured **Replit workflow** runs `npx expo start --web --port 5000`.

For the full native experience (iOS/Android), use **Expo Go** on a physical device or a local simulator — those are not available inside Replit.

## Features
| Feature | Location |
|---|---|
| Bible reader (ESV/KJV/WEB/ASV/YLT/BBE) | `src/screens/BibleScreen/` |
| Bible version switcher | Settings tab → `src/screens/SettingsScreen/` |
| Font size control | Settings tab |
| Bookmark chapters | Bookmark icon in reader; BOOKMARKS tab |
| Share chapter text | Share icon in reader |
| Reading streak tracker | Home screen |
| Daily verse | Home screen (rotates by day of year) |
| Chapter quizzes (per-chapter JSON data) | `src/constants/quizData/` |
| Verse Memory game | GAMES tab → Verse Memory |
| Bible Trivia game | GAMES tab → Bible Trivia |
| Word Scramble game | GAMES tab → Word Scramble |
| Milestones / achievements | MILESTONES tab |
| Progress reset | Settings tab |

## Key file map
```
App.js                              Root: Provider/PersistGate/Navigation
src/
  features/globalData/
    globalDataSlice.js              All Redux state: progress, settings, bookmarks, streak, daily verse
  services/
    bibleService.js                 Multi-version Bible fetch (ESV + bible-api.com)
  screens/
    HomeScreen/                     Progress, streak, daily verse, quick-action buttons
    BibleScreen/                    Reader with highlight scroll, bookmark, share, version badge
    ChooseChapterScreen/            Testament → Book → Chapter accordion
    GamesScreen/
      GamesScreen.js                Games hub
      games/VerseMemoryGame.js      Fill-in-the-blank verse game
      games/BibleTriviaGame.js      Timed multiple-choice trivia
      games/WordScrambleGame.js     Unscramble Bible words
    BookmarksScreen/                Saved chapter bookmarks
    MilestonesScreen/               Achievement grid
    SettingsScreen/                 Version picker, font size, progress reset
  navigation/
    BottomTabs.js                   6 tabs: HOME / BIBLE / GAMES / BOOKMARKS / MILESTONES / SETTINGS
    BibleStack.js                   ChooseChapter → Bible
    GamesStack.js                   GamesHub → individual games
  constants/
    gameData.js                     Verse memory, trivia, scramble data + daily verse pool
    quizData/                       Per-chapter quiz JSON (all 66 books)
    colors.js                       App color palette
```

## User Preferences
- Keep the existing dark navy color scheme
- Mobile-first; web preview is secondary
- Do NOT restructure the navigation or migrate away from React Navigation to Expo Router file-based routing without explicit request
