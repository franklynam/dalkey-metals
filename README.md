# The Metals — LiDAR Terrain Visualiser

Interactive 3D visualisation of the Dalkey Quarry → Dún Laoghaire LiDAR terrain with "The Metals" heritage railway path overlaid.

**Stack:** Next.js 15 · React 19 · Three.js r170+ · @react-three/fiber v9 · @react-three/drei v10

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Orbit with left-click drag, zoom with scroll. The camera cannot go below the ground plane (`maxPolarAngle = Math.PI / 2.1`).

---

## File structure

```
app/
├── public/
│   └── textures/
│       └── metals_dtm_16bit.png     # 16-bit grayscale displacement map
├── scripts/
│   └── geotiff_to_heightmap.py      # GeoTIFF → PNG conversion utility
├── src/
│   ├── app/
│   │   ├── layout.jsx
│   │   ├── page.jsx                 # dynamic import, ssr: false
│   │   └── globals.css
│   ├── components/
│   │   ├── App.jsx                  # Canvas + Suspense boundary
│   │   ├── Scene.jsx                # Sky, lights, OrbitControls
│   │   ├── Terrain.jsx              # PlaneGeometry + displacementMap
│   │   └── MetalsPath.jsx           # Drei <Line> heritage path overlay
│   └── data/
│       └── metals-path.js           # Pre-projected scene coordinates
├── metals_dtm_16bit.tif             # Source GeoTIFF (see Asset notes below)
├── metals-path.json                 # Heritage path (GeoJSON, EPSG:4326)
└── PLAN.md                          # Architecture decisions and derived constants
```

---

## Terrain assets

### `metals_dtm_16bit.tif` (source)

| Property | Value |
|---|---|
| Format | GeoTIFF, RGBA uint8 |
| CRS | Irish Transverse Mercator (ITM / EPSG:2157) |
| Tile origin | E 724 000, N 728 000 |
| Pixel scale | 0.9766 m/px |
| Coverage | 2 km × 2 km (2048 × 2048 px) |
| Elevation encoding | `R × 256 + G = raw16` (big-endian, 0–65 535) |
| Real elevation | `raw16 / 712.82` metres (verified at 10 path waypoints, r = 0.9998) |

The 16-bit value is split across the R and G channels of an otherwise standard 8-bit RGBA image — not a native float raster.

### `public/textures/metals_dtm_16bit.png` (generated)

A 16-bit grayscale PNG decoded from the above and ready to serve as a Three.js `displacementMap`. Generated once with:

```python
import tifffile, numpy as np
from PIL import Image
data = tifffile.imread('metals_dtm_16bit.tif')
h16 = (data[:,:,0].astype(np.uint16) << 8) | data[:,:,1].astype(np.uint16)
Image.frombuffer('I;16', (2048, 2048), h16.tobytes(), 'raw', 'I;16', 0, 1).save('public/textures/metals_dtm_16bit.png')
```

