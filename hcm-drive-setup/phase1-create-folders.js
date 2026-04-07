/**
 * Heritage Craft Media — Phase 1: Google Drive Folder Creator
 *
 * This script creates the entire HCM Railway folder structure in Google Drive
 * using the Google Drive API v3.
 *
 * SETUP (run once):
 *   npm install googleapis
 *
 * CREDENTIALS:
 *   1. Go to https://console.cloud.google.com/
 *   2. Create a project → Enable "Google Drive API"
 *   3. Create OAuth 2.0 credentials (Desktop App type)
 *   4. Download credentials.json and place it in this folder
 *   5. Set DRIVE_ROOT_FOLDER_ID below (or leave blank to create at Drive root)
 *
 * RUN:
 *   node phase1-create-folders.js
 *
 * OUTPUT:
 *   folder-id-map.json — maps every folder name to its Drive ID
 *   (needed for Make.com automation setup in Phase 4)
 */

import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── CONFIG ────────────────────────────────────────────────────────────────
// Leave blank to create folders at the root of "My Drive"
// Or paste the folder ID from the URL of an existing parent folder
const DRIVE_ROOT_FOLDER_ID = '';

const CREDENTIALS_PATH = join(__dirname, 'credentials.json');
const TOKEN_PATH = join(__dirname, 'token.json');
const OUTPUT_PATH = join(__dirname, 'folder-id-map.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// ───────────────────────────────────────────────────────────────────────────

/**
 * The complete folder tree.
 * Each entry: { name, children?: [...], colour?: string }
 */
const FOLDER_TREE = [
  {
    name: '00 THE SIDING',
    key: 'siding',
  },
  {
    name: '01 TERMINAL A: SERVICES',
    key: 'terminalA',
    children: [
      {
        name: 'A.01 ACTIVE CLIENTS',
        key: 'a01',
        // Client sub-folders created automatically by Make.com (Scenario 4)
      },
      { name: 'A.02 SALES & QUOTES', key: 'a02' },
      {
        name: 'A.03 SERVICE ASSETS',
        key: 'a03',
        children: [{ name: 'Delivery SOPs', key: 'a03_sops' }],
      },
      { name: 'A.04 REPAIR SHED', key: 'a04' },
    ],
  },
  {
    name: '02 TERMINAL B: COURSES',
    key: 'terminalB',
    children: [
      { name: 'B.01 CURRICULUM', key: 'b01' },
      {
        name: 'B.02 PRODUCTION',
        key: 'b02',
        children: buildCourseSlots(50), // Creates B.02.001 through B.02.050
      },
      { name: 'B.03 EXPORTS', key: 'b03' },
      { name: 'B.OLD — Unsorted Rolling Stock', key: 'bOld' },
    ],
  },
  {
    name: '03 TERMINAL C: APPS',
    key: 'terminalC',
    // App sub-folders created manually per app (one per product)
    // Template structure documented below for reference:
    // C.01.1 ROADMAP & SPECS
    // C.01.2 UI & UX DESIGN
    // C.01.3 TECH & ASSETS
    // C.01.4 USER GUIDES
    // C.01.5 FEEDBACK
    // v1 ARCHIVE
  },
  {
    name: '04 TERMINAL D: FINANCE',
    key: 'terminalD',
    children: [
      { name: 'D.01 TAX & COMPLIANCE', key: 'd01' },
      {
        name: 'D.02 ACCOUNTS PAYABLE',
        key: 'd02',
        children: [
          { name: '2024', key: 'd02_2024' },
          { name: '2025', key: 'd02_2025' },
          { name: '2026', key: 'd02_2026' },
        ],
      },
      {
        name: 'D.03 ACCOUNTS RECEIVABLE',
        key: 'd03',
        children: [
          { name: '2024', key: 'd03_2024' },
          { name: '2025', key: 'd03_2025' },
          { name: '2026', key: 'd03_2026' },
        ],
      },
      {
        name: 'D.04 BANKING & STATEMENTS',
        key: 'd04',
        children: [
          { name: '2024', key: 'd04_2024' },
          { name: '2025', key: 'd04_2025' },
          { name: '2026', key: 'd04_2026' },
        ],
      },
    ],
  },
  {
    name: '05 THE STOCK YARD',
    key: 'stockYard',
    children: [
      { name: 'ARC-2024', key: 'arc2024' },
      { name: 'ARC-2025', key: 'arc2025' },
      { name: 'ARC-2026', key: 'arc2026' },
    ],
  },
];

/** Generates B.02.001 through B.02.050, each with the 6 assembly-line sub-folders */
function buildCourseSlots(count) {
  const slots = [];
  for (let i = 1; i <= count; i++) {
    const id = String(i).padStart(3, '0');
    slots.push({
      name: `B.02.${id} - [Course Name]`,
      key: `b02_${id}`,
      children: [
        { name: '01 RAW FOOTAGE', key: `b02_${id}_raw` },
        { name: '02 HEYGEN ASSETS', key: `b02_${id}_heygen` },
        { name: '03 PROJECT FILES', key: `b02_${id}_project` },
        { name: '04 VOICEOVERS & AUDIO', key: `b02_${id}_audio` },
        { name: '05 GRAPHICS & SLIDES', key: `b02_${id}_graphics` },
        { name: '00 REPAIR SHED', key: `b02_${id}_repair` },
      ],
    });
  }
  return slots;
}

// ─── AUTH ───────────────────────────────────────────────────────────────────
async function loadSavedCredentialsIfExist() {
  if (!existsSync(TOKEN_PATH)) return null;
  const content = readFileSync(TOKEN_PATH);
  const credentials = JSON.parse(content);
  return google.auth.fromJSON(credentials);
}

async function saveCredentials(client) {
  const content = readFileSync(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  writeFileSync(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) return client;
  client = await authenticate({ scopes: SCOPES, keyfilePath: CREDENTIALS_PATH });
  if (client.credentials) await saveCredentials(client);
  return client;
}

// ─── DRIVE HELPERS ──────────────────────────────────────────────────────────
async function createFolder(drive, name, parentId) {
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) metadata.parents = [parentId];

  const res = await drive.files.create({
    requestBody: metadata,
    fields: 'id, name',
  });

  console.log(`  ✅ Created: ${name} (${res.data.id})`);
  return res.data.id;
}

async function buildTree(drive, nodes, parentId, idMap) {
  for (const node of nodes) {
    const folderId = await createFolder(drive, node.name, parentId);
    idMap[node.key] = { name: node.name, id: folderId };

    if (node.children && node.children.length > 0) {
      await buildTree(drive, node.children, folderId, idMap);
    }
  }
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚂 Heritage Craft Media — Drive Folder Creator');
  console.log('='.repeat(50));

  if (!existsSync(CREDENTIALS_PATH)) {
    console.error('\n❌ credentials.json not found.');
    console.error('   Download it from Google Cloud Console and place it here:');
    console.error(`   ${CREDENTIALS_PATH}\n`);
    process.exit(1);
  }

  const auth = await authorize();
  const drive = google.drive({ version: 'v3', auth });

  const rootParent = DRIVE_ROOT_FOLDER_ID || null;
  console.log(`\n📁 Creating folders ${rootParent ? `inside folder: ${rootParent}` : 'at Drive root'}...\n`);

  const idMap = {};
  await buildTree(drive, FOLDER_TREE, rootParent, idMap);

  writeFileSync(OUTPUT_PATH, JSON.stringify(idMap, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('✅ All folders created successfully!');
  console.log(`📄 Folder ID map saved to: ${OUTPUT_PATH}`);
  console.log('\n⚠️  Next steps:');
  console.log('   1. Set folder colours manually in Google Drive (right-click → Change colour)');
  console.log('   2. Use folder-id-map.json when configuring Make.com scenarios (Phase 4)');
  console.log('   3. Rename B.02.001 through .050 with real course names as you create them');
  console.log('\n🛑 HARD STOP — Report back to Claude with confirmation before Phase 2.\n');
}

main().catch(console.error);
