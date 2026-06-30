import { createSlice } from "@reduxjs/toolkit";
import initialBibleData from "../../constants/initialStateConstants/initialBibleData";
import initialUserProgress from "../../constants/initialStateConstants/initialUserProgress";
import { dailyVerses } from "../../constants/gameData";

// Pick a verse based on day of year so the same day always shows the same verse
function getTodayVerse() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return dailyVerses[dayOfYear % dailyVerses.length];
}

const initialSettings = {
  fontSize: 20,
  bibleVersion: "esv",
};

const initialStreak = {
  current: 0,
  best: 0,
  lastReadDate: null,
};

const globalDataSlice = createSlice({
  name: "globalData",
  initialState: {
    bibleData: initialBibleData,
    userProgress: initialUserProgress,
    settings: initialSettings,
    bookmarks: [],
    streak: initialStreak,
    dailyVerse: getTodayVerse(),
  },
  reducers: {
    // ─── Existing reducers ─────────────────────────────────────────────
    readBibleAgain: (state) => {
      const currentPoints = state.userProgress.stats.totalPoints;
      state.bibleData = initialBibleData;
      state.userProgress = {
        ...initialUserProgress,
        stats: { ...initialUserProgress.stats, totalPoints: currentPoints },
      };
      // Keep settings, bookmarks, streak, dailyVerse intact
    },
    resetAllData: (state) => {
      state.bibleData = initialBibleData;
      state.userProgress = initialUserProgress;
      state.streak = initialStreak;
      // Keep settings and bookmarks
    },
    setTestamentSelected: (state, action) => {
      const { index } = action.payload;
      state.bibleData[index].selected = !state.bibleData[index].selected;
    },
    setBookSelected: (state, action) => {
      const { testamentIndex, bookIndex } = action.payload;
      state.bibleData[testamentIndex].books[bookIndex].selected =
        !state.bibleData[testamentIndex].books[bookIndex].selected;
    },
    setChapterSelected: (state, action) => {
      const { testamentIndex, bookIndex, chapterNum } = action.payload;
      state.bibleData.map((testament, testamentMapIndex) => {
        testament.books.map((book, bookMapIndex) => {
          book.chapters.map((chapter, chapterMapIndex) => {
            if (
              testamentMapIndex === testamentIndex &&
              bookMapIndex === bookIndex &&
              chapter.chapter === chapterNum
            ) {
              state.bibleData[testamentMapIndex].books[bookMapIndex].chapters[
                chapterMapIndex
              ].selected =
                !state.bibleData[testamentMapIndex].books[bookMapIndex]
                  .chapters[chapterMapIndex].selected;
            } else {
              state.bibleData[testamentMapIndex].books[bookMapIndex].chapters[
                chapterMapIndex
              ].selected = false;
            }
          });
        });
      });
    },
    resetBibleSelection: (state) => {
      state.bibleData.map((testament, testIndex) => {
        state.bibleData[testIndex].selected = false;
        state.bibleData[testIndex].books.map((book, bookIndex) => {
          state.bibleData[testIndex].books[bookIndex].selected = false;
          state.bibleData[testIndex].books[bookIndex].chapters.map(
            (chapter, chapIndex) => {
              state.bibleData[testIndex].books[bookIndex].chapters[
                chapIndex
              ].selected = false;
            }
          );
        });
      });
    },
    setChapterCompleted: (state, action) => {
      const { testamentIndex, bookIndex, chapterIndex } = action.payload;
      const testament = state.bibleData[testamentIndex];
      const book = testament.books[bookIndex];
      const chapter = book.chapters[chapterIndex];
      chapter.completed = true;

      const allChaptersComplete = book.chapters.every(
        (chapter) => chapter.completed === true
      );
      if (allChaptersComplete) book.completed = true;

      const allBooksComplete = testament.books.every(
        (book) => book.completed === true
      );
      if (allBooksComplete) testament.completed = true;
    },
    updateProgress: (state, action) => {
      const { points } = action.payload;
      const { bibleData } = state;
      const { stats } = state.userProgress;
      const { milestones } = state.userProgress;
      const { recentEarnedMilestones } = state.userProgress;

      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const year = String(currentDate.getFullYear()).slice(-2);
      const formattedDate = `${month}/${day}/${year}`;

      // Update STATS
      stats.totalPoints += points;

      let completedChaptersCount = 0;
      bibleData.forEach((testament) => {
        testament.books.forEach((book) => {
          book.chapters.forEach((chapter) => {
            if (chapter.completed) completedChaptersCount++;
          });
        });
      });
      stats.numChaptersCompleted = completedChaptersCount;

      let completedBooksCount = 0;
      bibleData.forEach((testament) => {
        testament.books.forEach((book) => {
          if (book.completed) completedBooksCount++;
        });
      });
      stats.numBooksCompleted = completedBooksCount;

      // Update STREAK
      const todayStr = currentDate.toDateString();
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      const { streak } = state;

      if (streak.lastReadDate !== todayStr) {
        if (streak.lastReadDate === yesterdayStr) {
          streak.current += 1;
        } else {
          streak.current = 1;
        }
        if (streak.current > streak.best) streak.best = streak.current;
        streak.lastReadDate = todayStr;
      }

      // Helper functions for milestone logic
      const pushMilestoneToRecents = (index) => {
        // Store the milestone title (string) so HomeMilestonesRender can look it up
        recentEarnedMilestones.unshift(milestones[index].title);
        if (recentEarnedMilestones.length > 5) {
          recentEarnedMilestones.pop();
        }
      };

      const updateSectionMilestones = (bookNames, milestoneIndex, testamentIndex) => {
        if (milestones[milestoneIndex].completed === false) {
          const sectionComplete = bookNames.every((name) => {
            const book = bibleData[testamentIndex].books.find(
              (b) => b.bookName === name
            );
            return book && book.completed === true;
          });
          if (sectionComplete) {
            milestones[milestoneIndex].completed = true;
            milestones[milestoneIndex].earnedDate = formattedDate;
            pushMilestoneToRecents(milestoneIndex);
          }
        }
      };

      // Check First Chapter milestone [0]
      if (milestones[0].completed === false) {
        if (stats.numChaptersCompleted >= 1) {
          milestones[0].completed = true;
          milestones[0].earnedDate = formattedDate;
          pushMilestoneToRecents(0);
        }
      }
      // Check First Book milestone [1]
      if (milestones[1].completed === false) {
        if (stats.numBooksCompleted >= 1) {
          milestones[1].completed = true;
          milestones[1].earnedDate = formattedDate;
          pushMilestoneToRecents(1);
        }
      }
      // Law [2]
      const lawBookNames = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"];
      updateSectionMilestones(lawBookNames, 2, 0);
      // History [3]
      const historyBookNames = ["Joshua", "Judges", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings"];
      updateSectionMilestones(historyBookNames, 3, 0);
      // Poetry [4]
      const poetryBookNames = ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"];
      updateSectionMilestones(poetryBookNames, 4, 0);
      // Major Prophets [5]
      const majorProphetsBookNames = ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel"];
      updateSectionMilestones(majorProphetsBookNames, 5, 0);
      // Minor Prophets [6]
      const minorProphetsBookNames = ["Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"];
      updateSectionMilestones(minorProphetsBookNames, 6, 0);
      // Old Testament [7]
      if (milestones[7].completed === false) {
        if (bibleData[0].completed) {
          milestones[7].completed = true;
          milestones[7].earnedDate = formattedDate;
          pushMilestoneToRecents(7);
        }
      }
      // Gospels [8]
      const gospelBookNames = ["Matthew", "Mark", "Luke", "John"];
      updateSectionMilestones(gospelBookNames, 8, 1);
      // Paul's Letters [9]
      const paulsLettersBookNames = ["Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon"];
      updateSectionMilestones(paulsLettersBookNames, 9, 1);
      // New Testament [10]
      if (milestones[10].completed === false) {
        if (bibleData[1].completed) {
          milestones[10].completed = true;
          milestones[10].earnedDate = formattedDate;
          pushMilestoneToRecents(10);
        }
      }
      // Whole Bible [11]
      if (milestones[11].completed === false) {
        if (bibleData[0].completed && bibleData[1].completed) {
          milestones[11].completed = true;
          milestones[11].earnedDate = formattedDate;
          pushMilestoneToRecents(11);
        }
      }
    },

    // ─── New: Settings ─────────────────────────────────────────────────
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // ─── New: Bookmarks ────────────────────────────────────────────────
    addBookmark: (state, action) => {
      const { bookName, chapterNum } = action.payload;
      const reference = `${bookName} ${chapterNum}`;
      // Don't add duplicate
      const exists = state.bookmarks.some((b) => b.reference === reference);
      if (!exists) {
        const currentDate = new Date();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const year = String(currentDate.getFullYear()).slice(-2);
        state.bookmarks.push({
          id: String(Date.now()),
          bookName,
          chapterNum,
          reference,
          date: `${month}/${day}/${year}`,
        });
      }
    },
    removeBookmark: (state, action) => {
      const { id } = action.payload;
      state.bookmarks = state.bookmarks.filter((b) => b.id !== id);
    },

    // ─── New: Daily verse refresh ──────────────────────────────────────
    refreshDailyVerse: (state) => {
      state.dailyVerse = getTodayVerse();
    },
  },
});

export const {
  readBibleAgain,
  resetAllData,
  setTestamentSelected,
  setBookSelected,
  setChapterSelected,
  resetBibleSelection,
  setChapterCompleted,
  updateProgress,
  updateSettings,
  addBookmark,
  removeBookmark,
  refreshDailyVerse,
} = globalDataSlice.actions;
export default globalDataSlice.reducer;
