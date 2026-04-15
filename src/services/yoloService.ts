export type ScanType = 'skin' | 'dental';

export type YoloDetection = {
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
};

export type YoloDiagnosisResult = {
  scanType: ScanType;
  modelName: string;
  summary: string;
  findings: string[];
  detections: YoloDetection[];
  annotatedImage: string | null;
  warning?: string | null;
};

export type YoloServiceStatus = {
  ok: boolean;
  service: 'online' | 'offline';
  availableModels: {
    skin: boolean;
    dental: boolean;
  };
};

const YOLO_API_URL = 'http://127.0.0.1:8765/predict';
const YOLO_HEALTH_URL = 'http://127.0.0.1:8765/health';

export async function getYoloStatus(): Promise<YoloServiceStatus> {
  try {
    const response = await fetch(YOLO_HEALTH_URL);
    const data = (await response.json()) as YoloServiceStatus;

    if (!response.ok) {
      throw new Error('YOLO health endpoint failed.');
    }

    return data;
  } catch {
    return {
      ok: false,
      service: 'offline',
      availableModels: {
        skin: false,
        dental: false,
      },
    };
  }
}

export async function diagnoseWithYolo(image: string, scanType: ScanType): Promise<YoloDiagnosisResult> {
  let response: Response;
  try {
    response = await fetch(YOLO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
        scanType,
      }),
    });
  } catch {
    throw new Error(
      'The local YOLO service is not reachable. Start it with `npm run yolo:serve` or `python ml/yolo_service.py`.',
    );
  }

  const data = (await response.json().catch(() => null)) as
    | (YoloDiagnosisResult & {error?: string})
    | {error?: string}
    | null;

  if (!response.ok) {
    throw new Error(data?.error || 'YOLO service is unavailable.');
  }

  if (!data || !('summary' in data) || !('modelName' in data) || !('detections' in data) || !('findings' in data)) {
    throw new Error('YOLO service returned an invalid response.');
  }

  return data;
}
