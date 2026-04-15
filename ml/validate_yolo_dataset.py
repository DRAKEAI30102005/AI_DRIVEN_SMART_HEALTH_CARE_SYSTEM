from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def count_files(path: Path, patterns: tuple[str, ...]) -> int:
    total = 0
    for pattern in patterns:
        total += len(list(path.glob(pattern)))
    return total


def describe_split(dataset_root: Path, split: str) -> tuple[int, int]:
    image_dir = dataset_root / "images" / split
    label_dir = dataset_root / "labels" / split

    image_count = count_files(image_dir, ("*.jpg", "*.jpeg", "*.png", "*.webp"))
    label_count = count_files(label_dir, ("*.txt",))
    return image_count, label_count


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate YOLO dataset folders before training.")
    parser.add_argument("--scan-type", choices=["skin", "dental"], required=True)
    args = parser.parse_args()

    dataset_root = ROOT / "datasets" / args.scan_type
    yaml_file = dataset_root / "data.yaml"

    print(f"Dataset root: {dataset_root}")
    print(f"Config file:  {yaml_file}")
    print()

    if not yaml_file.exists():
        raise SystemExit(f"Missing dataset YAML: {yaml_file}")

    total_images = 0
    total_labels = 0

    for split in ("train", "val", "test"):
        images, labels = describe_split(dataset_root, split)
        total_images += images
        total_labels += labels
        print(f"{split:<5} images={images:<4} labels={labels:<4}")

    print()
    if total_images == 0:
        raise SystemExit(
            f"No images were found for {args.scan_type}. Add labeled medical images to "
            f"{dataset_root / 'images'} and matching YOLO labels to {dataset_root / 'labels'}."
        )

    if total_labels == 0:
        raise SystemExit(
            f"No YOLO label files were found for {args.scan_type}. Add .txt annotation files under "
            f"{dataset_root / 'labels'}."
        )

    print("Dataset structure looks ready for YOLO training.")


if __name__ == "__main__":
    main()
