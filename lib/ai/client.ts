import Anthropic from '@anthropic-ai/sdk';
import { boats, components, systems } from '../db/schema';

const anthropic = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
});

export type AiMode = 'troubleshoot' | 'maintain' | 'parts' | 'general';

export interface BoatContext {
  boat: typeof boats.$inferSelect;
  systemsList?: (typeof systems.$inferSelect)[];
  componentsList?: (typeof components.$inferSelect)[];
}

function buildSystemPrompt(context: BoatContext, mode: AiMode): string {
  const { boat, systemsList, componentsList } = context;

  const boatDesc = [
    `Boat: ${boat.name}`,
    boat.make && `Make: ${boat.make}`,
    boat.model && `Model: ${boat.model}`,
    boat.year && `Year: ${boat.year}`,
    boat.loa && `LOA: ${boat.loa}m`,
    boat.type && `Type: ${boat.type}`,
    boat.engineMake && `Engine: ${boat.engineMake} ${boat.engineModel ?? ''}`.trim(),
  ]
    .filter(Boolean)
    .join('\n');

  const systemsDesc =
    systemsList && systemsList.length > 0
      ? '\n\nOnboard systems:\n' +
        systemsList.map((s) => `- ${s.name} (${s.category})`).join('\n')
      : '';

  const componentsDesc =
    componentsList && componentsList.length > 0
      ? '\n\nKnown components:\n' +
        componentsList
          .map((c) => `- ${c.name}${c.make ? ` by ${c.make}` : ''}${c.model ? ` (${c.model})` : ''}`)
          .join('\n')
      : '';

  const modeInstructions: Record<AiMode, string> = {
    troubleshoot:
      'You are a marine systems expert helping diagnose and fix problems on a sailboat. Be specific, practical, and safety-conscious. Ask clarifying questions if needed.',
    maintain:
      'You are a marine maintenance specialist. Provide specific maintenance schedules, procedures, and tips for this boat and its components.',
    parts:
      'You are a marine parts specialist. Help identify exact part numbers, compatible alternatives, and where to source parts (online and local chandleries).',
    general:
      'You are a knowledgeable sailing and boat systems assistant. Help with any questions about this boat.',
  };

  return `${modeInstructions[mode]}

The owner is asking about their specific boat:
${boatDesc}${systemsDesc}${componentsDesc}

Always give advice specific to this boat's equipment when possible. Flag any safety concerns prominently.`;
}

export async function askAI(
  userMessage: string,
  context: BoatContext,
  mode: AiMode = 'general',
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
) {
  const systemPrompt = buildSystemPrompt(context, mode);

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return content.text;
}
