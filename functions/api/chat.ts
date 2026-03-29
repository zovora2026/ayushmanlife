interface Env {
  ANTHROPIC_API_KEY?: string
}

interface ChatMessageInput {
  role: string
  content: string
}

interface RequestBody {
  messages: ChatMessageInput[]
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

const SYSTEM_PROMPT = `You are V-Care, the AI health assistant for AyushmanLife — an Indian healthcare platform. You assist patients with:

- Booking appointments with specialists
- Symptom assessment and triage guidance
- Medication reminders and drug information
- Insurance queries, claim status, and PMJAY/Ayushman Bharat eligibility
- Lab report interpretation
- Diet, nutrition, and wellness advice
- Mental health support and crisis resources
- Emergency guidance

Guidelines:
- Be empathetic, professional, and culturally sensitive to Indian patients.
- Use simple language. You may include common Hindi greetings like "Namaste" when appropriate.
- Always clarify that your responses are AI-generated and not a substitute for professional medical advice.
- For emergencies, immediately direct users to call 112 (National Emergency) or 108 (Ambulance).
- Reference Indian healthcare context: PMJAY, ABHA health IDs, Indian hospitals, INR currency, Indian dietary habits, etc.
- Format responses with clear headings, bullet points, and tables where helpful.
- Keep responses concise but thorough.`

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as RequestBody

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return jsonResponse({ error: 'Invalid request: messages array is required and must not be empty' }, 400)
    }

    const apiKey = context.env.ANTHROPIC_API_KEY

    // Mock mode when no API key is configured
    if (!apiKey) {
      return jsonResponse({
        mode: 'mock',
        message: 'Mock mode active',
      })
    }

    // Build the messages array for the Anthropic API.
    // Filter to only valid roles and ensure content is a string.
    const messages = body.messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: String(msg.content),
    }))

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text()
      console.error(`Anthropic API error (${anthropicResponse.status}): ${errorBody}`)
      return jsonResponse(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        502,
      )
    }

    const result = (await anthropicResponse.json()) as {
      content: { type: string; text: string }[]
      model: string
      usage: { input_tokens: number; output_tokens: number }
    }

    const assistantText =
      result.content
        ?.filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n') || ''

    return jsonResponse({
      role: 'assistant',
      content: assistantText,
      model: result.model,
      usage: result.usage,
    })
  } catch (error) {
    console.error('Chat API error:', error)

    if (error instanceof SyntaxError) {
      return jsonResponse({ error: 'Invalid JSON in request body' }, 400)
    }

    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}
