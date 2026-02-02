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
    private static readonly XNamespace GpxNs = "http://www.topografix.com/GPX/1/1";

    public static List<GpxPoint> Parse(Stream gpxStream)
    {
        var doc = XDocument.Load(gpxStream);

        var points = doc
            .Descendants(GpxNs + "trkpt")
            .Select(pt => new GpxPoint
            {
                Latitude = double.Parse(
                    pt.Attribute("lat")!.Value,
                    CultureInfo.InvariantCulture),

                Longitude = double.Parse(
                    pt.Attribute("lon")!.Value,
                    CultureInfo.InvariantCulture),

                Elevation = pt.Element(GpxNs + "ele") != null
                    ? double.Parse(
                        pt.Element(GpxNs + "ele")!.Value,
                        CultureInfo.InvariantCulture)
                    : null
            })
            .ToList();

        // Calculate cumulative distance and mock elevation if missing
        double totalDistance = 0;
        var random = new Random(42); // Seed for consistency
        for (int i = 0; i < points.Count; i++)
        {
            if (i == 0)
            {
                points[i].Distance = 0;
            }
            else
            {
                var prev = points[i - 1];
                var curr = points[i];
                var dist = GetDistance(prev.Latitude, prev.Longitude, curr.Latitude, curr.Longitude);
                totalDistance += dist;
                points[i].Distance = Math.Round(totalDistance, 3); // Round to meters
            }

            // Mock elevation if missing (simple sine wave + noise)
            if (points[i].Elevation == null)
            {
                // Base height 150m, +/- 30m variation based on distance
                points[i].Elevation = 150 + (Math.Sin(points[i].Distance * 5) * 20) + (random.NextDouble() * 5);
            }
        }

        return points;
    }

    private static double GetDistance(double lat1, double lon1, double lat2, double lon2)
    {
        var R = 6371d; // Radius of the earth in km
        var dLat = Deg2Rad(lat2 - lat1);
        var dLon = Deg2Rad(lon2 - lon1);
        var a =
            Math.Sin(dLat / 2d) * Math.Sin(dLat / 2d) +
            Math.Cos(Deg2Rad(lat1)) * Math.Cos(Deg2Rad(lat2)) *
            Math.Sin(dLon / 2d) * Math.Sin(dLon / 2d);
        var c = 2d * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1d - a));
        var d = R * c; // Distance in km
        return d;
    }

    private static double Deg2Rad(double deg)
    {
        return deg * (Math.PI / 180d);
    }

    public static List<GpxPoint> ParseFromFile(string filePath)
    {
        using var fs = File.OpenRead(filePath);
        return Parse(fs);
    }

    public static List<GpxPoint> ParseFromString(string gpxContent)
    {
        using var ms = new MemoryStream(Encoding.UTF8.GetBytes(gpxContent));
        return Parse(ms);
    }


    public static string ToJson(List<GpxPoint> points)
    {
        return JsonSerializer.Serialize(points, new JsonSerializerOptions
        {
            WriteIndented = true
        });
    }

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
        
        // Ensure the last point is included
        if (result.Last() != points.Last())
        {
            result.Add(points.Last());
        }

        return result;
    }
}
