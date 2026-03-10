#!/usr/bin/env python3
"""
geotiff_to_heightmap.py
-----------------------
Convert a float GeoTIFF elevation raster to a 16-bit grayscale PNG
suitable for use as a Three.js displacementMap.

Handles:
  - float16 / float32 source data
  - NaN, ±Inf, and extreme sentinel values used as nodata
  - Auto or manual elevation clamp range
  - Nodata pixels mapped to a configurable fill value (default: 0)

Usage:
  python geotiff_to_heightmap.py dalkey-area.tif
  python geotiff_to_heightmap.py dalkey-area.tif -o public/textures/dalkey.png
  python geotiff_to_heightmap.py dalkey-area.tif --elev-min -10 --elev-max 200
  python geotiff_to_heightmap.py dalkey-area.tif --nodata-threshold 500

Output:
  16-bit grayscale PNG where:
    0       = nodata / below elev_min
    65535   = elev_max
    N       = round((elev - elev_min) / (elev_max - elev_min) * 65535)

  A companion .txt file is written alongside the PNG with the exact
  elev_min / elev_max used, so you can derive displacementScale in Three.js:

    displacementScale = (elev_max - elev_min) / METRES_PER_SCENE_UNIT
"""

import argparse
import sys
from pathlib import Path

import numpy as np

try:
    import tifffile
except ImportError:
    sys.exit("Missing dependency: pip install tifffile")

try:
    from PIL import Image
except ImportError:
    sys.exit("Missing dependency: pip install Pillow")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def load_elevation(path: Path) -> np.ndarray:
    """Load GeoTIFF as float32, collapsing any band dimension."""
    data = tifffile.imread(str(path)).astype(np.float32)
    if data.ndim == 3:
        # Multi-band: take first band (elevation is always band 0 for DTMs)
        data = data[0]
    return data


def mask_nodata(data: np.ndarray, threshold: float) -> np.ndarray:
    """
    Return a float32 array with nodata pixels set to NaN.

    Nodata is defined as: NaN, ±Inf, or abs(value) > threshold.
    The threshold guards against float16 overflow sentinels (±65504)
    that GIS tools sometimes write instead of a declared nodata value.
    """
    out = data.copy()
    out[~np.isfinite(out)] = np.nan
    out[np.abs(out) > threshold] = np.nan
    return out


def auto_range(data: np.ndarray, percentile_clip: float = 0.5):
    """
    Derive elev_min / elev_max from the valid (non-NaN) pixel distribution,
    clipping `percentile_clip`% from each tail to discard stray outliers.
    """
    valid = data[np.isfinite(data)]
    lo = np.percentile(valid, percentile_clip)
    hi = np.percentile(valid, 100 - percentile_clip)
    return float(lo), float(hi)


def normalise_to_uint16(
    data: np.ndarray,
    elev_min: float,
    elev_max: float,
    fill_value: int = 0,
) -> np.ndarray:
    """
    Map [elev_min, elev_max] → [0, 65535] as uint16.
    NaN pixels receive fill_value.
    Values outside the range are clamped to 0 / 65535.
    """
    span = elev_max - elev_min
    if span <= 0:
        raise ValueError(f"elev_max ({elev_max}) must be greater than elev_min ({elev_min})")

    nodata_mask = ~np.isfinite(data)

    # Replace NaN/inf with elev_min before arithmetic to avoid cast warnings;
    # the nodata_mask will overwrite these pixels with fill_value afterwards.
    safe = np.where(nodata_mask, elev_min, data)

    normalised = np.clip((safe - elev_min) / span, 0.0, 1.0)
    uint16 = (normalised * 65535.0).round().astype(np.uint16)
    uint16[nodata_mask] = fill_value

    return uint16


def save_png_16bit(array: np.ndarray, output_path: Path) -> None:
    """Save a uint16 2-D array as a 16-bit grayscale PNG."""
    h, w = array.shape
    # frombuffer avoids the deprecated 'mode' parameter in Image.fromarray
    img = Image.frombuffer("I;16", (w, h), array.tobytes(), "raw", "I;16", 0, 1)
    img.save(str(output_path))


