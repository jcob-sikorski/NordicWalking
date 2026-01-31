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

        return points;
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
}
