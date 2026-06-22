// One-off: copy all Storage files from the OLD Supabase project to the NEW one.
// The DB dump already moved bucket definitions + object metadata; this moves the
// actual blobs. Safe to re-run — uploads use upsert.
//
// Usage (PowerShell), from the repo root:
//   $env:OLD_URL='https://xsukvxdcfeqcmoojwvvp.supabase.co'
//   $env:OLD_KEY='<old service_role key>'
//   $env:NEW_URL='https://okbqigqewzuunjaikwur.supabase.co'
//   $env:NEW_KEY='<new service_role key>'
//   node scripts/migrate-storage.mjs

import { createClient } from '@supabase/supabase-js'

const { OLD_URL, OLD_KEY, NEW_URL, NEW_KEY } = process.env
const BUCKETS = ['avatars', 'therapist-documents']

if (!OLD_URL || !OLD_KEY || !NEW_URL || !NEW_KEY) {
  console.error('Missing env vars. Need OLD_URL, OLD_KEY, NEW_URL, NEW_KEY.')
  process.exit(1)
}

const src = createClient(OLD_URL, OLD_KEY, { auth: { persistSession: false } })
const dst = createClient(NEW_URL, NEW_KEY, { auth: { persistSession: false } })

// Storage list() is non-recursive; folders come back with id === null.
async function listAll(client, bucket, prefix = '') {
  const out = []
  let offset = 0
  const limit = 100
  for (;;) {
    const { data, error } = await client.storage
      .from(bucket)
      .list(prefix, { limit, offset, sortBy: { column: 'name', order: 'asc' } })
    if (error) throw new Error(`list ${bucket}/${prefix}: ${error.message}`)
    if (!data || data.length === 0) break
    for (const entry of data) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name
      if (entry.id === null) out.push(...await listAll(client, bucket, path)) // folder → recurse
      else out.push(path)
    }
    if (data.length < limit) break
    offset += limit
  }
  return out
}

let grandOk = 0, grandFail = 0
for (const bucket of BUCKETS) {
  console.log(`\n=== Bucket: ${bucket} ===`)
  const { data: buckets } = await dst.storage.listBuckets()
  if (!buckets?.some(b => b.name === bucket)) {
    await dst.storage.createBucket(bucket, { public: bucket === 'avatars' })
    console.log(`  created bucket ${bucket} on new project`)
  }
  const files = await listAll(src, bucket)
  console.log(`  ${files.length} files to copy`)
  let ok = 0, fail = 0
  for (const path of files) {
    const { data: blob, error: dErr } = await src.storage.from(bucket).download(path)
    if (dErr) { console.error(`  DL FAIL ${path}: ${dErr.message}`); fail++; continue }
    const buf = Buffer.from(await blob.arrayBuffer())
    const { error: uErr } = await dst.storage
      .from(bucket)
      .upload(path, buf, { upsert: true, contentType: blob.type || undefined })
    if (uErr) { console.error(`  UL FAIL ${path}: ${uErr.message}`); fail++; continue }
    ok++
    if (ok % 10 === 0) console.log(`  ...${ok}/${files.length}`)
  }
  console.log(`  done: ${ok} copied, ${fail} failed`)
  grandOk += ok; grandFail += fail
}
console.log(`\nAll buckets processed. ${grandOk} copied, ${grandFail} failed.`)
process.exit(grandFail ? 1 : 0)