def write_metadata(
    output_path: Path,
    elev_min: float,
    elev_max: float,
    shape: tuple,
    nodata_count: int,
) -> None:
    """Write a companion .txt file with conversion parameters."""
    meta_path = output_path.with_suffix(".txt")
    lines = [
        f"source_png:      {output_path.name}",
        f"shape:           {shape[1]}w x {shape[0]}h px",
        f"elev_min:        {elev_min:.4f} m",
        f"elev_max:        {elev_max:.4f} m",
        f"elev_range:      {elev_max - elev_min:.4f} m",
        f"nodata_pixels:   {nodata_count}",
        f"encoding:        uint16 linear, 0=elev_min, 65535=elev_max",
        "",
        "# Three.js usage:",
        "# If your scene plane covers W scene units = R real metres:",
        "#   metres_per_unit = R / W",
        f"#   displacementScale = {elev_max - elev_min:.4f} / metres_per_unit",
        "",
        "# Example — 200-unit plane covering 2000 m (1 unit = 10 m):",
        f"#   displacementScale = {(elev_max - elev_min) / 10:.4f}",
    ]
    meta_path.write_text("\n".join(lines))
    print(f"  Metadata written → {meta_path}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args():
    p = argparse.ArgumentParser(
        description="Convert a float GeoTIFF DTM to a 16-bit grayscale PNG heightmap.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    p.add_argument("input", type=Path, help="Input GeoTIFF (.tif / .tiff)")
    p.add_argument(
        "-o", "--output", type=Path, default=None,
        help="Output PNG path (default: <input>.png in same directory)",
    )
    p.add_argument(
        "--elev-min", type=float, default=None,
        help="Minimum elevation to map to 0 (default: auto from p0.5)",
    )
    p.add_argument(
        "--elev-max", type=float, default=None,
        help="Maximum elevation to map to 65535 (default: auto from p99.5)",
    )
    p.add_argument(
        "--nodata-threshold", type=float, default=1000.0,
        help=(
            "Pixels with |value| > threshold are treated as nodata. "
            "Increase if your terrain has genuine elevations above 1000 m. "
            "(default: 1000)"
        ),
    )
    p.add_argument(
        "--fill-value", type=int, default=0,
        help="16-bit value assigned to nodata pixels (default: 0)",
    )
    p.add_argument(
        "--no-metadata", action="store_true",
        help="Skip writing the companion .txt metadata file",
    )
    return p.parse_args()


def main():
    args = parse_args()

    input_path = args.input.resolve()
    if not input_path.exists():
        sys.exit(f"Input file not found: {input_path}")

    output_path = args.output or input_path.with_suffix(".png")
    output_path = output_path.resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print(f"Input:  {input_path}")
    print(f"Output: {output_path}")

    # --- Load ---
    print("\nLoading elevation data…")
    raw = load_elevation(input_path)
    print(f"  Shape: {raw.shape[1]}w x {raw.shape[0]}h  dtype: {raw.dtype}")

    # --- Mask nodata ---
    masked = mask_nodata(raw, threshold=args.nodata_threshold)
    nodata_count = int(np.isnan(masked).sum())
    valid = masked[np.isfinite(masked)]
    print(f"  Valid pixels: {valid.size:,} / {raw.size:,}  ({100*valid.size/raw.size:.1f}%)")
    print(f"  Nodata pixels: {nodata_count:,}")

    if valid.size == 0:
        sys.exit(
            "No valid pixels found after nodata masking. "
            "Try increasing --nodata-threshold."
        )

    # --- Elevation range ---
    if args.elev_min is not None and args.elev_max is not None:
        elev_min, elev_max = args.elev_min, args.elev_max
        print(f"\nElevation range (manual): {elev_min:.2f} – {elev_max:.2f} m")
    else:
        auto_min, auto_max = auto_range(masked)
        elev_min = args.elev_min if args.elev_min is not None else auto_min
        elev_max = args.elev_max if args.elev_max is not None else auto_max
        print(f"\nElevation range (auto p0.5–p99.5): {elev_min:.2f} – {elev_max:.2f} m")

    print(f"  Range span: {elev_max - elev_min:.2f} m")

    # --- Normalise ---
    print("\nNormalising to uint16…")
    uint16 = normalise_to_uint16(masked, elev_min, elev_max, fill_value=args.fill_value)

    # --- Save ---
    print("Saving PNG…")
    save_png_16bit(uint16, output_path)
    size_kb = output_path.stat().st_size / 1024
    print(f"  Written: {output_path.name}  ({size_kb:.0f} KB)")

    # --- Metadata ---
    if not args.no_metadata:
        write_metadata(output_path, elev_min, elev_max, raw.shape, nodata_count)

    print("\nDone.")
    print(f"\nThree.js hint:")
    print(f"  // For a 200-unit plane covering 2000 m (1 unit = 10 m):")
    print(f"  displacementScale={{{(elev_max - elev_min) / 10:.4f}}}")
    print(f"  displacementBias={{{elev_min / 10:.4f}}}")


if __name__ == "__main__":
    main()
