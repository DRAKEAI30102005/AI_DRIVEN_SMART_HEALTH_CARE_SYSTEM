from __future__ import annotations

import base64
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from io import BytesIO
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parents[1]
HOST = "127.0.0.1"
PORT = 8765

MODEL_PATHS = {
    "skin": [
        ROOT / "models" / "yolo" / "skin" / "best.pt",
        ROOT / "models" / "yolo" / "skin.pt",
    ],
    "dental": [
        ROOT / "models" / "yolo" / "dental" / "best.pt",
        ROOT / "models" / "yolo" / "dental.pt",
    ],
}

MODEL_CACHE: dict[str, YOLO] = {}


def get_model_path(scan_type: str) -> Path | None:
    for candidate in MODEL_PATHS.get(scan_type, []):
        if candidate.exists():
            return candidate
    return None


def get_model(scan_type: str) -> tuple[YOLO | None, str | None]:
    if scan_type in MODEL_CACHE:
        model_path = get_model_path(scan_type)
        return MODEL_CACHE[scan_type], str(model_path.name) if model_path else None

    model_path = get_model_path(scan_type)
    if not model_path:
        return None, None

    MODEL_CACHE[scan_type] = YOLO(str(model_path))
    return MODEL_CACHE[scan_type], model_path.name


def decode_image(data_url: str) -> Image.Image:
    payload = data_url.split(",", 1)[1] if "," in data_url else data_url
    raw = base64.b64decode(payload)
    image = Image.open(BytesIO(raw)).convert("RGB")
    return image


def annotate_image(image: Image.Image, detections: list[dict[str, Any]]) -> str:
    annotated = image.copy()
    draw = ImageDraw.Draw(annotated)

    for detection in detections:
        x1, y1, x2, y2 = detection["bbox"]
        label = detection["label"]
        confidence = detection["confidence"]
        outline = "#22c55e"
        fill = "#0f172acc"
        draw.rectangle((x1, y1, x2, y2), outline=outline, width=3)
        draw.rectangle((x1, max(0, y1 - 26), min(annotated.width, x1 + 190), y1), fill=fill)
        draw.text((x1 + 8, max(2, y1 - 22)), f"{label} {confidence:.0%}", fill="#dcfce7")

    buffer = BytesIO()
    annotated.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def summarize(scan_type: str, detections: list[dict[str, Any]]) -> tuple[str, list[str]]:
    if not detections:
        return (
            f"No trained {scan_type} YOLO findings were detected in the uploaded scan. A clinician should still review unclear symptoms or suspicious images.",
            [
                "No YOLO detection boxes were produced on this image.",
                "If this seems wrong, retrain the model with more labeled medical examples.",
                "Use specialist review for confirmation.",
            ],
        )

    labels = [d["label"] for d in detections]
    avg_conf = sum(d["confidence"] for d in detections) / len(detections)
    unique_labels = ", ".join(sorted(set(labels)))
    findings = [
        f"{len(detections)} region(s) were highlighted by the YOLO model.",
        f"Detected categories: {unique_labels}.",
        f"Average confidence score: {avg_conf:.0%}.",
        "Predictions should be treated as AI screening support and confirmed clinically.",
    ]
    summary = (
        f"The local YOLO {scan_type} model highlighted {len(detections)} suspicious region(s) in the uploaded scan. "
        f"The strongest predicted classes were {unique_labels}. Review the marked image and use this result as a preliminary screening aid rather than a final diagnosis."
    )
    return summary, findings


class YoloHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self._send_json(200, {"ok": True})

    def do_GET(self) -> None:
        if self.path != "/health":
            self._send_json(404, {"error": "Route not found."})
            return

        self._send_json(
            200,
            {
                "ok": True,
                "service": "online",
                "availableModels": {
                    "skin": get_model_path("skin") is not None,
                    "dental": get_model_path("dental") is not None,
                },
            },
        )

    def do_POST(self) -> None:
        if self.path != "/predict":
            self._send_json(404, {"error": "Route not found."})
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(content_length)

        try:
            payload = json.loads(raw.decode("utf-8"))
            image_data = payload.get("image", "")
            scan_type = payload.get("scanType", "")
        except Exception:
            self._send_json(400, {"error": "Invalid request payload."})
            return

        if scan_type not in ("skin", "dental"):
            self._send_json(400, {"error": "scanType must be skin or dental."})
            return

        model, model_name = get_model(scan_type)
        if not model or not model_name:
            self._send_json(
                400,
                {
                    "error": (
                        f"No trained YOLO weights found for {scan_type}. Add a model file at "
                        f"models/yolo/{scan_type}/best.pt or models/yolo/{scan_type}.pt, then start the service again."
                    )
                },
            )
            return

        try:
            image = decode_image(image_data)
            results = model.predict(source=np.array(image), conf=0.2, verbose=False)
            result = results[0]

            names = result.names
            detections: list[dict[str, Any]] = []
            if result.boxes is not None:
                for box in result.boxes:
                    cls_id = int(box.cls[0].item())
                    confidence = float(box.conf[0].item())
                    x1, y1, x2, y2 = [float(value) for value in box.xyxy[0].tolist()]
                    detections.append(
                        {
                            "label": names.get(cls_id, str(cls_id)) if isinstance(names, dict) else str(cls_id),
                            "confidence": confidence,
                            "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                        }
                    )

            summary, findings = summarize(scan_type, detections)
            annotated_image = annotate_image(image, detections) if detections else None

            self._send_json(
                200,
                {
                    "scanType": scan_type,
                    "modelName": model_name,
                    "summary": summary,
                    "findings": findings,
                    "detections": detections,
                    "annotatedImage": annotated_image,
                    "warning": "This output is a screening aid from a locally trained YOLO model and must be reviewed by a qualified clinician.",
                },
            )
        except Exception as error:
            self._send_json(500, {"error": f"YOLO inference failed: {error}"})


if __name__ == "__main__":
    print(f"Starting YOLO service on http://{HOST}:{PORT}")
    HTTPServer((HOST, PORT), YoloHandler).serve_forever()
