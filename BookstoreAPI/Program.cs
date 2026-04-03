using BookstoreAPI.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
var dbPath = Path.Combine(builder.Environment.ContentRootPath, "Bookstore (1).sqlite");
builder.Services.AddDbContext<BookstoreContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins(
            "http://localhost:5173",
            "https://mission-12-emdya5hmd3gae7et.centralus-01.azurewebsites.net"
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("AllowReact");
app.MapControllers();

// Temporary debug endpoint - remove after confirming deployment works
app.MapGet("/api/debug", (IWebHostEnvironment env) => new
{
    ContentRootPath = env.ContentRootPath,
    DbPath = Path.Combine(env.ContentRootPath, "Bookstore (1).sqlite"),
    DbExists = File.Exists(Path.Combine(env.ContentRootPath, "Bookstore (1).sqlite")),
    RootFiles = Directory.GetFiles(env.ContentRootPath).Select(Path.GetFileName).ToArray()
});

app.MapFallbackToFile("index.html");
app.Run();
