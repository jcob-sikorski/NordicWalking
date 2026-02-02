var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Enable CORS so your React app can talk to the API
builder.Services.AddCors(options => options.AddPolicy("AllowAll",
    p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowAll");

// Dynamic Tracks Endpoint
app.MapGet("/api/tracks", () =>
{
    var gpxDir = Path.Combine(app.Environment.ContentRootPath, "GpxSources");
    if (!Directory.Exists(gpxDir)) return Results.Ok(new List<object>());

    var files = Directory.GetFiles(gpxDir, "*.gpx");
    var tracks = files.Select(file => {
        var fileName = Path.GetFileName(file);
        var slug = Path.GetFileNameWithoutExtension(file);
        
        // Format name: trail-1 -> Trail 1, my-track -> My Track
        var name = string.Join(" ", slug.Split('-').Select(s => 
            char.ToUpper(s[0]) + s.Substring(1)));

        return new {
            slug = slug,
            name = name,
            fileName = fileName,
            distance = 0, // Simplified for list
            time = 0      // Simplified for list
        };
    }).ToList();

    return Results.Ok(tracks);
});

app.MapGet("/api/tracks/{slug}", (string slug) =>
{
    Console.WriteLine($"[API] Request received for slug: {slug}");
    
    // Check if file exists based on slug
    var fileName = $"{slug}.gpx";
    var filePath = Path.Combine(app.Environment.ContentRootPath, "GpxSources", fileName);
    
    Console.WriteLine($"[API] Looking for file: {filePath}");

    if (!File.Exists(filePath)) 
    {
        Console.WriteLine($"[API] File not found: {filePath}");
        return Results.NotFound($"GPX file {fileName} not found");
    }

    try 
    {
        Console.WriteLine("[API] Parsing GPX file...");
        var points = GpxConverter.ParseFromFile(filePath);
        Console.WriteLine($"[API] Parsed {points.Count} points. Downsampling...");
        var downsampledPoints = GpxConverter.Downsample(points, 20);
        Console.WriteLine($"[API] Downsampled to {downsampledPoints.Count} points. Sending response.");
        return Results.Ok(downsampledPoints);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[API] Error: {ex.Message}");
        return Results.Problem(detail: ex.Message, title: "Error parsing GPX");
    }
});

app.Run();