export interface GenrePrediction {
  genre: string;
  confidence: number;
  percentage: string;
}

export interface PredictionResponse {
  success: boolean;
  top_genre: GenrePrediction | null;
  predicted_genres: GenrePrediction[];
  all_predictions: GenrePrediction[];
  used_fallback: boolean;
  threshold_used: number;
  inference_time_ms: number;
}

export interface ModelInfoResponse {
  product_name: string;
  tagline: string;
  architecture: {
    backbone: string;
    input_resolution: string;
    classification_head: string;
    loss_function: string;
    optimizer: string;
    prediction_threshold: number;
    top_k_fallback: number;
  };
  classes: string[];
  classes_count: number;
  history: {
    stage1?: {
      auc?: number[];
      binary_accuracy?: number[];
      loss?: number[];
      precision?: number[];
      recall?: number[];
      val_auc?: number[];
      val_binary_accuracy?: number[];
      val_loss?: number[];
      val_precision?: number[];
      val_recall?: number[];
    };
  };
  dataset: {
    total_cataloged: number | null;
    clean_posters_count: number | null;
  };
}

export interface SamplePoster {
  id: string;
  title: string;
  official_genres: string[];
  image_url: string;
  poster_url?: string;
}

export interface HealthStatus {
  status: 'online' | 'degraded' | 'offline';
  model_ready: boolean;
  backbone?: string;
  classes_count?: number;
  default_threshold?: number;
  latency_ms?: number;
}
