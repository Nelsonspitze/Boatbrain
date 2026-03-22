import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoatsStore } from '../../lib/store/boats';
import { db } from '../../lib/db';
import { maintenanceTasks } from '../../lib/db/schema';
import { eq } from 'drizzle-orm';

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ef4444',
  normal: '#1a6fb5',
  low: '#94a3b8',
};

export default function MaintenanceScreen() {
  const { boats, activeBoatId } = useBoatsStore();
  const activeBoat = boats.find((b) => b.id === activeBoatId) ?? boats[0];
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeBoat) return;
    setIsLoading(true);
    db.select()
      .from(maintenanceTasks)
      .where(eq(maintenanceTasks.boatId, activeBoat.id))
      .then(setTasks)
      .finally(() => setIsLoading(false));
  }, [activeBoat?.id]);

  if (!activeBoat) {
    return (
      <View style={styles.centered}>
        <Ionicons name="boat-outline" size={48} color="#94a3b8" />
        <Text style={styles.emptyText}>Add a boat first to track maintenance.</Text>
      </View>
    );
  }

  const upcoming = tasks.filter((t) => !t.isCompleted);
  const done = tasks.filter((t) => t.isCompleted);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1a6fb5" />
      ) : (
        <FlatList
          data={[...upcoming, ...done]}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNum}>{upcoming.length}</Text>
                <Text style={styles.summaryLabel}>Upcoming</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNum}>{done.length}</Text>
                <Text style={styles.summaryLabel}>Completed</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="construct-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptyText}>
                Add maintenance tasks or let the AI generate them based on your boat's components.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, item.isCompleted && styles.cardDone]}>
              <View
                style={[
                  styles.priorityBar,
                  { backgroundColor: PRIORITY_COLORS[item.priority ?? 'normal'] },
                ]}
              />
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, item.isCompleted && styles.cardTitleDone]}>
                  {item.title}
                </Text>
                {item.nextDueDate && (
                  <Text style={styles.cardDue}>Due: {item.nextDueDate.slice(0, 10)}</Text>
                )}
                {item.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
              {item.isCompleted && (
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
              )}
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  list: { padding: 16, gap: 12 },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryItem: { alignItems: 'center' },
  summaryNum: { fontSize: 28, fontWeight: '700', color: '#1a6fb5' },
  summaryLabel: { fontSize: 13, color: '#64748b', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: '#e0effe' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDone: { opacity: 0.6 },
  priorityBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#0a1628' },
  cardTitleDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  cardDue: { fontSize: 12, color: '#1a6fb5', marginTop: 3 },
  cardDesc: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
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
