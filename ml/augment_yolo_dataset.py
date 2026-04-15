from __future__ import annotations

import argparse
import random
import shutil
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Augment a YOLO dataset split with simple image transforms.")
    parser.add_argument("--scan-type", choices=["skin", "dental"], required=True)
    parser.add_argument("--split", choices=["train", "val"], default="train")
    parser.add_argument("--copies", type=int, default=3, help="How many augmented copies to create per image.")
    parser.add_argument("--seed", type=int, default=7, help="Random seed for deterministic augmentation.")
    return parser.parse_args()


def load_yolo_label(label_path: Path) -> str:
    return label_path.read_text(encoding="utf-8")


def save_augmented_pair(
    image: Image.Image,
    label_text: str,
    output_image_path: Path,
    output_label_path: Path,
) -> None:
    output_image_path.parent.mkdir(parents=True, exist_ok=True)
    output_label_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_image_path)
    output_label_path.write_text(label_text, encoding="utf-8")


def augment_image(image: Image.Image) -> Image.Image:
    augmented = image.copy()

    if random.random() > 0.5:
      augmented = ImageEnhance.Brightness(augmented).enhance(random.uniform(0.86, 1.18))

    if random.random() > 0.5:
      augmented = ImageEnhance.Contrast(augmented).enhance(random.uniform(0.88, 1.22))

    if random.random() > 0.5:
      augmented = ImageEnhance.Color(augmented).enhance(random.uniform(0.9, 1.15))

    if random.random() > 0.65:
      augmented = augmented.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.2, 1.1)))

    if random.random() > 0.5:
      augmented = augmented.transpose(Image.Transpose.FLIP_LEFT_RIGHT)

    return augmented


def main() -> None:
    args = parse_args()
    random.seed(args.seed)

    dataset_root = ROOT / "datasets" / args.scan_type
    image_dir = dataset_root / "images" / args.split
    label_dir = dataset_root / "labels" / args.split

    if not image_dir.exists():
        raise SystemExit(f"Image directory does not exist: {image_dir}")

    images = [path for path in image_dir.iterdir() if path.suffix.lower() in IMAGE_EXTENSIONS]
    if not images:
        raise SystemExit(f"No images found in {image_dir}. Add real labeled medical scans before augmentation.")

    generated = 0
    for image_path in images:
        label_path = label_dir / f"{image_path.stem}.txt"
        if not label_path.exists():
            print(f"Skipping {image_path.name} because label file is missing.")
            continue

        label_text = load_yolo_label(label_path)
        with Image.open(image_path) as img:
            rgb = img.convert("RGB")
            for index in range(args.copies):
                augmented = augment_image(rgb)
                output_image = image_dir / f"{image_path.stem}_aug_{index}{image_path.suffix.lower()}"
                output_label = label_dir / f"{image_path.stem}_aug_{index}.txt"
                save_augmented_pair(augmented, label_text, output_image, output_label)
                generated += 1

    print(f"Generated {generated} augmented samples for {args.scan_type} {args.split}.")


if __name__ == "__main__":
    main()
