# Astrology & Zodiac Features

This document provides a detailed overview of the astrological and zodiac-related features implemented in the Solar Playground simulation. All relevant code resides in `scripting.js`.

## 1. Rashi Belt (Zodiac)

*   **Implementation**: A 3D Rashi belt is rendered on the celestial sphere. This is achieved in the `updateRashiBelt` function, which dynamically draws the 12 zodiac segments, their boundaries, and labels.

*   **Width**: The belt is visualized with a traditional 18-degree width, extending ±9 degrees from the ecliptic plane. This is calculated at the beginning of the `updateRashiBelt` function.

    ```javascript
    // In scripting.js
    // Zodiac belt width is ~18 degrees (+/- 9 degrees from ecliptic)
    const latRad = DegToRad(9);
    const yOffset = Math.sin(latRad) * RASHI_BELT_RADIUS;
    const rProjected = Math.cos(latRad) * RASHI_BELT_RADIUS;
    ```

*   **Zodiac Systems & Ayanamsa**:
    *   A toggle between **Sidereal (Vedic)** and **Western (Tropical)** zodiac systems is available in the settings menu.
    *   When Sidereal is selected, an **Ayanamsa** (precession correction) is applied. The default is Lahiri (~23.85° for J2000), which aligns the zodiac with the fixed stars.
    *   The Ayanamsa value can be adjusted manually via a slider or selected from presets (Lahiri, Raman, Fagan-Bradley). It also updates automatically based on the simulation date to account for the precession of the equinoxes.

    ```javascript
    // In scripting.js, inside updateRashiBelt()
    const offsetAngle = useWesternZodiac ? 0 : DegToRad(ayanamsaDeg);
    const start = i * segmentAngle + offsetAngle;
    ```

## 2. Nakshatras (Lunar Mansions)

*   **Implementation**: The 27 Nakshatra divisions are drawn as lines within the Rashi belt, visible only when the Sidereal (Vedic) system is active. This is handled within the `updateRashiBelt` function.
*   **Search & Info**: A search function allows focusing on a specific Nakshatra. When selected, the info panel displays its Ruler and Deity, sourced from the `NAKSHATRA_DETAILS` array. A glowing ring (`nakshatraSelectionRing`) highlights the selection.

## 3. Grahas (Planetary Positions)

*   **Implementation**: Markers for the 7 classical Grahas (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn) and the two lunar nodes (Rahu, Ketu) are displayed on the Rashi belt. Their positions are calculated geocentrically and projected onto the ecliptic plane in the `updateGrahaMarkers` function.

*   **Degrees**: Each marker displays the Graha's exact zodiacal degree (in D°M' format), which updates in real-time.

*   **Rahu & Ketu (Lunar Nodes)**:
    *   **Calculation**: The positions of Rahu (Ascending Node) and Ketu (Descending Node) are calculated using the formula for the Mean Lunar Node based on the current Julian Century (`J_C`).

        ```javascript
        // In scripting.js, inside updateGrahaMarkers()
        const currentJC = J_D / 36525.0;
        // Mean Node: 125.04452 - 1934.136261 * T (T in centuries)
        const omega = 125.04452 - 1934.136261 * currentJC;
        let nodeDeg = omega % 360;
        ```

    *   **Visualization**: To clarify their nature as intersection points, several visual aids are implemented:
        *   3D wireframe spheres orbit the Earth at the Moon's distance.
        *   The **Line of Nodes** (a dashed gold line) connects Rahu and Ketu through the Earth.
        *   The **Moon's Inclined Orbit** (a cyan line tilted at ~5.1°) is shown alongside the Ecliptic orbit (a grey line). Rahu and Ketu are located at the intersection of these two paths.
        *   An **Eclipse Indicator** turns the Line of Nodes red when the Sun is near a node, indicating an "eclipse season".

## 4. Visual Helpers & Other Features

*   **Earth's Axial Tilt**:
    *   **Implementation**: The 23.5° axial tilt is visualized by two lines passing through the Earth's center, created in the main setup block of `scripting.js`.
    *   **Earth's Axis**: A solid red line representing the axis of rotation, tilted by 23.5° relative to the ecliptic normal.
    *   **Ecliptic Normal**: A green dashed line perpendicular to the ecliptic plane, for contrast.
    *   An arc and label show the angle between these two lines when the camera is zoomed in.

        ```javascript
        // In scripting.js
        // Earth Axis (Red Line)
        const earthAxisLine = new THREE.Line(...);
        earthAxisLine.rotation.x = -CONSTELLATION_TILT; // CONSTELLATION_TILT is ~23.5 deg

        // Earth Ecliptic Normal (Green Line)
        const earthNormalLine = new THREE.Line(...); // No rotation
        ```

*   **Constellations**:
    *   Labels now display full constellation names (e.g., "Cetus" instead of "Cet").
    *   Constellation lines are colored based on the Rashi they occupy.

*   **UI & System**:
    *   All features are controllable via toggles in the settings menu.
    *   Numerous bug fixes have been implemented to improve stability during high-speed simulation and user interaction, including:
        *   Fixing a crash when accessing the Moon's position during fast-forward.
        *   Correcting numeric search input handling.
        *   Resolving variable initialization order to prevent reference errors.