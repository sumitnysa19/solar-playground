# Mathematical Models

This document summarizes the core formulas used across the Solar System simulation and the Earth-sky viewer.

## Orbital elements to position (Keplerian)

Given:

- semi-major axis `a`
- eccentricity `e`
- inclination `i`
- longitude of ascending node `Omega`
- argument of periapsis `omega`
- mean anomaly `M`

Solve Kepler's equation for eccentric anomaly `E`:

```
M = E - e * sin(E)
```

Then compute the position in the orbital plane:

```
x_w = a * (cos(E) - e)

y_w = a * sqrt(1 - e^2) * sin(E)
```

Rotate from orbital plane to ecliptic using the standard rotation matrix built from `Omega`, `i`, and `omega`.

## Mean motion and mean anomaly

```
M(t) = M0 + n * (t - t0)

n = sqrt(mu / a^3)
mu = G * M_parent
```

## Obliquity (Earth axial tilt)

Mean obliquity is used as a constant:

```
EPS = 23.4393 degrees = 0.40904531187 radians
```

This rotates equatorial coordinates into ecliptic coordinates, and is used to orient planetary spin axes.

## RA/Dec to 3D (sky dome)

```
ra  = raDeg  * DEG2RAD
Dec = decDeg * DEG2RAD

x = R * cos(Dec) * sin(ra)
y = R * sin(Dec)
z = R * cos(Dec) * cos(ra)
```

## RA/Dec to Alt/Az

Given observer latitude `lat`, local sidereal time `LST`, and hour angle `H`:

```
H = LST - RA
sin(alt) = sin(Dec) * sin(lat) + cos(Dec) * cos(lat) * cos(H)
alt = asin(sin(alt))

az = atan2(
  -sin(H),
  tan(Dec) * cos(lat) - sin(lat) * cos(H)
)
```

## Alt/Az to 3D (horizon frame)

Project the horizon coordinates into the scene with north at +Z and east at -X:

```
alt = altitudeDeg * DEG2RAD
az  = azimuthDeg * DEG2RAD

x = -R * cos(alt) * sin(az)
y =  R * sin(alt)
z =  R * cos(alt) * cos(az)
```

## Horizon plane orientation

For a clicked point `p` on Earth in local coordinates (scaled oblate spheroid):

```
normal = normalize( x/a^2, y/b^2, z/a^2 )
```

Project Earth's world north axis onto the tangent plane to get local North:

```
north = normalize( northAxis - normal * dot(northAxis, normal) )
```

Then compute East and build a basis:

```
east = normalize( normal x north )

basis = [ east | north | normal ]
```

The horizon disc is oriented by this basis so that the disc plane is perpendicular to the surface normal and the grid has a stable north direction.
