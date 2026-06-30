import axios from "axios";

// Bible versions config
export const BIBLE_VERSIONS = [
  { id: "esv", label: "ESV", fullName: "English Standard Version" },
  { id: "kjv", label: "KJV", fullName: "King James Version" },
  { id: "web", label: "WEB", fullName: "World English Bible" },
  { id: "asv", label: "ASV", fullName: "American Standard Version" },
  { id: "ylt", label: "YLT", fullName: "Young's Literal Translation" },
  { id: "bbe", label: "BBE", fullName: "Bible in Basic English" },
];

// Superscript numbers in brackets: [1] → ¹
function replaceWithSuperscript(inputString) {
  return inputString.replace(/\[(\d+)\]/g, (_, number) => {
    const superscriptDigits = "⁰¹²³⁴⁵⁶⁷⁸⁹";
    return number
      .split("")
      .map((d) => superscriptDigits[d])
      .join("");
  });
}

// Format bible-api.com verse array into a readable string
function formatBibleApiVerses(verses) {
  return verses
    .map((v) => `[${v.verse}]${v.text.trim()}`)
    .join(" ");
}

// ESV API fetch
async function fetchESV(bookName, chapterNum, bibleState, testamentIndex, bookIndex) {
  const passage = () => {
    if (bibleState[testamentIndex]?.books[bookIndex]?.chapters.length === 1) {
      return bookName;
    }
    return `${bookName}${chapterNum}`;
  };

  const response = await axios({
    method: "get",
    url: "https://api.esv.org/v3/passage/text/",
    params: {
      q: passage(),
      "include-passage-references": false,
      "include-short-copyright": false,
      "include-verse-numbers": true,
      "include-footnotes": false,
      "include-headings": false,
      "indent-paragraphs": 0,
      "indent-poetry": true,
      "indent-poetry-lines": 3,
      "indent-declares": 3,
      "indent-psalm-doxology": 0,
      "line-length": 0,
    },
    headers: {
      Authorization: "Token f636017b5f40767318894388ecec11f031f2efc6",
    },
  });

  const verseRange = response?.data?.passage_meta[0]?.chapter_end;
  let numOfVerses = null;
  if (verseRange && verseRange.length > 1) {
    const endVerseArray = verseRange[1];
    numOfVerses = parseInt(String(endVerseArray).slice(-3), 10);
  }

  const textString = response?.data?.passages.toString();
  const noInnerBreaks = textString.replace(/\n\s+\n/g, "\n\n");
  const modifiedText = noInnerBreaks.replace(/\n+$/, "");
  const superScripted = replaceWithSuperscript(modifiedText);

  return { text: superScripted, numOfVerses, copyright: "ESV® Bible © 2001 Crossway" };
}

// bible-api.com fetch (KJV, WEB, ASV, YLT, BBE)
async function fetchBibleApi(bookName, chapterNum, version) {
  const query = encodeURIComponent(`${bookName} ${chapterNum}`);
  const response = await axios.get(
    `https://bible-api.com/${query}?translation=${version}`
  );

  const { verses, translation_name } = response.data;
  const text = replaceWithSuperscript(formatBibleApiVerses(verses));
  const numOfVerses = verses.length;
  const copyright =
    version === "kjv" || version === "asv" || version === "ylt"
      ? "Public Domain"
      : `${translation_name} – Public Domain`;

  return { text, numOfVerses, copyright };
}

// Main export: fetch chapter text for any version
export async function fetchChapter({ bookName, chapterNum, version, bibleState, testamentIndex, bookIndex }) {
  if (version === "esv") {
    return fetchESV(bookName, chapterNum, bibleState, testamentIndex, bookIndex);
  }
  return fetchBibleApi(bookName, chapterNum, version);
}
