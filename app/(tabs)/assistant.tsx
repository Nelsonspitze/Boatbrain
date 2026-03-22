import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBoatsStore } from '../../lib/store/boats';
import { askAI, AiMode } from '../../lib/ai/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const MODES: { key: AiMode; label: string; icon: string }[] = [
  { key: 'troubleshoot', label: 'Troubleshoot', icon: 'build' },
  { key: 'maintain', label: 'Maintain', icon: 'calendar' },
  { key: 'parts', label: 'Parts', icon: 'search' },
  { key: 'general', label: 'General', icon: 'chatbubble' },
];

export default function AssistantScreen() {
  const { boats, activeBoatId, getBoatSystems, getBoatComponents } = useBoatsStore();
  const activeBoat = boats.find((b) => b.id === activeBoatId) ?? boats[0];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AiMode>('general');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const send = async () => {
    if (!input.trim() || !activeBoat) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const [systemsList, componentsList] = await Promise.all([
        getBoatSystems(activeBoat.id),
        getBoatComponents(activeBoat.id),
      ]);

      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await askAI(
        userMsg.content,
        { boat: activeBoat, systemsList, componentsList },
        mode,
        history,
      );

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: response },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I could not reach the AI. Please check your connection.',
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  if (!activeBoat) {
    return (
      <View style={styles.centered}>
        <Ionicons name="boat-outline" size={48} color="#94a3b8" />
        <Text style={styles.noBoatText}>Add a boat first to use the AI assistant.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Mode selector */}
      <View style={styles.modeBar}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeBtn, mode === m.key && styles.modeBtnActive]}
            onPress={() => setMode(m.key)}
          >
            <Ionicons
              name={m.icon as any}
              size={14}
              color={mode === m.key ? '#fff' : '#64748b'}
            />
            <Text style={[styles.modeBtnText, mode === m.key && styles.modeBtnTextActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyChatText}>
              Ask anything about {activeBoat.name}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAssistant,
              ]}
            >
              {item.content}
            </Text>
          </View>
        )}
      />

      {isLoading && (
        <View style={styles.typing}>
          <ActivityIndicator size="small" color="#1a6fb5" />
          <Text style={styles.typingText}>BoatBrain is thinking…</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={`Ask about ${activeBoat.name}…`}
          placeholderTextColor="#94a3b8"
          multiline
          returnKeyType="default"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={!input.trim()}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f7ff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  noBoatText: { color: '#64748b', marginTop: 12, textAlign: 'center' },
  modeBar: {
    flexDirection: 'row',
    padding: 8,
    gap: 6,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0effe',
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  modeBtnActive: { backgroundColor: '#1a6fb5' },
  modeBtnText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  modeBtnTextActive: { color: '#fff' },
  messageList: { padding: 16, gap: 12, flexGrow: 1 },
  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyChatText: { color: '#94a3b8', marginTop: 12, fontSize: 15 },
  bubble: { maxWidth: '82%', borderRadius: 16, padding: 12 },
  bubbleUser: { backgroundColor: '#1a6fb5', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleAssistant: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAssistant: { color: '#0a1628' },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  typingText: { color: '#64748b', fontSize: 13 },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0effe',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0a1628',
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1a6fb5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
