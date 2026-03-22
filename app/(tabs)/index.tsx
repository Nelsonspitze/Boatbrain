import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBoatsStore } from '../../lib/store/boats';

export default function BoatsDashboard() {
  const router = useRouter();
  const { boats, isLoading, loadBoats, setActiveBoat } = useBoatsStore();

  useEffect(() => {
    loadBoats();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a6fb5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {boats.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="boat-outline" size={80} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No boats yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first boat to get started with AI-powered maintenance and troubleshooting.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/boat/new')}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add My Boat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={boats}
            keyExtractor={(b) => b.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => {
                  setActiveBoat(item.id);
                  router.push(`/boat/${item.id}`);
                }}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="boat" size={32} color="#1a6fb5" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardMeta}>
                    {[item.make, item.model, item.year].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/boat/new')}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#0a1628', marginTop: 16 },
  emptySubtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a6fb5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#e0effe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 17, fontWeight: '600', color: '#0a1628' },
  cardMeta: { fontSize: 13, color: '#64748b', marginTop: 2 },
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
