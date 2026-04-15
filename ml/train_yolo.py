from __future__ import annotations

import argparse
from pathlib import Path

from ultralytics import YOLO

ROOT = Path(__file__).resolve().parents[1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train a YOLO model for medical image screening.")
    parser.add_argument("--scan-type", choices=["skin", "dental"], required=True, help="Which medical scan type to train.")
    parser.add_argument("--data", required=True, help="Path to the YOLO dataset YAML file.")
    parser.add_argument("--epochs", type=int, default=60, help="Number of training epochs.")
    parser.add_argument("--imgsz", type=int, default=640, help="Training image size.")
    parser.add_argument("--model", default="yolov8n.pt", help="Base YOLO checkpoint for transfer learning.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    model = YOLO(args.model)
    project_dir = ROOT / "models" / "yolo"
    run_name = args.scan_type

    results = model.train(
        data=args.data,
        epochs=args.epochs,
        imgsz=args.imgsz,
        project=str(project_dir),
        name=run_name,
        exist_ok=True,
    )

    print("Training finished.")
    print(f"Best weights should be available in: {project_dir / run_name / 'weights' / 'best.pt'}")
    print(results)


if __name__ == "__main__":
    main()
