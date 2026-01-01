# MVP Proposal Update Summary

## Status Update (2026-01-01)

Legacy update summary. See `docs/` for current features and architecture.

**Date:** December 14, 2025

## Changes Completed

### 1. MVP Scope Narrowed 
**Section 1.2: MVP Includes** - Successfully updated to reflect narrowed feature set:

- **Mandatory 7 Bodies:** Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn
- **Mandatory 28 Nakshatras:** All Indian zodiacal constellations with constellation lines
- **Day Mode Only:** Trails limited to daily view with 6-hour coarse sampling (4 points per day)
- **UTC Time Only:** No timezone conversion in MVP
- **Preset Observer Locations:** India-focused + 1-2 global locations
- **Uniform Star Sizing:** No magnitude-based star appearance
- **Minimal UI:** Play/pause, time slider, observer preset dropdown, constellation toggle

### 2. MVP Excludes Clarified 
**Section 1.2: MVP Excludes** - Comprehensive list of features deferred to Phase 2:
- Atmospheric refraction, extinction, twilight gradients
- Precession, nutation, aberration corrections
- Moon phase visualization
- Magnitude-based star sizing
- Constellation labels and names (lines only in MVP)
- Month/year trail modes
- Custom observer locations via interactive map
- Time multiplier and zoom controls
- Night mode and sky coloring
- Landscape textures
- Automated Horizons validation

### 3. Trail Sampling Updated 
**Sections 8 & SkyTraceManager:** Trail configuration updated:
- **Day mode only** in MVP
- **6-hour coarse sampling:** 4 points per celestial body per day
- Removed references to month/year modes
- Interface updated: `mode: "day"` (hardcoded for MVP)

### 4. Timeline and Success Criteria Aligned 
**Proposal Conclusion Section (Section 14):**
- Updated timeline reflects 7 implementation phases over 10-15 working days
- Success criteria updated to include mandatory 7 bodies + 28 nakshatras
- Day-mode trails emphasized
- Memory footprint confirmed at <5 MB
- Minimal UI requirements specified

## Still To Do (Legacy snapshot; not tracked)

The following sections contain old references that should be manually reviewed and updated due to Unicode arrow encoding issues (`->`, `+/-`, `x`, ``) that prevent automated string matching:

### Section 7.2 (Stars)
**Location:** Lines 575-595
**Current state:** Still references "magnitude-based sizing" and "Phase 2 constellation lines"
**Should be updated to:**
```
- Rendering: uniform point size (no magnitude-based sizing); all equal-sized points
- No constellations in MVP (deferred to Phase 2)
```

### Section 7.3 (NEW - Nakshatras)
**Needs to be inserted after Section 7.2**
**Content:** Full 28-row table with Nakshatra names, key stars, lords, symbols, and deities
**Include:** MVP rendering requirements, toggle control, label deferral

### Section 8 Title
**Current:** "Daily, Monthly & Yearly Sky Traces (Key Feature)"
**Should be:** "Daily Sky Traces (MVP Mode Only)"

### Section 8 Trail Timeline & Criteria
**Location:** Lines ~1015-1035
**Should be updated to reflect:**
- 7-phase implementation breakdown (not 6)
- Nakshatra constellation line development (2-3 days)
- 28 nakshatras mandatory in success criteria
- Day-mode trail sampling with 6-hour intervals
- All 7 bodies explicitly listed in success criteria

## Implementation Notes for Developers

### Mandatory MVP Components

1. **HelioStateProvider**  (Already documented in Section 1.1)
   - Cache existing heliocentric ephemeris
   - Interface: `getBodyState(bodyId, jd)` -> `{posEcliptic, velEcliptic}`

2. **7 Celestial Bodies (Must-Have)**
   - Sun: yellow marker (0xffff00)
   - Moon: gray marker (0xcccccc)
   - Mercury: brown marker (0x8c7853)
   - Venus: orange-yellow marker (0xffc649)
   - Mars: red marker (0xff6347)
   - Jupiter: gold-brown marker (0xc88b3a)
   - Saturn: pale yellow marker (0xfad5a5)

3. **28 Nakshatras (Must-Have)**
   - All 28 must render correctly on sky dome
   - Constellation lines connecting primary stars
   - Toggle control in UI
   - Color: subtle white/pale blue
   - No labels in MVP

4. **Day Mode Trails (MVP Only)**
   - 6-hour sampling: 4 points per body per day
   - Start/end: current day +/-0 hours to +/-24 hours
   - Store in ring buffers to cap memory

5. **Observer Presets (Minimum Required)**
   - New Delhi, India
   - Varanasi, India
   - Kanyakumari, India
   - Greenwich, UK (reference)
   - Sydney, Australia (optional)

6. **Minimal UI Controls**
   - Time slider (scrubber)
   - Play/pause button
   - Observer preset dropdown
   - Show/hide stars toggle
   - Show/hide nakshatras toggle
   - Rise/set times display (text, no visualization)

### Phase 2 Deferrals (Explicitly NOT in MVP)

- Atmosphere rendering and refraction toggle
- Moon phase visualization
- Precession/nutation corrections
- Proper motion in star catalogs
- Constellation labels and mythology panels
- Month/year trail modes
- Time acceleration controls
- Zoom/FOV controls
- Night mode (red light)
- Landscape/horizon masking
- High-precision rise/set refinement

## Testing Checklist for MVP Validation

- [ ] All 7 bodies render and track correctly
- [ ] All 28 nakshatras visible with constellation lines
- [ ] Day trails show 6-hour sampling points
- [ ] Observer presets update sky correctly
- [ ] Rise/set times within +/-15 minutes of Stellarium
- [ ] 60 FPS target achieved with trails enabled
- [ ] Manual Stellarium Web cross-checks pass
- [ ] Memory footprint <5 MB
- [ ] UI responsive and intuitive
- [ ] UTC time handling correct (no timezone conversion)

## File References

**Updated Proposal:** `docs/source/Earth_Sky_Simulation_Proposal_Extended.md`
- Sections fully updated: 1.2, 1.3
- Sections partially updated: 8 (trail sampling)
- Sections needing cleanup: 7.2-7.3, Section 8 title, Section 14 criteria

**Existing Implementation Reference:** `skyview.html`
- Separate entry point (already created in previous session)
- No coupling to planetesimal.html
- Independent Three.js scene/renderer

## Next Steps

1. **Manual cleanup** of Sections 7.2-7.3 to remove "magnitude-based" star sizing reference and add full Nakshatra table
2. **Update Section 8 title** to emphasize "Daily Traces - MVP Mode Only"
3. **Verify Section 14** success criteria includes all 28 nakshatras and 7 bodies explicitly
4. **Begin Phase 1 Implementation** using updated timeline (7 phases, 10-15 days)
5. **Start with HelioStateProvider** and coordinate transform modules


