// ollama_rt.mjs — the local-model rt driver: the mage holds the seats.
//
// Implements the engine's rt contract { agent, parallel, pipeline, phase, log }
// against a local Ollama server (default http://127.0.0.1:11434). Fully
// air-gap compatible: the only network hop is loopback/LAN to the mage box.
//
// Seats are PURE-DATA here (see harness.config.mjs header): the model returns
// JSON matching the seat schema; all hashing/persistence is code-side in
// run_round.mjs. Structured output uses Ollama's `format` parameter (a JSON
// schema); one repair retry on a parse/shape miss; null on hard failure — the
// engine's dead-seat accounting then reports an outage as an outage, never as
// exhaustion (GR-5).
//
// Concurrency defaults to 1: one local model serializes anyway, and a fair
// queue keeps seat order legible in the driver log. Raise it for a multi-GPU
// mage.

export function makeOllamaRt({ model, host = 'http://127.0.0.1:11434', concurrency = 1, timeoutMs = 300000, temperature = 0.2 } = {}) {
  if (!model) throw new Error('ollama_rt: model is required (e.g. --model llama3.1:8b-instruct-q8_0; ollama list shows what the box carries)')

  const requiredKeys = (schema) => (schema && Array.isArray(schema.required)) ? schema.required : []
  const shapeOk = (v, schema) => {
    if (!schema) return true
    if (typeof v !== 'object' || v === null) return false
    return requiredKeys(schema).every(k => k in v)
  }

  async function chatOnce(prompt, schema, seatModel) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(`${host}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: seatModel,
          stream: false,
          options: { temperature },
          ...(schema ? { format: schema } : {}),
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (!res.ok) throw new Error(`ollama ${res.status}: ${(await res.text()).slice(0, 300)}`)
      const data = await res.json()
      return data?.message?.content ?? ''
    } finally { clearTimeout(timer) }
  }

  const parseLoose = (text) => {
    try { return JSON.parse(text) } catch {}
    const m = /\{[\s\S]*\}/.exec(text)   // salvage a JSON object embedded in prose
    if (m) { try { return JSON.parse(m[0]) } catch {} }
    return null
  }

  // a tiny fair queue so `concurrency` bounds in-flight seat calls
  let active = 0
  const waiters = []
  const acquire = () => active < concurrency ? (active++, Promise.resolve()) : new Promise(r => waiters.push(r))
  const release = () => { active--; const w = waiters.shift(); if (w) { active++; w() } }

  const rt = {
    async agent(prompt, opts = {}) {
      const label = opts.label || '(unlabelled)'
      const schema = opts.schema || null
      const seatModel = opts.model || model
      await acquire()
      try {
        let text = await chatOnce(prompt, schema, seatModel)
        if (!schema) return text   // chronicle seat: raw markdown
        let v = parseLoose(text)
        if (!shapeOk(v, schema)) {
          rt.log(`repair retry: ${label} (missing ${requiredKeys(schema).filter(k => !(v && k in v)).join(',') || 'parse'})`)
          text = await chatOnce(
            `Your previous answer did not match the required JSON schema.\nSchema (all "required" keys mandatory): ${JSON.stringify(schema)}\nPrevious answer:\n${String(text).slice(0, 4000)}\nReturn ONLY the corrected JSON object.`,
            schema, seatModel)
          v = parseLoose(text)
        }
        if (!shapeOk(v, schema)) { rt.log(`DEAD SEAT: ${label} — schema not satisfied after retry`); return null }
        return v
      } catch (e) {
        rt.log(`DEAD SEAT: ${label} — ${e.message}`)
        return null
      } finally { release() }
    },

    async parallel(thunks) {
      return Promise.all(thunks.map(t => Promise.resolve().then(t).catch(() => null)))
    },

    async pipeline(items, ...stages) {
      return Promise.all(items.map(async (item, i) => {
        let r = item
        try {
          for (const stage of stages) r = await stage(r, item, i)
          return r
        } catch { return null }
      }))
    },

    phase(title) { rt.onPhase && rt.onPhase(title); console.log(`── ${title}`) },
    log(msg) { console.log('   ' + msg) },
  }
  return rt
}
