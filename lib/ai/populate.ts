import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
});

export interface PrePopulatedSystem {
  name: string;
  category:
    | 'electrics'
    | 'plumbing'
    | 'navigation'
    | 'engine'
    | 'sails'
    | 'safety'
    | 'communication'
    | 'other';
  components: {
    name: string;
    make?: string;
    model?: string;
    notes?: string;
    partNumber?: string;
  }[];
}

export async function populateBoatSystems(
  make: string,
  model: string,
  year: number,
): Promise<PrePopulatedSystem[]> {
  const prompt = `You are a marine systems expert. Based on your knowledge of the ${year} ${make} ${model} sailboat, provide a comprehensive list of its typical onboard systems and components.

Search your knowledge for:
- Standard factory-fitted equipment for this boat model and year
- Common engine choices (with make/model)
- Navigation electronics typically fitted
- Electrical system details (battery bank, charger, inverter)
- Plumbing systems (bilge pumps, water makers, tanks)
- Safety equipment
- Sail handling systems
- Communication equipment (VHF, AIS, etc.)

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "name": "System Name",
    "category": "electrics|plumbing|navigation|engine|sails|safety|communication|other",
    "components": [
      {
        "name": "Component Name",
        "make": "Manufacturer",
        "model": "Model number or name",
        "notes": "Any useful notes about this component",
        "partNumber": "Part number if known"
      }
    ]
  }
]

Be as specific as possible. If you are not sure about a specific component, provide a reasonable best guess for a boat of this type, make, model and year. Include at least 6 systems.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  // Strip any markdown code fences if present
  const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return parsed as PrePopulatedSystem[];
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }
}
