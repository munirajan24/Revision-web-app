# Nearby-Place Search with Spatial Grids

Source: [NEAREST_NEIGHBORS.pdf](<../../Scalar java backend contents/NEAREST_NEIGHBORS.pdf>) (5 pages)

## What this PDF is about

These notes use latitude/longitude coordinates to find nearby places. The approaches shown are a brute-force scan and a spatial grid/tree index. This is a geographic search problem, not a general machine-learning K-nearest-neighbors lesson.

## Approach 1: brute-force distance checks

Store each place's coordinates. For every query, calculate its distance from the requested point, keep the closest results, and sort or select the nearest ones.

For two latitude/longitude points, a simple Euclidean distance can be used as an approximation over a small area:

```text
d = sqrt((lat1 - lat2)^2 + (lon1 - lon2)^2)
```

For larger geographic distances, use a spherical distance formula (such as Haversine) because longitude/latitude degrees do not represent uniform distances on the Earth's surface.

For a spherical approximation, convert latitudes and longitudes to radians and use:

```text
a = sin^2((lat2 - lat1) / 2)
  + cos(lat1) * cos(lat2) * sin^2((lon2 - lon1) / 2)
c = 2 * atan2(sqrt(a), sqrt(1 - a))
distance = EarthRadius * c
```

Coordinates may need longitude wraparound near the international date line. A rectangular longitude/latitude window also behaves differently near the poles; use a geospatial library or an appropriate spherical bounding calculation when global accuracy matters.

**Trade-off:** simple and exact for the chosen distance metric, but each query may inspect every place.

## Approach 2: filter by a coordinate window

The PDF sketches a query that first limits latitude and longitude to a box around the requested point:

```sql
SELECT *
FROM places
WHERE latitude BETWEEN :lat - :delta AND :lat + :delta
  AND longitude BETWEEN :lon - :delta AND :lon + :delta;
```

This reduces candidates, but the box is only a candidate filter: calculate actual distances and rank the remaining places. Choose the window carefully, since the same longitude difference corresponds to different physical distances at different latitudes.

## Approach 3: grid-based lookup

Divide the map into cells and assign each place to a cell. For a query:

1. Map the query coordinate to a grid cell.
2. Read places from that cell and neighboring cells.
3. Calculate actual distances for those candidates.
4. Sort by distance and return the requested number.

The pages describe a tree of spatial cells: create the tree, find the grid ID for a point, discover neighboring grid IDs, and then add or delete a place in the relevant cell.

```text
Map
└── large cell
    ├── child cell
    └── child cell
        └── subdivide further where needed
```

Subdivision can keep dense areas searchable without forcing every area to use the same granularity. Cell boundaries and neighboring-cell lookup must be handled correctly so that nearby results are not missed.

For an exact top-`k` search, checking only the query's cell is not enough. Expand to neighboring cells until the nearest possible point in every unexplored cell is farther away than the current kth result; otherwise a closer place may still be hidden outside the search area. This requires a distance lower bound from the query point to each cell, not merely comparing cell centers.

## Data and operations

The source sketches a place record with an ID, name, metadata, grid ID, and coordinates. Keep the grid assignment synchronized when a place is inserted, moved, or deleted.

```text
findGrid(latitude, longitude, root)
createSpatialIndex(places)
findNearby(latitude, longitude, limit)
addPlace(place)
deletePlace(placeId)
```

## Compare the approaches

| Method | Query work | Main consideration |
|---|---|---|
| Brute-force scan | Grows with all stored places | Simplest baseline; expensive at large scale |
| Coordinate window | Checks a filtered candidate set | Window is approximate; rank by real distance afterward |
| Grid/tree index | Checks relevant cells and neighbors | Faster candidate lookup; indexing and boundary correctness add complexity |

## Review the handwritten pages

- [Brute-force distance and coordinate-window sketches (page 1)](<../../Scalar java backend contents/NEAREST_NEIGHBORS.pdf#page=1>)
- [Spatial tree, grid lookup, neighbors, insert, and delete (page 3)](<../../Scalar java backend contents/NEAREST_NEIGHBORS.pdf#page=3>)

Some formulas and labels are difficult to read in the scan. Use the source pages to verify the exact constants and coordinate conventions before implementing the method.

## Quick self-check

1. Why should a coordinate window be followed by actual distance ranking?
2. Which grid cells must be searched near a cell boundary?
3. What needs updating when a place changes coordinates?
4. When is a brute-force scan a reasonable first implementation?
