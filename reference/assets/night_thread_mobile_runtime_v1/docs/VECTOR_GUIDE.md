> 런타임 팩 안내: 아래 문서는 마스터 제작 가이드 사본입니다. 원본 PNG와 벡터 생성 코드 경로는 마스터 팩을 참조하세요. 이 팩의 실제 파일·크기·앵커는 runtime_manifest.json이 기준입니다. 런타임에는 SVG를 유지하고, 이미지 폴백은 png_fallbacks/에 따로 있습니다.

# 밤실 공방 · Vector integration guide

## Delivery

- 75 independently usable assets, each supplied as SVG and transparent RGBA PNG: 35 scene objects, 30 UI/state assets, 6 basic educational cards and 4 expanded-tick variants.
- `vectors_manifest.json` gives stable asset IDs, relative paths, logical dimensions, anchors, state, scene, semantic usage and hashes.
- `ui/labels.ko.json` supplies Korean DOM labels, descriptions and advanced data. There are no Korean glyphs baked into the SVGs and no font fallback dependency.
- `source/build_vectors.py` regenerates the vector files and optionally renders PNGs. All note/rest/numeric geometry is deterministic. Font outlines are embedded in `source/outline_glyphs.json`.
- `source/dream_level_examples.json` is an exact copy of the approved-for-math review source used for these drawings. Timing comes from the source data, never from image measurements.

## Rendering

From the asset root:

    python source/build_vectors.py --render

Requirements: Python 3, Pillow, Inkscape CLI. The delivered rasterizer was Inkscape 1.4 (e7c3feb100, 2024-10-09). No network or music font installation is required to rerun. FontTools was used once to extract licensed outline glyphs; it is not required for regeneration from the included outline JSON.

To render a single SVG without changing any source:

    inkscape input.svg --export-type=png --export-filename=output.png --export-background-opacity=0

The generator modifies only the 75 manifest-listed vector assets, its own metadata, and previews whose filenames start with `vectors_`. It does not modify backgrounds, characters, or independently generated art.

## Input symbols and layering

- `bridge_onset`: filled disc. One new press.
- `bridge_release`: hollow ring. Release at its center; the middle remains alpha-transparent.
- `bridge_tie_knot`: a much smaller oblong woven-thread marker, never an onset ring. Its passage does not trigger an attack, flash, click, particle, new score event or animation pulse.
- High-contrast variants end in `_hc` and retain the same anchor geometry. Contrast changes do not change timing or hit positions.
- `bridge_lantern_idle` and `bridge_lantern_active` share a frame and anchor. Reuse the pair for four beat lanterns behind the ribbon. Active adds an interior ray/star shape as well as higher luminance; never activate it merely because a tie boundary passes. These are static states, not flashing animation.
- Keep ribbon/thread pixels outside the hollow release-ring center. Clip the ribbon end or mask a clear inner disc when compositing; do not paint a line through its hole.
- `bridge_bar_pillar` is below the ribbon. Its appearance marks a barline, not a rest or a cut in sound.
- `bridge_ribbon_tile` repeats horizontally at 128 px; there are two 64 px units per repeat. Seam boundary strokes line up with every unit.
- `bridge_ribbon_broken` has a visible broken edge followed by a dashed remainder. Misses do not delay transport.
- Objects are discrete static assets, not complete rigs or timed animations. The consumer must attach transitions to the common transport clock.

## Exact greenhouse proportion

The two containers have equal 64 px unit width and equal 96 px liquid height. Their liquid rectangles are `[24,56,128,96]` and `[24,56,64,96]`. The liquid is not clipped by curved masks. Unit tick marks sit outside the liquid. At delivered raster size, opaque teal liquid pixels are exactly 12,288 and 6,144, a 2:1 ratio.

Container outer widths differ; do not scale both images into the same CSS width. Use the same pixels-per-logical-unit scale. Never derive duration from the decorative flower petal areas. The 3-stage flower poses show progression, while the 3 equal time-strip cells establish duration.

The closed cover means the player's voice rests. Use the hourglass wait icon and keep accompaniment/basic pulse running. Do not show the pause icon or freeze the scene as a rest cue.

## Meter and tempo

- Both room floors have six identical 80 px floor tiles. Grouped overlays are `[2,2,2]` and `[3,3]`; the grouping curves and hinges differ, not the unit widths or total input count.
- L06: 3/4 with quarter note = 90. L07: 6/8 with dotted quarter note = 60. Both use internal quarterBpm = 90 and identical eighth-note duration, 333.333… ms.
- Postal letters are shared between L08 and L09. Only transport timing changes, at the level boundary with a new count-in. Letter shape, order and rhythm do not imply a different pattern.
- Tempo education is explicitly rhythm-only notation. Its displayed noteheads do not encode pitch; the full C5, D5, E5, G5 pitch sequence remains in the JSON data.

## UI and accessible text

Icons should be visual children of real DOM buttons, with accessible names from the label map. Hide redundant images from the accessibility tree if a DOM name describes the same action. Use at least 44×44 CSS px for auxiliary controls and 72 CSS px height for the main action area. Text and focus order must remain usable at 200% zoom.

Button surfaces carry distinguishable state shapes: raised edge, inset pressed line, double focus border, and dashed/hatch disabled edge. Still set actual DOM focus/disabled state. A disabled image alone is not a disabled control.

Success feedback is an intact linked knot with a check mark. Miss feedback has separated strands and an exclamation mark. Color is supplementary. Include the short corresponding DOM feedback text; do not announce every rhythmic event.

## Education cards

The six primary `education_*` SVG/PNGs omit tick-count formulas. Their `_advanced` variants include tick details and belong only in an expanded advanced-info section. The basic cards still show geometric note ratios, musical notation, equal-unit grids and relevant meter/tempo numbers. Never expose hidden advanced facts only through screen-reader alt text; use `description` for basic mode and `advancedDescription` when expanded.

Descriptions, Korean headings and layout labels are real DOM content from `labels.ko.json`. Card images are not self-sufficient replacements for readable text. The `at` positions in the label map are logical artboard suggestions, not a text-rendering requirement; a responsive DOM caption/list is preferred on small screens. The cards should be below or after the performance view, not layered over gameplay.

Tie card top row: two adjacent C5 quarter notes under a tie equal one C5 half note. Bottom row: an explicitly partial L03 excerpt, with a visible staff-height barline between the C5 quarter and half note. It does not claim those two symbols alone fill two complete bars.

## Review and release

`vector_QA.json` distinguishes machine geometry/data checks, agent visual inspection and pending human review. Math checks and contact-sheet inspection do not prove notation pedagogy, listening quality, browser timing, physical-device accessibility, or learning outcomes.

All educational assets have `notationReview=pending`, `listeningReview=pending`, `releaseApproved=false`. A qualified person must review the final notation and its synchronized audio before public educational release. No source textbook raster, Melatonin artwork, logo, music, or screen has been copied into this vector set.

## Third-party outlines

- Noto Music: quarter rest, eighth rest and treble clef outlines; SIL Open Font License 1.1. Original source: https://github.com/notofonts/music. Full installed license/copyright notice: `Noto_fonts_license.txt`.
- DejaVu Sans: outlined digits and a small set of Latin/math characters. Original source: https://dejavu-fonts.github.io/. Full installed copyright/license notice: `DejaVu_fonts_license.txt`.

All other object paths, notehead/stem/beam geometry, layout, icons, textile stitches and proportional diagrams were authored for this asset set. Font extraction is a transformation into SVG paths; the font license notices must accompany redistribution.
