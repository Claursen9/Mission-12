using BookstoreAPI.Data;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Azure App Service stores files on a network share (C:\home\) where SQLite
// file locking can fail. Copy the database to the local temp directory instead.
var deployedDb = Path.Combine(builder.Environment.ContentRootPath, "Bookstore (1).sqlite");
var localDb = Path.Combine(Path.GetTempPath(), "Bookstore.sqlite");
if (!File.Exists(localDb) && File.Exists(deployedDb))
    File.Copy(deployedDb, localDb);
var dbPath = File.Exists(localDb) ? localDb : deployedDb;

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

// Return error details in response body to help diagnose 500s
app.UseExceptionHandler(exApp => exApp.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    ctx.Response.ContentType = "application/json";
    var ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
    await ctx.Response.WriteAsJsonAsync(new
    {
        error = ex?.Message,
        inner = ex?.InnerException?.Message,
        type = ex?.GetType().Name
    });
}));

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("AllowReact");
app.MapControllers();

// Debug endpoints - remove after confirming deployment works
app.MapGet("/api/debug", (IWebHostEnvironment env) => new
{
    ContentRootPath = env.ContentRootPath,
    TempPath = Path.GetTempPath(),
    LocalDbPath = localDb,
    LocalDbExists = File.Exists(localDb),
    DeployedDbExists = File.Exists(deployedDb),
    DbPathInUse = dbPath,
});

app.MapGet("/api/debug2", async (BookstoreContext db) =>
{
    try
    {
        var count = await db.Books.CountAsync();
        return Results.Ok(new { success = true, count });
    }
    catch (Exception ex)
    {
        return Results.Ok(new { success = false, error = ex.Message, inner = ex.InnerException?.Message });
    }
});

app.MapFallbackToFile("index.html");
app.Run();
