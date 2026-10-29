import type { PredictionResponse, ModelInfoResponse, SamplePoster, HealthStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  /**
   * Check model backend health and latency
   */
  async checkHealth(): Promise<HealthStatus> {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/health`, {
        headers: { Accept: 'application/json' },
      });
      const latency = Math.round(performance.now() - start);
      if (!res.ok) {
        return { status: 'degraded', model_ready: false, latency_ms: latency };
      }
      const data = await res.json();
      return {
        ...data,
        latency_ms: latency,
      };
    } catch {
      return { status: 'offline', model_ready: false };
    }
  },

  /**
   * Fetch model architecture, metrics, and class definitions
   */
  async getModelInfo(): Promise<ModelInfoResponse> {
    const res = await fetch(`${API_BASE}/model-info`);
    if (!res.ok) {
      throw new Error(`Failed to load model intelligence: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Fetch curated sample posters from dataset
   */
  async getSamples(limit = 12): Promise<{ samples: SamplePoster[]; count: number }> {
    const res = await fetch(`${API_BASE}/samples?limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Failed to load samples: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Predict genre for an uploaded image file
   */
  async predictImage(file: File, threshold = 0.35): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('threshold', threshold.toString());

    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Prediction failed' }));
      throw new Error(errData.detail || `Inference error (${res.status})`);
    }

    return res.json();
  },

  /**
   * Predict genre for a server-side sample image
   */
  async predictSample(filename: string, threshold = 0.35): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE}/predict-sample`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, threshold }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: 'Sample prediction failed' }));
      throw new Error(errData.detail || `Inference error (${res.status})`);
    }

    return res.json();
  },

  /**
   * Get full URL for a sample image asset
   */
  getSampleImageUrl(pathOrFilename: string): string {
    if (pathOrFilename.startsWith('http://') || pathOrFilename.startsWith('https://')) {
      return pathOrFilename;
    }
    if (pathOrFilename.startsWith('/api/')) {
      return pathOrFilename;
    }
    return `${API_BASE}/sample-image/${encodeURIComponent(pathOrFilename)}`;
  },
};
