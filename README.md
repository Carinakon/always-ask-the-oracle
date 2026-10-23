# 🔮 Always Ask the Oracle

A fun oracle website that shows what the **temperature** setting of a generative AI model does.
Ask any question, then move the temperature slider:

| Temperature | Persona | Style |
|---|---|---|
| 0.00 – 0.30 | The Sober Advisor | predictable, formal, practical |
| 0.35 – 0.65 | The Wise Mystic | thoughtful, a little poetic |
| 0.70 – 1.00 | Madame Temperatura | dramatic fortune teller |
| 1.05 – 1.30 | The Cosmic Chaos Oracle | unpredictable, absurd, hilarious |

The whole page changes with the slider: colours, fonts, stars, a psychedelic background and a wobbling title. After every answer a witch flies across the screen on her broom.

## Files

- `index.html`: the website (HTML, CSS and JavaScript in one file)
- `api/oracle.js`: a Vercel serverless function that calls OpenAI with the chosen temperature. The API key stays on the server.

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com): **Add New → Project**, then import the repository. No build settings are needed.
3. Under **Environment Variables**, add `OPENAI_API_KEY` with your key.
4. Click **Deploy**.

Optional: set `OPENAI_MODEL` to change the model (default `gpt-4o-mini`). It must be a model that supports `temperature`, such as `gpt-4o-mini` or `gpt-4.1-mini`.

Opened locally (double-click `index.html`), the page runs in **demo mode** with built-in sample answers.
