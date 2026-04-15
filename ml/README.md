# YOLO Medical Scan Setup

This project can use a local YOLO model for `skin` and `dental` scan screening.

## 1. Train a model

Prepare a YOLO-format dataset and a dataset YAML file for each scan type.

Starter dataset YAML files are included here:

- `datasets/skin/data.yaml`
- `datasets/dental/data.yaml`
- `datasets/dental/dental.yaml`

Expected folder structure:

- `datasets/skin/images/train`
- `datasets/skin/images/val`
- `datasets/skin/images/test`
- `datasets/skin/labels/train`
- `datasets/skin/labels/val`
- `datasets/skin/labels/test`
- `datasets/dental/images/train`
- `datasets/dental/images/val`
- `datasets/dental/images/test`
- `datasets/dental/labels/train`
- `datasets/dental/labels/val`
- `datasets/dental/labels/test`

Validate a dataset before training:

```powershell
npm run yolo:validate:skin
npm run yolo:validate:dental
```

Create more training samples from your existing labeled images:

```powershell
npm run yolo:augment:skin
npm run yolo:augment:dental
```

This augmentation step creates extra copies of labeled training images using:

- brightness adjustment
- contrast adjustment
- color variation
- light blur
- horizontal flip

Only use it after you already have real labeled medical images in the dataset folders.

Example commands:

```powershell
python ml/augment_yolo_dataset.py --scan-type skin --split train --copies 3
python ml/augment_yolo_dataset.py --scan-type dental --split train --copies 3
python ml/train_yolo.py --scan-type skin --data datasets/skin/data.yaml --epochs 80
python ml/train_yolo.py --scan-type dental --data datasets/dental/dental.yaml --epochs 80
```

Expected trained weights:

- `models/yolo/skin/best.pt`
- `models/yolo/dental/best.pt`

You can also place custom weights here instead:

- `models/yolo/skin.pt`
- `models/yolo/dental.pt`

## 2. Start the local YOLO service

```powershell
python ml/yolo_service.py
```

The frontend expects the service at:

- `http://127.0.0.1:8765/predict`

## 3. What the app does

When a user uploads a skin or dental image, the app sends the image to the local YOLO service.

The service:

- loads the trained model for the selected scan type
- runs detection
- draws detection boxes on the image
- returns labels, confidence scores, and a screening summary

## Important

Medical accuracy depends entirely on the dataset quality, labeling quality, and trained weights.
Do not use general-purpose YOLO weights for medical diagnosis claims.

## PDF-derived dental guidance

If you have descriptive clinical documents instead of ready YOLO labels, use them as annotation guidance rather than as direct training data.

This project now includes:

- `ml/dental_annotation_guide.md`

Use that file to convert domain knowledge into a consistent tooth-level labeling process before training.

For the first dental detector, the project now aligns to this class mapping:

- `0: tooth`
- `1: caries_region`
- `2: impacted_tooth`
- `3: periapical_lesion`
- `4: restoration`
