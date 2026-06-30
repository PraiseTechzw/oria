/* eslint-disable react/no-unescaped-entities */
import {
  readBibleAgain,
  resetAllData,
  updateSettings,
} from "../../features/globalData/globalDataSlice";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";
import VerifyResetModal from "../../components/molecules/VerifyResetModal/VerifyResetModal";
import StyledTextButton from "../../components/atoms/StyledTextButton/StyledTextButton";
import colors from "../../constants/colors";
import { FontAwesome5 } from "@expo/vector-icons";
import { BIBLE_VERSIONS } from "../../services/bibleService";

const FONT_SIZES = [16, 18, 20, 22, 24, 26];

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const userProgress = useSelector((state) => state.globalData.userProgress);
  const settings = useSelector((state) => state.globalData.settings ?? { fontSize: 20, bibleVersion: "esv" });
  const isBibleCompleted = userProgress.milestones[11].completed;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalOption, setModalOption] = useState({});
  const [aboutExpanded, setAboutExpanded] = useState(false);

  const modalOptions = [
    {
      option: "readAgain",
      message:
        "This will remove all your current milestones as well as your book/chapter progress, but will NOT reset your total points. \n\nDo you wish to continue?",
    },
    {
      option: "resetAll",
      message:
        "This option will reset ALL progress, including your total points.\n\nDo you wish to continue?",
    },
  ];

  const modalToggle = () => setModalOpen(!modalOpen);

  const handleReadAgainPress = () => { setModalOpen(true); setModalOption(modalOptions[0]); };
  const handleReadAgainConfirm = () => { dispatch(readBibleAgain()); modalToggle(); };
  const handleResetAllPress = () => { setModalOpen(true); setModalOption(modalOptions[1]); };
  const handleResetAllConfirm = () => { dispatch(resetAllData()); modalToggle(); };
  const handleContactPress = () => Linking.openURL("mailto:levelupbible@gmail.com");
  const handleReadMorePress = () => setAboutExpanded(!aboutExpanded);

  const handleFontSize = (size) => dispatch(updateSettings({ fontSize: size }));
  const handleVersion = (version) => dispatch(updateSettings({ bibleVersion: version }));

  return (
    <View style={styles.root}>
      <VerifyResetModal
        modalOpen={modalOpen}
        modalToggle={modalToggle}
        modalOption={modalOption}
        handleReadAgain={handleReadAgainConfirm}
        handleResetAll={handleResetAllConfirm}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Settings</Text>

        {/* ── Bible Version ─────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Bible Version</Text>
          <Text style={styles.textDescription}>Choose which Bible translation to read.</Text>
          <View style={styles.versionGrid}>
            {BIBLE_VERSIONS.map((v) => {
              const isSelected = settings.bibleVersion === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.versionBtn, isSelected && styles.versionBtnSelected]}
                  onPress={() => handleVersion(v.id)}
                  activeOpacity={0.7}>
                  <Text style={[styles.versionLabel, isSelected && styles.versionLabelSelected]}>
                    {v.label}
                  </Text>
                  <Text style={styles.versionFull} numberOfLines={1}>{v.fullName}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Font Size ─────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Reader Font Size</Text>
          <Text style={styles.textDescription}>Adjust the text size in the Bible reader.</Text>
          <View style={styles.fontSizeRow}>
            {FONT_SIZES.map((size) => {
              const isSelected = settings.fontSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.fontSizeBtn, isSelected && styles.fontSizeBtnSelected]}
                  onPress={() => handleFontSize(size)}
                  activeOpacity={0.7}>
                  <Text style={[styles.fontSizeText, { fontSize: size - 4 }, isSelected && styles.fontSizeTextSelected]}>
                    Aa
                  </Text>
                  <Text style={[styles.fontSizeLabel, isSelected && styles.fontSizeLabelSelected]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── About ─────────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.textDescription}>
            Level-Up Bible helps you track your progress in reading the entire
            Bible. For additional accountability and encouragement there are
            some unique features:{"\n"}
          </Text>
          <View opacity={aboutExpanded ? 1 : 0.2}>
            <Text style={styles.textDescription}>
              <Text style={styles.bolded}>POINTS: </Text> Earn a point for
              every verse you read!{"\n"}
            </Text>
          </View>
          {aboutExpanded && (
            <Text style={styles.textDescription}>
              <Text style={styles.bolded}>QUIZZES: </Text>There are quiz
              questions at the end of each chapter. A wrong answer will
              require you to re-read the chapter. Answering all three
              questions correctly will gain you points based on the number
              of verses in that chapter.{"\n\n"}
              <Text style={styles.bolded}>MILESTONES: </Text>There are
              milestones to unlock as you progress through the Bible.{"\n\n"}
              <Text style={styles.bolded}>GAMES: </Text>Play Verse Memory,
              Bible Trivia, and Word Scramble to sharpen your Bible knowledge!{"\n\n"}
              <Text style={styles.bolded}>BOOKMARKS: </Text>Save any chapter
              you want to return to.{"\n\n"}
              Thank you for using Level-Up Bible!
            </Text>
          )}
          <Pressable style={styles.readMorePressable} onPress={handleReadMorePress}>
            <View style={styles.readMoreView}>
              <Text style={styles.readMoreText}>
                {aboutExpanded ? "Collapse" : "Read More"}
              </Text>
              <FontAwesome5
                name={aboutExpanded ? "chevron-up" : "chevron-down"}
                color={colors.tertiary}
                size={18}
              />
            </View>
          </Pressable>
        </View>

        {/* ── Progress Reset ────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Progress</Text>
          {isBibleCompleted && (
            <StyledTextButton
              backgroundColor={colors.secondary}
              backgroundPressedColor={colors.secondaryLight}
              borderWidth={2}
              borderColor={colors.secondary}
              margin={8}
              onPress={handleReadAgainPress}>
              Read Again
            </StyledTextButton>
          )}
          <StyledTextButton
            backgroundColor={colors.quarternaryDark}
            backgroundPressedColor={colors.quarternary}
            borderWidth={2}
            borderColor={colors.quarternary}
            margin={8}
            onPress={handleResetAllPress}>
            Reset All Progress
          </StyledTextButton>
        </View>

        {/* ── Contact ───────────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.textDescription}>
            Questions, feedback, or bug reports?
          </Text>
          <StyledTextButton
            borderWidth={2}
            borderColor={colors.secondaryLight}
            margin={8}
            onPress={handleContactPress}>
            Contact Us
          </StyledTextButton>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    color: colors.text,
    margin: 24,
  },
  sectionContainer: {
    backgroundColor: colors.primaryDarkTranslucent,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryDark,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  textDescription: {
    fontSize: 15,
    color: colors.textGrey,
    lineHeight: 22,
  },
  bolded: { fontWeight: "800", color: colors.text },
  readMorePressable: { marginTop: 8 },
  readMoreView: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 4,
  },
  readMoreText: { fontSize: 16, color: colors.tertiary, fontWeight: "700" },
  // Version
  versionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  versionBtn: {
    borderWidth: 2,
    borderColor: colors.secondaryDark,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 80,
  },
  versionBtnSelected: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryDark,
  },
  versionLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textGrey,
  },
  versionLabelSelected: { color: colors.text },
  versionFull: { fontSize: 10, color: colors.textGrey, marginTop: 2, maxWidth: 80, textAlign: "center" },
  // Font size
  fontSizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 8,
  },
  fontSizeBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.secondaryDark,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  fontSizeBtnSelected: {
    borderColor: colors.tertiary,
    backgroundColor: colors.tertiaryDark,
  },
  fontSizeText: { color: colors.textGrey },
  fontSizeTextSelected: { color: colors.text },
  fontSizeLabel: { fontSize: 11, color: colors.textGrey, marginTop: 2 },
  fontSizeLabelSelected: { color: colors.tertiary },
});
