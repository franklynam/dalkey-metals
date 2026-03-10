#!/usr/bin/env python3
"""
geojson_to_scene_path.py
------------------------
Convert a GeoJSON LineString to scene-space coordinates ready for use
as a @react-three/drei <Line> path.

Supports two input CRS modes:
  --crs 4326  (default) WGS84 lon/lat — projected to ITM before mapping
  --crs 2157            ITM Easting/Northing — used directly, no projection

Supports two elevation modes:
  (default)        Sample elevation from the source GeoTIFF at each point
  --use-geojson-z  Use the Z coordinate already present in the GeoJSON

Output: a JavaScript ES module exporting a typed const array, e.g.:
  export const METALS_PATH = [[x, y, z], ...];

Usage:
  # WGS84 input, sample elevation from TIFF
  python geojson_to_scene_path.py draped-metals.json --tif dalkey-area.tif

  # ITM input, use GeoJSON Z values (no TIFF sampling needed)
  python geojson_to_scene_path.py metals-path.json --tif dalkey-area.tif \\
      --crs 2157 --use-geojson-z

  # Full options
  python geojson_to_scene_path.py draped-metals.json --tif dalkey-area.tif \\
      --plane-size 200 --nodata-threshold 500 --y-offset 0.1 \\
      --out src/data/draped-metals.js

Coordinate system:
  - Tile origin and pixel scale are read from GeoTIFF tags automatically
  - Scene plane is centred at origin; size set by --plane-size
  - Scene Y = elevation_m / metres_per_unit  (+y-offset)
  - metres_per_unit = tile_real_world_width_m / plane_size_units
"""

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np

try:
    import tifffile
except ImportError:
    sys.exit("Missing dependency: pip install tifffile")


# ---------------------------------------------------------------------------
# WGS84 → Irish Transverse Mercator (EPSG:2157)
# Manual implementation — avoids pyproj dependency.
# ---------------------------------------------------------------------------

def wgs84_to_itm(lon_deg: float, lat_deg: float) -> tuple[float, float]:
    """Return (Easting, Northing) in ITM metres."""
    a  = 6378137.0
    f  = 1 / 298.257222101
    k0 = 0.999820
    lon0 = math.radians(-8.0)
    lat0 = math.radians(53.5)
    E0, N0 = 600000.0, 750000.0

    e2 = 2 * f - f * f
    n  = f / (2 - f)

    A0 = 1 + n**2/4 + n**4/64
    A2 = 3/2 * (n - n**3/8)
    A4 = 15/16 * (n**2 - n**4/4)
    A6 = 35/48 * n**3
    A8 = 315/512 * n**4

    def M(phi):
        return a / (1 + n) * (
            A0 * phi
            - A2 * math.sin(2 * phi)
            + A4 * math.sin(4 * phi)
            - A6 * math.sin(6 * phi)
            + A8 * math.sin(8 * phi)
        )

    Mref = M(lat0)
    lat  = math.radians(lat_deg)
    lon  = math.radians(lon_deg)

    nu   = a / math.sqrt(1 - e2 * math.sin(lat)**2)
    rho  = a * (1 - e2) / (1 - e2 * math.sin(lat)**2) ** 1.5
    eta2 = nu / rho - 1
    dlon = lon - lon0
    t    = math.tan(lat)

    I    = M(lat) - Mref
    II   = nu / 2 * math.sin(lat) * math.cos(lat)
    III  = nu / 24 * math.sin(lat) * math.cos(lat)**3 * (5 - t**2 + 9 * eta2)
    IIIA = nu / 720 * math.sin(lat) * math.cos(lat)**5 * (61 - 58 * t**2 + t**4)
    IV   = nu * math.cos(lat)
    V    = nu / 6 * math.cos(lat)**3 * (nu / rho - t**2)
    VI   = nu / 120 * math.cos(lat)**5 * (5 - 18 * t**2 + t**4 + 14 * eta2 - 58 * t**2 * eta2)

    N = k0 * (I + II * dlon**2 + III * dlon**4 + IIIA * dlon**6) + N0
    E = k0 * (IV * dlon + V * dlon**3 + VI * dlon**5) + E0

    return E, N


# ---------------------------------------------------------------------------
# GeoTIFF helpers
# ---------------------------------------------------------------------------

def read_tif_metadata(tif_path: Path) -> dict:
    """Extract tile origin, pixel scale, and image size from GeoTIFF tags."""
    with tifffile.TiffFile(str(tif_path)) as tif:
        page = tif.pages[0]
        tiepoint = page.tags[33922].value   # ModelTiepointTag
        pxscale  = page.tags[33550].value   # ModelPixelScaleTag
        width    = page.tags[256].value
        height   = page.tags[257].value

    # Tiepoint: (pixel_x, pixel_y, pixel_z, world_x, world_y, world_z)
    origin_e = tiepoint[3]
    origin_n = tiepoint[4]
    scale_x  = pxscale[0]   # metres per pixel (E direction)
    scale_y  = pxscale[1]   # metres per pixel (N direction, positive)

    return dict(
        origin_e=origin_e,
        origin_n=origin_n,
        scale_x=scale_x,
        scale_y=scale_y,
        width=int(width),
        height=int(height),
        real_width_m=scale_x * width,
        real_height_m=scale_y * height,
    )


