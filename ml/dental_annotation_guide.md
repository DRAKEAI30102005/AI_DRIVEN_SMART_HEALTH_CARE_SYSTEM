# Dental Annotation Guide From PDF

This guide converts the uploaded PDF content into a practical annotation blueprint for the app's dental AI pipeline.

## What the PDF is useful for

The PDF is valuable as:

- a dental condition taxonomy
- a tooth-level label design reference
- a pipeline recommendation for detection, segmentation, classification, and treatment recommendation

The PDF is **not** a complete YOLO dataset by itself unless it also includes original labeled image files and machine-readable annotations.

## Recommended pipeline

1. Tooth detection with YOLO
2. Tooth segmentation with a mask model such as YOLOv8-seg or Mask R-CNN
3. Multi-label classification per tooth
4. Rule-based or AI-assisted treatment recommendation

## Tooth-level fields suggested by the PDF

Use these fields when building dental labels or post-processing predictions:

```json
{
  "tooth_id": 36,
  "condition": "caries",
  "stage": "moderate",
  "surface": "occlusal",
  "depth": "dentin",
  "gum_status": "periodontitis",
  "fracture": "none",
  "calculus": "low",
  "discoloration": "extrinsic",
  "treatment": "composite_filling"
}
```

## Core dental conditions mentioned in the PDF

- `caries`
- `periodontal_disease`
- `impacted_tooth`
- `periapical_lesion`
- `fracture`
- `calculus`
- `discoloration`
- `restoration`
- `alignment_issue`
- `missing_tooth`

## Caries detail levels from the PDF

- `early`
- `moderate`
- `advanced`

Suggested subfields:

- `surface`: `occlusal`, `proximal`, `buccal`, `lingual`
- `depth`: `enamel`, `dentin`, `pulp`

## Gum disease detail levels from the PDF

- `gingivitis`
- `periodontitis`

Suggested severity:

- `mild`
- `moderate`
- `severe`

## Detection tasks implied by the PDF

### YOLO object detection

Use YOLO first for:

- tooth localization
- abnormal region detection
- broad dental condition screening

Example detection label:

```json
{
  "bbox": [120, 64, 72, 58],
  "tooth_id": 16,
  "condition": "caries",
  "confidence": 0.92
}
```

### Segmentation tasks

Use a segmentation model for:

- per-tooth masks
- crown and root isolation where possible
- tooth numbering support
- downstream disease classification

Example segmentation-style label:

```json
{
  "tooth_id": 11,
  "condition": "normal",
  "mask": "polygon_coordinates"
}
```

## FDI tooth numbering

The PDF strongly suggests assigning every tooth an ID using the FDI system.

Examples:

- `11` upper right central incisor
- `21` upper left central incisor
- `36` lower left first molar
- `38` lower left third molar

## Best way to use this PDF in the project

1. Use it to define class names and label structure
2. Use it to create annotation guidelines for human labeling
3. Use it to enrich model output summaries and treatment suggestions
4. Use it to design a multi-stage dental AI pipeline

## What still must exist before real training

You still need:

1. Dental images in `datasets/dental/images/train`, `val`, and `test`
2. Matching YOLO `.txt` labels in `datasets/dental/labels/train`, `val`, and `test`
3. Consistent class mapping for the object detector
4. Enough labeled examples per class

## Recommended first detector classes

Use this first practical class mapping:

- `0: tooth`
- `1: caries_region`
- `2: impacted_tooth`
- `3: periapical_lesion`
- `4: restoration`

This keeps the first detection model stable and annotation-friendly.

## Advanced expansion path

After the first detector works reliably, extend to:

- `5: bone_loss_region`
- `6: calculus`
- `7: fracture`
- `8: discoloration`
- `9: normal_tooth`

## Annotation philosophy

Use these core rules consistently:

1. Box the full structure for structural objects like `tooth` and `impacted_tooth`.
2. Box only the abnormal region for localized findings like `caries_region` and `periapical_lesion`.
3. Use the same box style for the same class across the entire dataset.

Consistency matters more than perfection.

## Dataset split recommendation

- `train`: 70%
- `val`: 20%
- `test`: 10%

Avoid placing near-duplicate images from the same patient into different splits when possible.

## Minimum targets

Useful starting targets for the first detector:

- `500+` images overall
- `1000+` tooth boxes
- `200+` caries boxes
- `150+` impacted-tooth boxes
- `150+` periapical-lesion boxes
- `200+` restoration boxes

Then attach richer tooth-level metadata in a second-stage classifier or report layer.
