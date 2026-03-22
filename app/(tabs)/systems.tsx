import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBoatsStore } from '../../lib/store/boats';
import { db } from '../../lib/db';
import { systems, components } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

const CATEGORY_ICONS: Record<string, string> = {
  electrics: 'flash',
  plumbing: 'water',
  navigation: 'navigate',
  engine: 'settings',
  sails: 'flag',
  safety: 'shield-checkmark',
  communication: 'radio',
  other: 'ellipsis-horizontal',
};

export default function SystemsScreen() {
  const router = useRouter();
  const { boats, activeBoatId } = useBoatsStore();
  const activeBoat = boats.find((b) => b.id === activeBoatId) ?? boats[0];
  const [systemsList, setSystemsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeBoat || !db) return;
    setIsLoading(true);
    db.select().from(systems).where(eq(systems.boatId, activeBoat.id))
      .then(setSystemsList)
      .finally(() => setIsLoading(false));
  }, [activeBoat?.id]);

  if (!activeBoat) {
    return (
      <View style={styles.centered}>
        <Ionicons name="boat-outline" size={48} color="#94a3b8" />
        <Text style={styles.emptyText}>Add a boat first to manage its systems.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{activeBoat.name}</Text>
        <Text style={styles.headerSub}>{systemsList.length} systems</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a6fb5" />
      ) : (
        <FlatList
          data={systemsList}
          keyExtractor={(s) => s.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="layers-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No systems yet</Text>
              <Text style={styles.emptyText}>
                Systems will be auto-populated from your boat's make and model.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/boat/${activeBoat.id}/system/${item.id}`)}
            >
              <View style={styles.cardIconWrap}>
                <Ionicons
                  name={(CATEGORY_ICONS[item.category] ?? 'ellipsis-horizontal') as any}
                  size={28}
                  color="#1a6fb5"
                />
              </View>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardCat}>{item.category}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/boat/${activeBoat.id}/system/new`)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0effe' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0a1628' },
  headerSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  grid: { padding: 12, gap: 12 },
  card: {
    flex: 1,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#e0effe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: { fontSize: 14, fontWeight: '600', color: '#0a1628', textAlign: 'center' },
  cardCat: { fontSize: 11, color: '#94a3b8', marginTop: 2, textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#0a1628', marginTop: 12 },
  emptyText: { color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a6fb5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a6fb5',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
});
