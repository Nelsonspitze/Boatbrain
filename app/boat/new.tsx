import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBoatsStore } from '../../lib/store/boats';
import { populateBoatSystems } from '../../lib/ai/populate';
import { db } from '../../lib/db';
import { systems, components } from '../../lib/db/schema';
import { randomUUID } from 'expo-crypto';

const now = () => new Date().toISOString();

export default function NewBoatScreen() {
  const router = useRouter();
  const { addBoat, setActiveBoat } = useBoatsStore();

  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [loa, setLoa] = useState('');
  const [type, setType] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please give your boat a name.');
      return;
    }

    setIsSaving(true);
    try {
      const boat = await addBoat({
        name: name.trim(),
        make: make.trim() || null,
        model: model.trim() || null,
        year: year ? parseInt(year, 10) : null,
        loa: loa ? parseFloat(loa) : null,
        type: type.trim() || null,
        engineMake: null,
        engineModel: null,
        hullNumber: null,
        photoUri: null,
        notes: null,
      });

      setActiveBoat(boat.id);

      // Auto-populate systems if we have enough info
      if (make.trim() && model.trim() && year) {
        Alert.alert(
          'Auto-populate Systems?',
          `Let AI pre-fill systems and components for a ${year} ${make} ${model}?`,
          [
            {
              text: 'Skip',
              onPress: () => router.replace('/(tabs)'),
              style: 'cancel',
            },
            {
              text: 'Yes, fill it in',
              onPress: async () => {
                try {
                  const populated = await populateBoatSystems(
                    make.trim(),
                    model.trim(),
                    parseInt(year, 10),
                  );

                  for (const sys of populated) {
                    const sysId = randomUUID();
                    await db.insert(systems).values({
                      id: sysId,
                      boatId: boat.id,
                      name: sys.name,
                      category: sys.category,
                      icon: null,
                      notes: null,
                      sortOrder: 0,
                      createdAt: now(),
                      updatedAt: now(),
                      syncedAt: null,
                    });

                    for (const comp of sys.components) {
                      await db.insert(components).values({
                        id: randomUUID(),
                        systemId: sysId,
                        boatId: boat.id,
                        name: comp.name,
                        make: comp.make ?? null,
                        model: comp.model ?? null,
                        serialNumber: null,
                        installDate: null,
                        notes: comp.notes ?? null,
                        manualUri: null,
                        photoUri: null,
                        isVerified: false,
                        aiGenerated: true,
                        partNumber: comp.partNumber ?? null,
                        createdAt: now(),
                        updatedAt: now(),
                        syncedAt: null,
                      });
                    }
                  }

                  Alert.alert(
                    'Systems loaded!',
                    `${populated.length} systems pre-populated. Review and confirm each component.`,
                    [{ text: 'Got it', onPress: () => router.replace('/(tabs)/systems') }],
                  );
                } catch {
                  Alert.alert('AI Error', 'Could not auto-populate systems. You can add them manually.');
                  router.replace('/(tabs)');
                }
              },
            },
          ],
        );
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save boat. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Basic Info</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Boat name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Blue Horizon"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.label}>Make</Text>
          <TextInput
            style={styles.input}
            value={make}
            onChangeText={setMake}
            placeholder="e.g. Beneteau"
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            value={model}
            onChangeText={setModel}
            placeholder="e.g. Oceanis 40.1"
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={setYear}
            placeholder="e.g. 2021"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.field, styles.flex]}>
          <Text style={styles.label}>LOA (m)</Text>
          <TextInput
            style={styles.input}
            value={loa}
            onChangeText={setLoa}
            placeholder="e.g. 12.5"
            placeholderTextColor="#94a3b8"
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Boat type</Text>
        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
          placeholder="e.g. sloop, ketch, catamaran"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.aiHint}>
        <Ionicons name="sparkles" size={16} color="#1a6fb5" />
        <Text style={styles.aiHintText}>
          Fill in make, model, and year to let AI auto-populate your boat's systems.
        </Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>Save Boat</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff' },
  content: { padding: 20, gap: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  field: { marginBottom: 12 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 13, fontWeight: '500', color: '#475569', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0a1628',
    borderWidth: 1,
    borderColor: '#e0effe',
  },
  aiHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#e0effe',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  aiHintText: { flex: 1, fontSize: 13, color: '#155fa0', lineHeight: 18 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a6fb5',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
