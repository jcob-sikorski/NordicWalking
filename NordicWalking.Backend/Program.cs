// Initialize the web application builder
var builder = WebApplication.CreateBuilder(args);

// --- 1. SERVICE CONFIGURATION ---

// Add OpenAPI/Swagger support for API documentation and testing
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Enable Cross-Origin Resource Sharing (CORS)
// Essential for allowing a frontend (like React/Vite) on a different port to fetch your data
builder.Services.AddCors(options => options.AddPolicy("AllowAll",
    p => p.AllowAnyOrigin()
          .AllowAnyMethod()
          .AllowAnyHeader()));

var app = builder.Build();

// --- 2. MIDDLEWARE PIPELINE ---

// Use Swagger UI in the browser (usually at /swagger/index.html)
app.UseSwagger();
app.UseSwaggerUI();

// Apply the "AllowAll" CORS policy defined above
app.UseCors("AllowAll");

// --- 3. API ENDPOINTS ---

/**
 * GET /api/tracks
 * Scans the 'GpxSources' folder and returns a list of available tracks with metadata.
 */
app.MapGet("/api/tracks", () =>
{
    // Define path to the folder containing .gpx files
    var gpxDir = Path.Combine(app.Environment.ContentRootPath, "GpxSources");
    
    // Return an empty list gracefully if the directory doesn't exist
    if (!Directory.Exists(gpxDir)) return Results.Ok(new List<object>());

    // Find all .gpx files in the directory
    var files = Directory.GetFiles(gpxDir, "*.gpx");
    
    // Transform file list into a collection of track objects
    var tracks = files.Select(file => {
        var fileName = Path.GetFileName(file);
        var slug = Path.GetFileNameWithoutExtension(file);
        
        // Human-readable formatting: "mt-rainier-hike" -> "Mt Rainier Hike"
        var name = string.Join(" ", slug.Split('-').Select(s => 
            char.ToUpper(s[0]) + s.Substring(1)));

        return new {
            slug = slug,        // URL-friendly ID
            name = name,        // Display name
            fileName = fileName,
            distance = 0,       // Placeholder: logic could be added to calculate from file
            time = 0            // Placeholder: logic could be added to calculate from file
        };
    }).ToList();

    return Results.Ok(tracks);
});

/**
 * GET /api/tracks/{slug}
 * Retrieves specific GPX data, parses it into coordinates, and downsamples for performance.
 */
app.MapGet("/api/tracks/{slug}", (string slug) =>
{
    Console.WriteLine($"[API] Request received for slug: {slug}");
    
    // Construct the file path based on the URL parameter
    var fileName = $"{slug}.gpx";
    var filePath = Path.Combine(app.Environment.ContentRootPath, "GpxSources", fileName);
    
    Console.WriteLine($"[API] Looking for file: {filePath}");

    // Safety check: ensure the requested file actually exists
    if (!File.Exists(filePath)) 
    {
        Console.WriteLine($"[API] File not found: {filePath}");
        return Results.NotFound($"GPX file {fileName} not found");
    }

    try 
    {
        Console.WriteLine("[API] Parsing GPX file...");
        // Convert the XML GPX format into a list of coordinate points
        var points = GpxConverter.ParseFromFile(filePath);
        
        Console.WriteLine($"[API] Parsed {points.Count} points. Downsampling...");
        
        // Optimization: Reduce the number of points (taking every 20th point)
        // This prevents the frontend map from lagging with massive datasets.
        var downsampledPoints = GpxConverter.Downsample(points, 20);
        
        Console.WriteLine($"[API] Downsampled to {downsampledPoints.Count} points. Sending response.");
        return Results.Ok(downsampledPoints);
    }
    catch (Exception ex)
    {
        // Handle parsing errors (e.g., malformed XML)
        Console.WriteLine($"[API] Error: {ex.Message}");
        return Results.Problem(detail: ex.Message, title: "Error parsing GPX");
    }
});

// Start the server
app.Run();