# Sky View MVP - Quick Start Guide

## 🚀 Getting Started (30 seconds)

### 1. **Open the Sky View**
```
Open: http://localhost/path/to/skyview.html
(or open the file directly in your browser)
```

### 2. **What You'll See**
- Full-screen dark blue sky dome
- 28 constellation lines (Indian Nakshatras) overlaid
- 7 celestial bodies (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn)
- Control panel in bottom-left corner
- Daily motion trails for each body

### 3. **Try These Controls**

| Action | Effect |
|--------|--------|
| **Drag time slider** (left side) | Jump to different dates |
| **Click ▶ Play button** | Start time animation |
| **Change observer dropdown** | Switch location (Delhi, London, Tokyo, etc.) |
| **Check "Nakshatras"** | Toggle 28 constellation visibility |
| **Check "Daily Trails"** | Toggle motion trails on/off |
| **Speed dropdown** | Control animation speed (1x, 24x, 240x, 2400x) |
| **Clear Trails button** | Reset all motion trails |

---

## 📍 Observer Locations (Built-in Presets)

The MVP includes 7 major cities pre-configured:

1. **Delhi, India** (28.61°N, 77.21°E) - Default
2. **Mumbai, India** (19.08°N, 72.88°E)
3. **Bangalore, India** (12.97°N, 77.59°E)
4. **London, UK** (51.51°N, -0.13°E)
5. **New York, USA** (40.71°N, -74.01°W)
6. **Tokyo, Japan** (35.68°N, 139.65°E)
7. **Sydney, Australia** (-33.87°S, 151.21°E)

**To use custom coordinates:**
- Select location dropdown → will appear in Phase 2

---

## ⌚ Time Control

### Current Display
- Shows date/time at top of control panel
- Julian Date for technical reference
- Automatically updates every second

### Time Slider
- **Range**: ±30 days from current date
- **Resolution**: 1-day steps
- **Label**: Shows "Today", "Yesterday", "Tomorrow" or date

### Animation Speeds
| Speed | Real Time Equivalent |
|-------|---------------------|
| 1x | 1 second = 1 second (real time) |
| 24x | 1 second = 1 day |
| 240x | 1 second = 10 days |
| 2400x | 1 second = 100 days |

---

## 🔭 The 7 Bodies

All displayed with accurate positions for your observer location and time:

| Body | Color | Description |
|------|-------|-------------|
| **Sun** | 🟡 Yellow | Shows sunrise/sunset times |
| **Moon** | ⚪ White | Lunar phases follow automatically |
| **Mercury** | 🔘 Gray | Innermost planet, hard to see |
| **Venus** | 🟡 Bright yellow | Brightest "star", often visible near sunrise/sunset |
| **Mars** | 🔴 Red-orange | The red planet |
| **Jupiter** | 🟠 Orange | Large, often visible |
| **Saturn** | 🟡 Pale yellow | With rings (simplified sphere in MVP) |

### What You Can Learn

Try these experiments:

1. **See Mercury's elongation** 
   - Fast-forward to 2025-03-01
   - Mercury will be furthest from Sun in evening sky

2. **Watch Moon phase changes**
   - Animate from new moon to full moon
   - Each complete cycle ≈ 29.5 days

3. **Track Venus's "morning star" to "evening star" transitions**
   - At different locations, timing varies
   - This is called "greatest elongation"

4. **Compare planetary positions across locations**
   - Same time, different observers
   - Change location to see altitude/azimuth differences

---

## 🌟 The 28 Nakshatras (Indian Zodiac)

Complete constellation system based on Vedic astronomy:

### What Are They?
- Indian alternative to Western zodiac
- 28 lunar stations (not 12 like Western astrology)
- Used in Vedic calendar and astrology
- Each named after primary star(s)

### All 28 Listed

| # | Name | Associated Planet |
|---|------|------------------|
| 1 | Ashvini | Ketu (South Node) |
| 2 | Bharani | Venus |
| 3 | Krittika | Sun |
| 4 | Rohini | Moon |
| 5 | Mrigashira | Mars |
| 6 | Ardra | Rahu (North Node) |
| 7 | Punarvasu | Jupiter |
| 8 | Pushya | Saturn |
| 9 | Ashleshā | Mercury |
| 10 | Maghā | Ketu |
| 11 | Purva Phalguni | Venus |
| 12 | Uttara Phalguni | Sun |
| 13 | Hasta | Moon |
| 14 | Chitra | Mars |
| 15 | Svati | Rahu |
| 16 | Vishakha | Jupiter |
| 17 | Anuradha | Saturn |
| 18 | Jyeshtha | Mercury |
| 19 | Mula | Ketu |
| 20 | Purva Ashadha | Venus |
| 21 | Uttara Ashadha | Sun |
| 22 | Shravana | Moon |
| 23 | Dhanishta | Mars |
| 24 | Shatabhisha | Rahu |
| 25 | Purva Bhadrapada | Jupiter |
| 26 | Uttara Bhadrapada | Saturn |
| 27 | Revati | Mercury |
| 28 | Abhijit | Vishnu |

### Viewing Tips
- Toggle "Nakshatras" to show/hide all constellation lines
- Visible nakshatras appear with white lines connecting key stars
- Nakshatras below horizon automatically fade out
- Use with trails to see body's path through nakshatras

---

## 📊 Information Display

### Bottom-Left Control Panel Shows

