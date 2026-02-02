using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Xml.Linq;

public static class GpxConverter
{
    // The official GPX 1.1 schema namespace required to find elements in the XML
    private static readonly XNamespace GpxNs = "http://www.topografix.com/GPX/1/1";

    /// <summary>
    /// Core parsing logic: Converts a GPX Stream into a list of GpxPoint objects.
    /// Includes distance calculation and elevation mocking.
    /// </summary>
    public static List<GpxPoint> Parse(Stream gpxStream)
    {
        var doc = XDocument.Load(gpxStream);

        // 1. Extract raw coordinate data from <trkpt> elements
        var points = doc
            .Descendants(GpxNs + "trkpt")
            .Select(pt => new GpxPoint
            {
                // Parse Latitude/Longitude using InvariantCulture to avoid comma/decimal errors
                Latitude = double.Parse(
                    pt.Attribute("lat")!.Value,
                    CultureInfo.InvariantCulture),

                Longitude = double.Parse(
                    pt.Attribute("lon")!.Value,
                    CultureInfo.InvariantCulture),

                // Elevation <ele> is optional in some GPX files
                Elevation = pt.Element(GpxNs + "ele") != null
                    ? double.Parse(
                        pt.Element(GpxNs + "ele")!.Value,
                        CultureInfo.InvariantCulture)
                    : null
            })
            .ToList();

        // 2. Post-processing: Calculate cumulative distance and handle missing elevation
        double totalDistance = 0;
        var random = new Random(42); // Seeded for deterministic "random" elevation

        for (int i = 0; i < points.Count; i++)
        {
            if (i == 0)
            {
                points[i].Distance = 0;
            }
            else
            {
                // Calculate distance between this point and the previous one
                var prev = points[i - 1];
                var curr = points[i];
                var dist = GetDistance(prev.Latitude, prev.Longitude, curr.Latitude, curr.Longitude);
                
                totalDistance += dist;
                points[i].Distance = Math.Round(totalDistance, 3); // Store distance in km (rounded)
            }

            // Mock elevation if missing (creates a natural-looking undulating terrain)
            if (points[i].Elevation == null)
            {
                // Base height 150m + sine wave variation + small noise
                points[i].Elevation = 150 + (Math.Sin(points[i].Distance * 5) * 20) + (random.NextDouble() * 5);
            }
        }

        return points;
    }

    /// <summary>
    /// Implementation of the Haversine Formula to find the distance between two GPS coordinates.
    /// Returns distance in Kilometers.
    /// </summary>
    private static double GetDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371d; // Radius of the earth in km
        var dLat = Deg2Rad(lat2 - lat1);
        var dLon = Deg2Rad(lon2 - lon1);
        
        // The Haversine "a" and "c" values represent the central angle between points
        var a =
            Math.Sin(dLat / 2d) * Math.Sin(dLat / 2d) +
            Math.Cos(Deg2Rad(lat1)) * Math.Cos(Deg2Rad(lat2)) *
            Math.Sin(dLon / 2d) * Math.Sin(dLon / 2d);
            
        var c = 2d * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1d - a));
        return R * c; 
    }

    private static double Deg2Rad(double deg) => deg * (Math.PI / 180d);

    // Helper to load from a physical file path
    public static List<GpxPoint> ParseFromFile(string filePath)
    {
        using var fs = File.OpenRead(filePath);
        return Parse(fs);
    }

    // Helper to load from a raw string (useful for testing or API uploads)
    public static List<GpxPoint> ParseFromString(string gpxContent)
    {
        using var ms = new MemoryStream(Encoding.UTF8.GetBytes(gpxContent));
        return Parse(ms);
    }

    // Helper to convert the final list back to JSON for the frontend
    public static string ToJson(List<GpxPoint> points)
    {
        return JsonSerializer.Serialize(points, new JsonSerializerOptions
        {
            WriteIndented = true
        });
    }

    /// <summary>
    /// Reduces the number of points in a track to improve frontend rendering performance.
    /// Takes the original list and returns a list with approximately 'targetCount' points.
    /// </summary>
    public static List<GpxPoint> Downsample(List<GpxPoint> points, int targetCount)
    {
        if (points.Count <= targetCount) return points;

        var step = (double)points.Count / targetCount;
        var result = new List<GpxPoint>(targetCount);

        for (int i = 0; i < targetCount; i++)
        {
            var index = (int)(i * step);
            if (index < points.Count)
            {
                result.Add(points[index]);
            }
        }
        
        // Important: Always include the finish line!
        if (result.Last() != points.Last())
        {
            result.Add(points.Last());
        }

        return result;
    }
}