const fs = require('fs');
const path = require('path');

/**
 * NugenAlignmentService
 * Implements the official Nugen model alignment & customization workflow
 * according to the official Nugen API specification (https://docs.nugen.in).
 */
class NugenAlignmentService {
  constructor() {
    this.baseUrl = (process.env.NUGEN_BASE_URL || 'https://api.nugen.in').replace(/\/+$/, '');
  }

  getApiKey() {
    return process.env.NUGEN_API_KEY || '';
  }

  getHeaders(isMultipart = false) {
    const apiKey = this.getApiKey();
    const headers = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  /**
   * 1. List Available Base Models
   * GET /api/v3/models/base
   */
  async listBaseModels(options = {}) {
    const query = new URLSearchParams();
    if (options.limit) query.append('limit', options.limit);
    if (options.offset) query.append('offset', options.offset);
    if (options.status) query.append('status', options.status);

    const url = `${this.baseUrl}/api/v3/models/base${query.toString() ? `?${query.toString()}` : ''}`;
    console.log('[NUGEN] Listing base models from:', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`[NUGEN] Failed to list base models (${res.status}): ${errText}`);
    }

    return res.json();
  }

  /**
   * 2. Upload Domain Documents for Alignment
   * POST /api/v3/documents/create
   * Accepts text-based files and uploads multipart/form-data
   * @param {string[]} filePaths - Array of absolute file paths to upload
   * @param {string[]} categories - Optional category tags
   */
  async uploadDocuments(filePaths = [], categories = ['hospitality-operations', 'resort360']) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('[NUGEN] NUGEN_API_KEY is required to upload documents.');
    }

    const formData = new FormData();

    for (const filePath of filePaths) {
      if (!fs.existsSync(filePath)) {
        throw new Error(`[NUGEN] Document file not found: ${filePath}`);
      }
      const filename = path.basename(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const blob = new Blob([content], { type: 'text/plain' });
      formData.append('files', blob, filename);
    }

    if (Array.isArray(categories)) {
      categories.forEach((cat) => formData.append('categories', cat));
    }

    const url = `${this.baseUrl}/api/v3/documents/create`;
    console.log(`[NUGEN] Uploading ${filePaths.length} documents to:`, url);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`[NUGEN] Document upload failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    console.log('[NUGEN] Documents uploaded successfully. IDs:', data.document_ids);
    return data;
  }

  /**
   * 3. Check Document Processing Status
   * GET /api/v3/documents/{id}/status
   */
  async getDocumentStatus(documentId) {
    const url = `${this.baseUrl}/api/v3/documents/${documentId}/status`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`[NUGEN] Failed to get document status for ${documentId} (${res.status}): ${errText}`);
    }

    return res.json();
  }

  /**
   * 4. Create Domain Alignment Project
   * POST /api/v3/alignment-projects/create
   * @param {Object} options
   * @param {string} options.alignment_name
   * @param {string} options.base_model_id (e.g. 'qwen-v2p5-0p5b-instruct')
   * @param {string[]} options.document_ids
   * @param {string} [options.description]
   */
  async createAlignmentProject(options) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('[NUGEN] NUGEN_API_KEY is required to create alignment project.');
    }

    const payload = {
      alignment_name: options.alignment_name || 'Resort 360 Hospitality Intelligence Alignment',
      base_model_id: options.base_model_id || 'qwen-v2p5-0p5b-instruct',
      document_ids: options.document_ids || [],
      description: options.description || 'Domain alignment for Resort 360 multi-agent hospitality operations and arbitration',
    };

    if (options.workflow_id) payload.workflow_id = options.workflow_id;
    if (options.benchmark_id) payload.benchmark_id = options.benchmark_id;

    const url = `${this.baseUrl}/api/v3/alignment-projects/create`;
    console.log('[NUGEN] Creating alignment project:', payload.alignment_name, 'on base model:', payload.base_model_id);

    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`[NUGEN] Failed to create alignment project (${res.status}): ${errText}`);
    }

    const data = await res.json();
    console.log('[NUGEN] Alignment project initiated. Alignment ID:', data.alignment_id, 'Status:', data.status);
    return data;
  }

  /**
   * 5. Poll Alignment Status
   * GET /api/v3/alignment-projects/{alignment_id}/status
   */
  async getAlignmentStatus(alignmentId) {
    const url = `${this.baseUrl}/api/v3/alignment-projects/${alignmentId}/status`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`[NUGEN] Failed to get alignment status (${res.status}): ${errText}`);
    }

    return res.json();
  }

  /**
   * 6. Retrieve Detailed Alignment Project Information
   * GET /api/v3/alignment/{alignment_id}
   */
  async getAlignmentProject(alignmentId) {
    const url = `${this.baseUrl}/api/v3/alignment/${alignmentId}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`[NUGEN] Failed to get alignment project detail (${res.status}): ${errText}`);
    }

    return res.json();
  }

  /**
   * 7. List User's Domain-Aligned Models
   * GET /api/v3/models/aligned
   */
  async listAlignedModels(options = {}) {
    const query = new URLSearchParams();
    if (options.status) query.append('status', options.status);
    if (options.limit) query.append('limit', options.limit);
    if (options.offset) query.append('offset', options.offset);

    const url = `${this.baseUrl}/api/v3/models/aligned${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`[NUGEN] Failed to list aligned models (${res.status}): ${errText}`);
    }

    return res.json();
  }

  /**
   * 8. Deploy Aligned Model for Inference
   * POST /api/v3/models/{model_id}/deployment
   */
  async deployAlignedModel(modelId, early = false) {
    const url = `${this.baseUrl}/api/v3/models/${modelId}/deployment${early ? '?early=true' : ''}`;
    console.log(`[NUGEN] Deploying aligned model: ${modelId}`);

    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`[NUGEN] Deployment request failed (${res.status}): ${errText}`);
    }

    return res.json();
  }

  /**
   * 9. Check Deployment Status
   * GET /api/v3/models/{model_id}/deployment/status
   */
  async getDeploymentStatus(modelId) {
    const url = `${this.baseUrl}/api/v3/models/${modelId}/deployment/status`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`[NUGEN] Failed to get deployment status (${res.status}): ${errText}`);
    }

    return res.json();
  }
}

module.exports = new NugenAlignmentService();