1. **Current Date/Time**: YYYY-MM-DD HH:MM:SS UTC
2. **Julian Date**: Technical time standard (JD)
3. **Observer**: Current location name
4. **Time Slider**: Jump to any date (±30 days)
5. **Animation Controls**: Play/Pause, speed selection
6. **Observer Selector**: 7 major world cities
7. **Toggles**: Nakshatras, Trails, Grid
8. **Rise/Set Information**: 
   - Rise time (when body appears above horizon)
   - Transit time (when body reaches highest point)
   - Set time (when body disappears below horizon)
   - Status: "Normal", "Circumpolar" (never sets), or "Never rises"
9. **Memory Usage**: Current memory footprint (should be <1 MB typically)
10. **Clear Trails**: Button to reset motion history

---

## 🎮 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** | Play/Pause animation |
| **T** | Toggle trails |
| **N** | Toggle nakshatras (Phase 2) |

---

## 🐛 Troubleshooting

### **"I don't see any bodies"**
- Check date is realistic (2020-2030 range)
- Check time is during daylight at your location
- Try jumping to noon with time slider
- Check observer location is correct

### **"Why is [body] not visible?"**
- Bodies below horizon automatically hide
- Check altitude/set times in rise/set display
- Try changing time to when body should be visible
- Try changing observer location

### **"Trails look weird"**
- Trails only sample every 6 hours (coarse MVP sampling)
- They only record when body is above horizon
- Trails reset if you jump time backward (by design)
- Use Clear Trails button to start fresh

### **"Performance is slow"**
- Check your browser's GPU is being used (DevTools)
- Disable trails if you have <2 GB RAM
- Disable nakshatras if FPS drops below 30
- Close other browser tabs

### **"Planetesimal.html still works, right?"**
- ✅ Yes! Sky View is completely separate
- You can open both in different tabs
- No data sharing between them
- Planetesimal.html changes don't affect Sky View

---

## 🔬 For Astronomy Enthusiasts

### Advanced Features Available

1. **Julian Date Support**: View any date in history or future
2. **Geocentric Coordinates**: Proper altitude/azimuth transformations
3. **Sidereal Time**: Linked to observer longitude
4. **Rise/Set Calculation**: 15-minute resolution coarse algorithm
5. **Body Motion**: Ephemerides from Kepler solver (accurate to ~1 degree)

### Limitations (Phase 2 Enhancements)

- ❌ No atmospheric refraction (next version)
- ❌ No parallax (fixed geocentric)
- ❌ No precession (J2000.0 epoch fixed)
- ❌ No proper motion
- ❌ No star catalog
- ❌ No twilight visualization

### Comparison to Professional Software

| Feature | Sky View MVP | Stellarium | Celestia |
|---------|-------------|-----------|----------|
| 28 Nakshatras | ✅ | ❌ | ❌ |
| 7 Major Bodies | ✅ | ✅ | ✅ |
| Rise/Set Times | ✅ | ✅ | ✅ |
| Trails | ✅ | ✅ | ✅ |
| Star Catalog | ❌ | ✅ | ✅ |
| Atmospheric Effects | ❌ | ✅ | ✅ |
| Milky Way | ❌ | ✅ | ✅ |
| 3D Space Navigation | ❌ | Partial | ✅ |

---

## 📚 Learning Resources

### Understanding the Interface

1. **Sky Dome**: Imagine you're at observer location, looking up. The dome is the celestial sphere projected onto a sphere around you.

2. **Horizon Line**: The gray circle at bottom is your local horizon (where sky meets ground).

3. **Cardinal Directions**: N (red), E (green), S (blue), W (yellow) show compass directions.

4. **Altitude/Azimuth Grid**: Optional meridian grid helps identify positions (Alt vertical, Az horizontal).

### Understanding the Data

- **Altitude**: 0° = horizon, 90° = straight up (zenith), negative = below horizon
- **Azimuth**: 0° = North, 90° = East, 180° = South, 270° = West
- **RA (Right Ascension)**: Like longitude on celestial sphere (0-24 hours)
- **Dec (Declination)**: Like latitude on celestial sphere (-90° to +90°)
- **Julian Date**: Continuous count of days since 4713 BCE (technical timekeeping)

### Key Concepts

- **Rise/Set Times**: Computed for standard horizon (0° altitude)
- **Transit**: Highest point in sky for the day
- **Circumpolar**: Body never sets (visible all night)
- **Trails**: 6-hour sampling shows planet motion over days/weeks

---

## 🎯 Quick Activities

### For Kids (Age 8+)
1. Track the Moon's position change each night
2. Compare where Sun rises vs sets at different times of year
3. Find Venus in evening sky simulation
4. Count how many nakshatras you can see

### For Students (Age 13+)
1. Calculate how fast planets move (pixels/day)
2. Compare rise/set times at different latitudes
3. Understand why planets disappear below horizon
4. Investigate retrograde motion with time slider

### For Adults
1. Verify locations of known astronomical events
2. Plan best viewing times for planets (elongation, brightness)
3. Learn Vedic astronomical system (nakshatras)
4. Validate against professional software (Stellarium, USNO)

---

## 📞 Need Help?

### Check These Resources

1. **Module README**: `sky-module/README.md` - Full technical documentation
2. **Browser Console**: Open DevTools (F12), check console for errors
3. **Memory Stats**: Control panel shows current memory usage

### Known Issues (Phase 1 MVP)

- Trails don't show for bodies below horizon (by design)
- Rise/set accuracy is ±15 minutes (acceptable for MVP)
- No real-time GPS support (manual location entry coming Phase 2)
- No atmospheric refraction (optional Phase 2)

---

## ✨ Summary

**You now have a complete, independent sky visualization tool with:**
- 7 major solar system bodies
- 28 Indian zodiacal constellations
- Daily motion trails
- Observer location support
- Time travel capability
- Minimal but complete UI

**Enjoy exploring the sky!** 🌌

---

*Sky View MVP | Version 1.0 | © 2025*
