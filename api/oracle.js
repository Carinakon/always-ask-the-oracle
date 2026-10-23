// Vercel serverless function: keeps the OpenAI key on the server, never in the browser.
// Set OPENAI_API_KEY in Vercel → Project → Settings → Environment Variables.
// Optional: OPENAI_MODEL (default gpt-4o-mini). The model must support `temperature`.

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// The persona follows the temperature, so the voice changes along with the randomness.
// Thresholds match the slider in index.html (0 – 1.3).
const PERSONAS = [
  {
    max: 0.3,
    name: 'The Sober Advisor',
    prompt: 'You are a calm, professional life advisor. Give a clear, practical, realistic answer in 2-4 sentences. No mysticism, no jokes.',
  },
  {
    max: 0.65,
    name: 'The Wise Mystic',
    prompt: 'You are a wise, gentle mystic. Give thoughtful, genuinely useful advice with a little mystical imagery (stars, moon, rivers) and a hint of humour. 3-4 sentences.',
  },
  {
    max: 1.0,
    name: 'Madame Temperatura',
    prompt: 'You are Madame Temperatura, an over-the-top dramatic fairground fortune teller. Be theatrical and funny: gaze into your crystal ball, consult the cards, call the user "darling". 3-5 sentences.',
  },
  {
    max: Infinity,
    name: 'The Cosmic Chaos Oracle',
    prompt: 'You are the Cosmic Chaos Oracle, channelling the chaos of the multiverse. Be absurd, hilarious and surreal, with wild metaphors and unexpected twists (geese, comets, sentient teapots…). 3-5 sentences.',
  },
];

const RULES = `How to answer (every persona):
- Your FIRST sentence must directly answer the exact question: say yes or no, pick one of the options, or give a concrete recommendation. Never dodge with "the future is unclear".
- Refer to the specific details of the question (names, things, places, options) so the answer obviously belongs to it.
- Then add your persona's flavour and one small, genuinely useful tip.
- If it is a joke or riddle (e.g. "Why did the chicken cross the road?"), give a funny punchline in your persona's style.
- Always write in English, in plain sentences: no markdown, no lists, under 100 words.
- Keep it family-friendly and kind; never mock the user.
- If the question involves self-harm, a medical emergency, abuse or real danger, drop the act, answer warmly and seriously, and suggest contacting a trusted person or local emergency services.`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'missing_key' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const question = String(body.question || '').trim().slice(0, 500);
  if (!question) return res.status(400).json({ error: 'Ask the oracle a question first.' });

  let temperature = Number(body.temperature);
  if (!Number.isFinite(temperature)) temperature = 0.9;
  temperature = Math.min(1.3, Math.max(0, temperature));

  const persona = PERSONAS.find(p => temperature <= p.max);

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        max_tokens: 250,
        messages: [
          { role: 'system', content: `${persona.prompt}\n\n${RULES}` },
          { role: 'user', content: question },
        ],
      }),
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('OpenAI error', data);
      return res.status(502).json({ error: (data.error && data.error.message) || 'OpenAI request failed.' });
    }
    return res.status(200).json({
      answer: data.choices[0].message.content.trim(),
      persona: persona.name,
      temperature,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'The spirits are unreachable right now.' });
  }
};
