#!/usr/bin/env node

/**
 * Resort 360 — Nugen Domain Alignment Setup Script
 * 
 * Demonstrates and executes the official Nugen alignment pipeline:
 * 1. Base Model Discovery
 * 2. Document Upload (Domain Corpus)
 * 3. Alignment Project Creation
 * 4. Status Tracking
 * 5. Deployment Preparation
 */

const path = require('path');
const fs = require('fs');
try {
  require('../backend/node_modules/dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
} catch (e) {
  try { require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') }); } catch (_) {}
}

const nugenAlignmentService = require('../backend/src/services/nugen/nugenAlignmentService');

async function main() {
  console.log('====================================================');
  console.log(' RESORT 360 — NUGEN DOMAIN ALIGNMENT WORKFLOW');
  console.log('====================================================\n');

  const apiKey = process.env.NUGEN_API_KEY;
  const baseUrl = process.env.NUGEN_BASE_URL || 'https://api.nugen.in';

  console.log(`[Config] Base URL: ${baseUrl}`);
  console.log(`[Config] API Key: ${apiKey ? apiKey.slice(0, 6) + '...' + apiKey.slice(-4) : '(NOT CONFIGURED)'}\n`);

  if (!apiKey) {
    console.log('⚠️  NUGEN_API_KEY is not configured in backend/.env.');
    console.log('   To perform live cloud alignment on Nugen infrastructure:');
    console.log('   1. Sign up and obtain an API key at https://platform.nugen.in');
    console.log('   2. Add NUGEN_API_KEY=your_key to backend/.env');
    console.log('\n   Resort 360 will continue operating with built-in high-confidence');
    console.log('   domain-aligned intelligence simulation for demo presentation purposes.\n');
    process.exit(0);
  }

  try {
    // Step 1: Base Model Discovery
    console.log('--- Step 1: Discovering Alignment-Ready Base Models ---');
    const baseModelsRes = await nugenAlignmentService.listBaseModels({ limit: 10 });
    const models = baseModelsRes.models || [];
    console.log(`Found ${models.length} base models:`);
    models.forEach((m) => {
      console.log(` - ${m.model_id} (${m.model_name}) | Parameters: ${m.parameters} | Alignment Ready: ${m.alignment_ready}`);
    });

    const chosenBaseModel = models.find((m) => m.alignment_ready)?.model_id || 'qwen-v2p5-0p5b-instruct';
    console.log(`\nSelected Base Model for Alignment: ${chosenBaseModel}\n`);

    // Step 2: Upload Domain Documents
    console.log('--- Step 2: Uploading Resort 360 Operations Corpus ---');
    const handbookPath = path.join(__dirname, '..', 'data', 'nugen', 'resort360-operations-handbook.txt');
    if (!fs.existsSync(handbookPath)) {
      throw new Error(`Domain handbook not found at: ${handbookPath}`);
    }

    const uploadRes = await nugenAlignmentService.uploadDocuments(
      [handbookPath],
      ['hospitality-operations', 'resort360', 'vip-protocols']
    );

    const docIds = uploadRes.document_ids || [];
    console.log(`Uploaded document IDs: ${docIds.join(', ')}\n`);

    // Step 3: Create Alignment Project
    console.log('--- Step 3: Initiating Nugen Domain Alignment Project ---');
    const alignmentRes = await nugenAlignmentService.createAlignmentProject({
      alignment_name: 'Resort 360 Hospitality Domain Alignment',
      base_model_id: chosenBaseModel,
      document_ids: docIds,
      description: 'Aligning base model on luxury resort operations, VIP protocols, and multi-departmental arbitration',
    });

    const alignmentId = alignmentRes.alignment_id;
    console.log(`✅ Alignment Project Created Successfully!`);
    console.log(`Alignment ID: ${alignmentId}`);
    console.log(`Initial Status: ${alignmentRes.status}\n`);

    // Step 4: Check Status
    console.log('--- Step 4: Checking Alignment Status ---');
    const statusRes = await nugenAlignmentService.getAlignmentStatus(alignmentId);
    console.log(`Current Status: ${statusRes.status} | Queue: ${statusRes.queue_position || 'Running'}\n`);

    console.log('====================================================');
    console.log(' SUMMARY & NEXT STEPS');
    console.log('====================================================');
    console.log(`Update your backend/.env with:`);
    console.log(`NUGEN_ALIGNMENT_ID=${alignmentId}`);
    console.log(`NUGEN_MODEL_ID=alignment-${alignmentId}`);
    console.log(`AI_PROVIDER=nugen`);
    console.log('\nWhen training completes, deploy the model with:');
    console.log(`nugenAlignmentService.deployAlignedModel("${alignmentId}")`);
    console.log('====================================================\n');

  } catch (err) {
    console.error('❌ Error executing Nugen alignment setup:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
