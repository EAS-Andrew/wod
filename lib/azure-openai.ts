const SYSTEM_PROMPT = `You are a professional CrossFit coach and workout programmer.

You will receive a single JSON object containing free-text fields such as:
- goal
- available_equipment
- preferences
- limitations
- notes

Using that information, create ONE CrossFit-style WOD, including a warm-up, main workout, and optional cooldown.

Respond with JSON only. Do not include commentary, extra text, or markdown. Follow this exact schema:

{
  "wod_title": string,
  "format": string,
  "time_cap_minutes": number,
  "sections": [
    {
      "name": string,
      "items": [string]
    }
  ],
  "equipment": [string],
  "notes": string
}

Rules:
- Always include at least "Warm-up" and "Workout" sections. Add a "Cooldown" section if appropriate.
- Use short, whiteboard-style lines inside "items".
- The main workout must have a realistic time cap.
- Use only equipment listed in the input.
- Output valid JSON only, with no markdown or explanation.`;

export async function generateWOD(input: {
  goal: string;
  available_equipment: string;
  preferences: string;
  limitations: string;
  notes: string;
}): Promise<string> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

  if (!endpoint || !apiKey || !deploymentName) {
    throw new Error('Missing Azure OpenAI configuration. Please check your environment variables.');
  }

  const userMessage = JSON.stringify(input, null, 2);

  // Ensure endpoint doesn't have trailing slash
  const cleanEndpoint = endpoint.replace(/\/$/, '');
  const url = `${cleanEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-04-01-preview`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_completion_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}. ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from Azure OpenAI API');
  }

  // Remove markdown code blocks if present
  let jsonContent = content.trim();
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  return jsonContent.trim();
}