def load_elevation_array(tif_path: Path, nodata_threshold: float) -> np.ndarray:
    """Load GeoTIFF as float32, masking nodata with NaN."""
    data = tifffile.imread(str(tif_path)).astype(np.float32)
    if data.ndim == 3:
        data = data[0]
    data[~np.isfinite(data)] = np.nan
    data[np.abs(data) > nodata_threshold] = np.nan
    return data


def sample_elevation(elev: np.ndarray, px_x: float, px_y: float) -> float | None:
    """
    Bilinear sample of the elevation array at sub-pixel coordinates.
    Returns None if any contributing pixel is nodata or out of bounds.
    """
    h, w = elev.shape
    x0, y0 = int(px_x), int(px_y)
    x1, y1 = x0 + 1, y0 + 1

    if x0 < 0 or y0 < 0 or x1 >= w or y1 >= h:
        return None

    fx, fy = px_x - x0, px_y - y0

    vals = [elev[y0, x0], elev[y0, x1], elev[y1, x0], elev[y1, x1]]
    if any(np.isnan(v) for v in vals):
        return None

    return (
        vals[0] * (1 - fx) * (1 - fy)
        + vals[1] * fx * (1 - fy)
        + vals[2] * (1 - fx) * fy
        + vals[3] * fx * fy
    )


# ---------------------------------------------------------------------------
# JS output
# ---------------------------------------------------------------------------

def to_js(
    const_name: str,
    points: list[tuple],
    meta: dict,
    tif_path: Path,
    geojson_path: Path,
    plane_size: float,
    y_offset: float,
    crs: int,
    use_geojson_z: bool,
) -> str:
    mpu = meta["real_width_m"] / plane_size
    elev_source = "GeoJSON Z" if use_geojson_z else f"{tif_path.name} (bilinear sample)"
    crs_label = "EPSG:2157 ITM (no projection)" if crs == 2157 else "EPSG:4326 WGS84 → ITM"

    lines = [
        "/**",
        f" * {const_name}",
        f" * Generated by geojson_to_scene_path.py",
        f" * Source GeoJSON:   {geojson_path.name}  ({crs_label})",
        f" * Source GeoTIFF:   {tif_path.name}  (ITM / EPSG:2157)",
        f" * Elevation source: {elev_source}",
        f" *",
        f" * Tile origin:   ITM E {meta['origin_e']:.0f}, N {meta['origin_n']:.0f}",
        f" * Tile coverage: {meta['real_width_m']:.0f} m × {meta['real_height_m']:.0f} m",
        f" * Scene plane:   {plane_size:.0f} × {plane_size:.0f} units",
        f" * Scale:         1 scene unit = {mpu:.1f} m",
        f" * Y offset:      {y_offset} scene units ({y_offset * mpu:.1f} m above surface)",
        " */",
        f"export const {const_name} = [",
    ]

    for x, y, z, note in points:
        comment = f"  // {note}" if note else ""
        lines.append(f"  [{x:.4f}, {y:.4f}, {z:.4f}],{comment}")

    lines.append("];")
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def geojson_to_const_name(path: Path) -> str:
    """'draped-metals.json' → 'DRAPED_METALS_PATH'"""
    stem = path.stem.upper().replace("-", "_").replace(" ", "_")
    return f"{stem}_PATH"


