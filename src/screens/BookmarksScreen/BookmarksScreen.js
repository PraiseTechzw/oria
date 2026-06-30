import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { removeBookmark } from "../../features/globalData/globalDataSlice";
import { FontAwesome5 } from "@expo/vector-icons";
import colors from "../../constants/colors";
import React from "react";

const BookmarksScreen = () => {
  const dispatch = useDispatch();
  const bookmarks = useSelector((state) => state.globalData.bookmarks);

  const handleDelete = (id) => {
    Alert.alert("Remove Bookmark", "Remove this bookmark?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => dispatch(removeBookmark({ id })),
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <FontAwesome5 name="bookmark" size={20} color={colors.tertiary} style={styles.icon} />
        <View style={styles.textBlock}>
          <Text style={styles.reference}>{item.reference}</Text>
          {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <FontAwesome5 name="trash" size={16} color={colors.quarternary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <Text style={styles.header}>Bookmarks</Text>
      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="bookmark" size={60} color={colors.secondaryDark} />
          <Text style={styles.emptyText}>No bookmarks yet.</Text>
          <Text style={styles.emptySubText}>
            Tap the bookmark icon while reading a chapter to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...bookmarks].reverse()}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default BookmarksScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    color: colors.text,
    marginVertical: 24,
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.tertiaryDark,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  reference: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  note: {
    fontSize: 14,
    color: colors.textGrey,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textGrey,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    color: colors.textGrey,
    textAlign: "center",
    lineHeight: 24,
  },
});
