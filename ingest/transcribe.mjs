#!/usr/bin/env node
// transcribe.mjs — audio notes → consented corpus text, fully offline.
//
//   node ingest/transcribe.mjs <audio-file> [--out corpus/<name>.md] [--lang en]
//
// ffmpeg extracts 16 kHz mono PCM (whisper.cpp's miniaudio reads WAV/MP3 but
// not video containers); whisper.cpp transcribes. Paths are configurable so a
// fresh mage box can point at its own builds:
//
//   HH_WHISPER  path to whisper-cli(.exe)
//   HH_WHISPER_MODEL  path to a ggml model file
//   HH_FFMPEG   path to ffmpeg(.exe)   (default: "ffmpeg" on PATH)
//
// The output is a corpus CANDIDATE: it lands in ingest/out/, NOT corpus/.
// Moving it into corpus/ is the steward's act, and requires a consent line in
// corpus/CONSENT_LEDGER.md first (the hard constraint reaches ingestion:
// tools/corpus_pack.mjs refuses unconsented files).

import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve, basename } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(join(here, '..'))

const argv = process.argv.slice(2)
const src = argv.find(a => !a.startsWith('--'))
const opt = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : dflt }
if (!src || !existsSync(src)) { console.error('usage: node ingest/transcribe.mjs <audio-file> [--out <path>] [--lang en]'); process.exit(2) }

const WHISPER = process.env.HH_WHISPER || 'C:/Users/mitch/whisper.cpp-master/build/bin/Release/whisper-cli.exe'
const MODEL = process.env.HH_WHISPER_MODEL || 'C:/Users/mitch/whisper.cpp-master/models/ggml-large-v3-turbo-q5_0.bin'
const FFMPEG = process.env.HH_FFMPEG || 'ffmpeg'
const lang = opt('--lang', 'auto')

for (const [what, p, envVar] of [['whisper-cli', WHISPER, 'HH_WHISPER'], ['whisper model', MODEL, 'HH_WHISPER_MODEL']]) {
  if (!existsSync(p)) { console.error(`transcribe: ${what} not found at ${p} — set $${envVar} (see mage/MACHINE_SETUP.md)`); process.exit(1) }
}

const outDir = join(repo, 'ingest', 'out')
mkdirSync(outDir, { recursive: true })
const stem = basename(src).replace(/\.[^.]+$/, '')
const outMd = resolve(opt('--out', join(outDir, `${stem}.md`)))

// ---- 1. ffmpeg → 16 kHz mono wav -------------------------------------------
const wav = join(outDir, `${stem}.16k.wav`)
const ff = spawnSync(FFMPEG, ['-y', '-i', resolve(src), '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', wav], { encoding: 'utf8' })
if (ff.status !== 0) { console.error('transcribe: ffmpeg failed:\n' + (ff.stderr || '').slice(-800)); process.exit(1) }

// ---- 2. whisper.cpp ---------------------------------------------------------
const wargs = ['-m', MODEL, '-f', wav, '-otxt', '-of', join(outDir, stem)]
if (lang !== 'auto') wargs.push('-l', lang)
const w = spawnSync(WHISPER, wargs, { encoding: 'utf8' })
if (w.status !== 0) { console.error('transcribe: whisper-cli failed:\n' + (w.stderr || '').slice(-800)); process.exit(1) }
const text = readFileSync(join(outDir, `${stem}.txt`), 'utf8').trim()
rmSync(wav, { force: true })

// ---- 3. corpus candidate ----------------------------------------------------
writeFileSync(outMd, [
  `# Audio note — ${basename(src)}`,
  '',
  `- source: ${basename(src)}`,
  `- transcribed: whisper.cpp (${basename(MODEL)})`,
  `- status: CANDIDATE — not yet corpus. To admit: (1) the speaker signs a`,
  `  consent line in corpus/CONSENT_LEDGER.md naming this file's corpus path,`,
  `  (2) the week's steward moves it to corpus/ and logs the fold.`,
  '',
  '---',
  '',
  text,
  '',
].join('\n'))

console.log(`candidate written: ${outMd}`)
console.log('next: consent line in corpus/CONSENT_LEDGER.md, then the steward moves it into corpus/ (mage/STEWARD.md).')
