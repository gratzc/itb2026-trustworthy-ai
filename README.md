# ITB 2026 — Trustworthy AI prompt-injection lab

Small BoxLang + MiniServer demo that drives a multi-level “Boxton” chat through [BoxLang AI (`bx-ai`)](https://ai.boxlang.io/). The app code uses the unified `aiChat()` API only; **which model runs (Gemini in the cloud vs. a model on your machine) is entirely controlled by `.boxlang.json`**.

## Prerequisites

- [BoxLang](https://boxlang.io/) runtime **1.8+**
- [MiniServer](https://boxlang.ortusbooks.com/getting-started/running-boxlang/miniserver) (or another BoxLang web runtime you already use)
- The **bx-ai** module — see [installation](https://ai.ortusbooks.com/getting-started/installation):
  ```bash
  install-bx-module bx-ai
  ```
  For a project-local install:
  ```bash
  install-bx-module bx-ai --local
  ```

## Run the lab

From the repository root (where `miniserver.json` lives):

```bash
miniserver
```

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/) (port comes from `miniserver.json`).

MiniServer loads environment variables from `webroot/.env`. Copy `webroot/.env.example` to `webroot/.env` when you first set up.

## AI backends: Gemini (default) vs. local

### Option A — Google Gemini (cloud)

This matches the comments in `webroot/.env.example`: set an API key and point bx-ai at Gemini.

1. Create `**/.boxlang.json**` at the **repository root** (same level as `miniserver.json`). This path is git-ignored so keys stay off git.
2. Use a configuration like:
  ```json
   {
     "modules": {
       "bxai": {
         "settings": {
           "provider": "gemini",
           "apiKey": "${GEMINI_API_KEY}",
           "defaultParams": {
             "model": "gemini-2.0-flash"
           }
         }
       }
     }
   }
  ```
3. In `webroot/.env`:
  ```bash
   GEMINI_API_KEY=your-key-here
  ```
   You can change the model with `BXAI_MODEL` only if your deployment tooling substitutes it into `.boxlang.json`; otherwise set `defaultParams.model` in JSON.

### Option B — Local model with Ollama (no Gemini key)

bx-ai’s **Ollama** provider runs chat against a server on your machine (default URL `http://localhost:11434`). No cloud API key is required.

1. **Install and start Ollama** — [https://ollama.ai](https://ollama.ai)
2. **Pull a chat model** (pick one you have disk/RAM for; examples):
  ```bash
   ollama pull llama3.2
  ```
   Smaller/faster options that still follow instructions reasonably well for demos include `qwen2.5:3b` or `llama3.2:3b`. Quality and “jailbreak” behavior will differ from Gemini.
3. Ensure the Ollama daemon is listening (usually automatic after install).
4. Create `**/.boxlang.json**` at the **repository root**:
  ```json
   {
     "modules": {
       "bxai": {
         "settings": {
           "provider": "ollama",
           "chatURL": "http://localhost:11434",
           "defaultParams": {
             "model": "llama3.2"
           }
         }
       }
     }
   }
  ```
   Use the same `model` string you passed to `ollama pull`.
5. You do **not** need `GEMINI_API_KEY` in `webroot/.env` for this mode.

**Why you might still see `qwen2.5:0.5b-instruct`:** In bx-ai 3.x, `OllamaService` seeds that model into the request before your module `defaultParams` are merged into the outgoing params struct, so bare `aiChat( messages )` can keep the built-in default. This repo’s `PromptLabPipeline.bx` passes `**params` built from `getModuleInfo("bxai").settings`** so your configured model always wins. If you use `**providers**` overrides, the key must match the service name `**Ollama**` (Pascal case) — that’s what `BaseService.configure()` looks up when merging `providers` (see [BoxLang AI docs](https://ai.ortusbooks.com/)).

**Remote or custom Ollama host:** In bx-ai **2.1.0+** you can use [predefined providers](https://ai.ortusbooks.com/getting-started/installation) with `options.baseURL` instead of `chatURL`; see the official installation page for the exact shape.

### Option C — Other local servers (LM Studio, vLLM, etc.)

bx-ai also supports **OpenAI-compatible** HTTP APIs. Point the OpenAI provider’s `baseUrl` at your local server’s `/v1` endpoint and set the model name your server exposes. Details: [BoxLang AI installation — module configuration](https://ai.ortusbooks.com/getting-started/installation) and provider setup guide linked from that page.

## Verify bx-ai

From the [docs](https://ai.ortusbooks.com/getting-started/installation), a minimal script:

```javascript
// test-ai.bxs
answer = aiChat( "Say hello!" )
println( answer )
```

```bash
boxlang test-ai.bxs
```

## Lab behavior note

Levels 2–5 rely on the model following system instructions and filters. **Smaller local models may leak, refuse, or derail differently than Gemini**, which is still useful for the workshop — but presenter hints and “expected” bypass text were written with a capable cloud model in mind.

## License

See [LICENSE](LICENSE).