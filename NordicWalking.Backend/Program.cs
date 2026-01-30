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

// Example Endpoint
app.MapGet("/api/tracks", async () =>
{
    var filePath = Path.Combine(app.Environment.ContentRootPath, "Data", "tracks.json");
    var json = await File.ReadAllTextAsync(filePath);
    return Results.Content(json, "application/json");
});

app.Run();