> **16-bit fidelity note:** Browsers decode 16-bit PNG to 8-bit when constructing WebGL textures via `HTMLImageElement`. For this terrain (~92 m range) that gives ~256 height steps (≈ 0.36 m precision) — sufficient for visual exploration. For full precision, replace `useTexture` in `Terrain.jsx` with a custom `DataTexture` loader using [`upng-js`](https://github.com/photopea/UPNG.js).

---

## Coordinate system

All terrain data is georeferenced in **Irish Transverse Mercator (ITM / EPSG:2157)**.

```
DTM tile bounds:
  Easting:  724 000 – 726 000 m
  Northing: 726 000 – 728 000 m
  Coverage: 2 km × 2 km

Scene mapping (Terrain.jsx):
  Plane size:        200 × 200 scene units
  1 scene unit  =   10 m real world
  Scene X       =   (pixel_x / 2048 − 0.5) × 200
  Scene Z       =   (pixel_y / 2048 − 0.5) × 200
```

### Three.js displacement values

```js
// Terrain.jsx defaults
displacementScale = 9.2   // maps normalised [0, 1] → [0, 92 m] in scene units
displacementBias  = 0     // sea/void pixels (raw = 0) sit at Y = 0
```

---

## Heritage path — The Metals

**Source:** `metals-path.json` — GeoJSON LineString, EPSG:4326, 10 waypoints with Z elevations.

The path coordinates in `src/data/metals-path.js` are pre-projected:

```
WGS84 (lon, lat, elev_m)
  → ITM (E, N)                 manual Transverse Mercator formula
  → pixel offset (px_x, px_y)  from tile origin at 0.9766 m/px
  → scene (X, Z)               (px / 2048 − 0.5) × 200
  → scene Y                    elev_m / 10
```

Scene Y (derived from GeoJSON elevation) matches the displaced terrain surface within **1%** across all waypoints. A `LINE_Y_OFFSET` of `0.1` scene units (1 m) lifts the line above the mesh to prevent z-fighting.

| Waypoint | Location | Real elev | Scene Y |
|---|---|---|---|
| 0 | Dalkey Quarry | 24.8 m | 2.48 |
| 9 | Dún Laoghaire | 8.8 m | 0.88 |

---

## Converting a GeoJSON path to scene coordinates

Use `scripts/geojson_to_scene_path.py` to project a GeoJSON LineString into the R3F scene coordinate system and write it as a JavaScript ES module.

### Usage

```bash
# ITM input (EPSG:2157), use GeoJSON Z values — most common for this project
python scripts/geojson_to_scene_path.py metals-path.json \
    --tif /path/to/dl-area-plus-piers.tif \
    --crs 2157 --use-geojson-z \
    --out src/data/metals-path.js \
    --const-name METALS_PATH

# WGS84 input (EPSG:4326), sample elevation from TIFF
python scripts/geojson_to_scene_path.py path.json \
    --tif /path/to/terrain.tif

# Full options
python scripts/geojson_to_scene_path.py path.json --tif terrain.tif \
    --plane-size 200 --nodata-threshold 500 --y-offset 0.1 \
    --out src/data/path.js
```

### Options

| Flag | Default | Description |
|---|---|---|
| `--tif` | *(required)* | GeoTIFF used for tile metadata (and elevation sampling unless `--use-geojson-z`) |
| `--crs` | `4326` | Input CRS: `4326` = WGS84 lon/lat, `2157` = ITM Easting/Northing |
| `--use-geojson-z` | off | Use Z values from the GeoJSON instead of sampling elevation from the TIFF |
| `--plane-size` | `200` | Scene plane size in units |
| `--y-offset` | `0.1` | Scene units to lift the line above the terrain surface (prevents z-fighting) |
| `--nodata-threshold` | `1000` | Pixels with `|value| > threshold` treated as nodata |
| `--const-name` | *(derived from filename)* | JS export name, e.g. `METALS_PATH` |
| `--out` | `src/data/<name>.js` | Output JS file path |

### Coordinate pipeline

```
Input CRS:
  EPSG:4326 → manual Transverse Mercator → ITM (E, N)
  EPSG:2157 → used directly

ITM (E, N)
  → pixel offset (px_x, px_y)   from GeoTIFF tile origin
  → scene X, Z                  (px / tile_px − 0.5) × plane_size
  → scene Y                     elev_m / metres_per_unit + y_offset
```

`metres_per_unit` is derived automatically from the GeoTIFF tile width and `--plane-size`.

---

## Converting new GeoTIFF terrain layers

Use `scripts/geotiff_to_heightmap.py` to convert any float GeoTIFF DTM to a 16-bit grayscale PNG.

### Dependencies

```bash
pip install tifffile Pillow numpy
```

### Usage

```bash
# Auto elevation range (p0.5 – p99.5 of valid pixels)
python scripts/geotiff_to_heightmap.py dalkey-area.tif

# Specify output path
python scripts/geotiff_to_heightmap.py dalkey-area.tif -o public/textures/dalkey.png

# Manual range — recommended when auto includes sea bathymetry
python scripts/geotiff_to_heightmap.py dalkey-area.tif --elev-min -10 --elev-max 200

# Higher nodata threshold (if terrain genuinely exceeds 1000 m)
python scripts/geotiff_to_heightmap.py dalkey-area.tif --nodata-threshold 2000
```

The script writes a companion `.txt` file alongside the PNG with the exact `displacementScale` and `displacementBias` values to paste into `Terrain.jsx`.

### `dalkey-area.tif` specifics

| Property | Value |
|---|---|
| Format | GeoTIFF, float32 native elevation |
| CRS | ITM / EPSG:2157 |
| Tile origin | E 724 000, N 730 000 |
| Pixel scale | 3.906 m/px |
| Coverage | 4 km × 4 km (1024 × 1024 px) |
| Nodata | NaN + float16 overflow sentinels (`\|value\| > 1000`) |
| Valid pixels | ~96% |
| Auto range | −306 to +295 m (includes sea bathymetry) |
| Recommended range | `--elev-min -10 --elev-max 200` for land-only |

Compared to `metals_dtm_16bit.tif`, this layer has 4× coarser resolution but 4× wider coverage and uses native float elevation metres rather than a custom channel encoding.

---

## Tuning tips

**Vertical exaggeration** — increase `displacementScale` in `Scene.jsx` to emphasise the quarry face and the downhill gradient to the harbour. Values of `15–25` give a dramatic but readable result.

**Segment density** — `segments={1024}` in `Terrain.jsx` produces ~1 M vertices and is GPU-heavy on integrated graphics. Drop to `512` for development; bump back to `1024` for final renders.

**Performance monitoring** — add [`r3f-perf`](https://github.com/utsuboco/r3f-perf) to Scene.jsx:

```bash
npm install r3f-perf
```

```jsx
import { Perf } from 'r3f-perf';
// inside <Scene>:
<Perf position="top-left" />
```
