import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  getAllNotifications,
  fetchAndStoreNotifications,
  StoredNotification,
} from "@/Services/storage";
import { format } from "date-fns";
import DotsLoader from "./common/AnimatedLayout";

export default function Notifications(props: {}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<StoredNotification | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAndStoreNotifications();
      const notifs = await getAllNotifications();
      setNotifications(notifs);
      setLoading(false);
    })();
  }, []);

  const renderItem = ({ item }: { item: StoredNotification }) => {
    const dateStr = format(new Date(item.timestamp), "PPpp");
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => setSelected(item)}
      >
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <DotsLoader size="large" />
        <Text style={{ marginTop: 8, color: "#666" }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Larger Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      )}

      {/* Modal for showing full message content (and image) when tapped */}
      <Modal
        visible={selected !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (
              <>
                <Text style={styles.modalTitle}>{selected.title}</Text>

                {/* If there’s an imageUrl, render it above the body text */}
                {selected.imageUrl ? (
                  <Image
                    source={{ uri: selected.imageUrl! }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                ) : null}

                {selected.body ? (
                  <Text style={styles.modalBody}>{selected.body}</Text>
                ) : (
                  <Text style={[styles.modalBody, { fontStyle: "italic" }]}>
                    (No message body)
                  </Text>
                )}

                <Text style={styles.modalDate}>
                  {format(new Date(selected.timestamp), "PPpp")}
                </Text>
              </>
            )}
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  backButton: {
    paddingRight: 8,
    marginRight: 12,
    marginBottom: 5,
  },
  backText: {
    fontSize: 28, // ← made the arrow larger
    color: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    flexShrink: 1,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardContent: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginLeft: 8,
  },
  emptyText: { fontSize: 16, color: "#666" },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#eee",
  },
  modalBody: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
  },
  modalDate: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: "#3498db",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  closeButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