def parse_args():
    p = argparse.ArgumentParser(
        description="Convert a GeoJSON LineString to R3F scene coordinates.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    p.add_argument("geojson", type=Path, help="Input GeoJSON file")
    p.add_argument(
        "--tif", type=Path, required=True,
        help="GeoTIFF used for tile metadata (and elevation sampling unless --use-geojson-z)",
    )
    p.add_argument(
        "--crs", type=int, default=4326, choices=[4326, 2157],
        help="Input CRS: 4326=WGS84 lon/lat (default), 2157=ITM Easting/Northing",
    )
    p.add_argument(
        "--use-geojson-z", action="store_true",
        help="Use Z values from the GeoJSON instead of sampling elevation from the TIFF",
    )
    p.add_argument(
        "--out", type=Path, default=None,
        help="Output JS file path (default: src/data/<geojson-stem>.js)",
    )
    p.add_argument(
        "--plane-size", type=float, default=200.0,
        help="Scene plane size in units (default: 200)",
    )
    p.add_argument(
        "--nodata-threshold", type=float, default=1000.0,
        help="Pixels with |value| > threshold treated as nodata (default: 1000)",
    )
    p.add_argument(
        "--y-offset", type=float, default=0.1,
        help="Scene units to lift line above terrain surface (default: 0.1)",
    )
    p.add_argument(
        "--const-name", type=str, default=None,
        help="JS export name (default: derived from filename)",
    )
    return p.parse_args()


def main():
    args = parse_args()

    geojson_path = args.geojson.resolve()
    tif_path     = args.tif.resolve()

    if not geojson_path.exists():
        sys.exit(f"GeoJSON not found: {geojson_path}")
    if not tif_path.exists():
        sys.exit(f"GeoTIFF not found: {tif_path}")

    const_name = args.const_name or geojson_to_const_name(geojson_path)
    out_path   = args.out or (Path("src/data") / geojson_path.with_suffix(".js").name)
    out_path   = out_path.resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    crs_label = "EPSG:2157 (ITM, no projection)" if args.crs == 2157 else "EPSG:4326 (WGS84)"
    elev_label = "GeoJSON Z" if args.use_geojson_z else f"TIFF sample (threshold={args.nodata_threshold})"
    print(f"GeoJSON:    {geojson_path}  [{crs_label}]")
    print(f"GeoTIFF:    {tif_path}")
    print(f"Output:     {out_path}")
    print(f"Elevation:  {elev_label}")
    print(f"Plane size: {args.plane_size} units")

    # --- Load GeoJSON ---
    with open(geojson_path) as f:
        gj = json.load(f)

    all_coords = []
    for feature in gj.get("features", []):
        geom = feature.get("geometry", {})
        if geom.get("type") == "LineString":
            all_coords.extend(geom["coordinates"])
        elif geom.get("type") == "MultiLineString":
            for ring in geom["coordinates"]:
                all_coords.extend(ring)

    if not all_coords:
        sys.exit("No LineString coordinates found in GeoJSON.")

    print(f"\nWaypoints:  {len(all_coords)}")

    # --- GeoTIFF metadata ---
    print("Reading GeoTIFF metadata…")
    meta = read_tif_metadata(tif_path)
    print(
        f"  Tile: E{meta['origin_e']:.0f}–{meta['origin_e']+meta['real_width_m']:.0f}, "
        f"N{meta['origin_n']-meta['real_height_m']:.0f}–{meta['origin_n']:.0f}  "
        f"({meta['real_width_m']:.0f}m × {meta['real_height_m']:.0f}m)"
    )

    mpu = meta["real_width_m"] / args.plane_size  # metres per scene unit
    print(f"  Scale: 1 scene unit = {mpu:.1f} m")

    # Load elevation array only if needed
    elev = None
    if not args.use_geojson_z:
        print("Loading elevation data…")
        elev = load_elevation_array(tif_path, args.nodata_threshold)

    # --- Project and sample ---
    print("Processing coordinates…")
    scene_points = []
    skipped = 0

    for i, coord in enumerate(all_coords):
        # --- Resolve ITM Easting/Northing ---
        if args.crs == 2157:
            e, n = coord[0], coord[1]
        else:
            e, n = wgs84_to_itm(coord[0], coord[1])

        px_x = (e - meta["origin_e"]) / meta["scale_x"]
        px_y = (meta["origin_n"] - n) / meta["scale_y"]

        in_bounds = (0 <= px_x < meta["width"]) and (0 <= px_y < meta["height"])
        if not in_bounds:
            print(f"  WARNING: waypoint {i} (ITM E={e:.0f}, N={n:.0f}) is outside tile extent — skipped")
            skipped += 1
            continue

        # --- Resolve elevation ---
        if args.use_geojson_z:
            if len(coord) < 3:
                print(f"  WARNING: waypoint {i} has no Z coordinate — skipped")
                skipped += 1
                continue
            elev_m = float(coord[2])
        else:
            elev_m = sample_elevation(elev, px_x, px_y)
            if elev_m is None:
                print(f"  WARNING: waypoint {i} sampled nodata elevation — skipped")
                skipped += 1
                continue

        sx = (px_x / meta["width"]  - 0.5) * args.plane_size
        sz = (px_y / meta["height"] - 0.5) * args.plane_size
        sy = elev_m / mpu + args.y_offset

        note = ""
        if i == 0:
            note = f"start  {elev_m:.1f} m"
        elif i == len(all_coords) - 1:
            note = f"end    {elev_m:.1f} m"

        scene_points.append((round(sx, 4), round(sy, 4), round(sz, 4), note))
        print(
            f"  [{i:2d}] ITM({e:.0f},{n:.0f})  "
            f"px({px_x:.0f},{px_y:.0f})  "
            f"elev={elev_m:.1f}m  "
            f"scene=({sx:.2f},{sy:.3f},{sz:.2f})"
        )

    if not scene_points:
        sys.exit("No valid scene points produced — check tile coverage and nodata threshold.")

    if skipped:
        print(f"\n  {skipped} waypoint(s) skipped.")

    # --- Write JS ---
    js = to_js(
        const_name, scene_points, meta, tif_path, geojson_path,
        args.plane_size, args.y_offset, args.crs, args.use_geojson_z,
    )
    out_path.write_text(js)
    print(f"\nWritten → {out_path}")
    print(f"Export:   {const_name}  ({len(scene_points)} points)")


if __name__ == "__main__":
    main()
