// Controllers/BooksController.cs
using BookstoreAPI.Data;
using BookstoreAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookstoreAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly BookstoreContext _context;

    public BooksController(BookstoreContext context)
    {
        _context = context;
    }

    // GET /api/books?page=1&pageSize=5&sortBy=title&category=Biography
    [HttpGet]
    public async Task<IActionResult> GetBooks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string sortBy = "title",
        [FromQuery] string category = "")
    {
        var query = _context.Books.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(b => b.Category == category);

        if (sortBy.ToLower() == "title")
            query = query.OrderBy(b => b.Title);

        var totalCount = await query.CountAsync();
        var books = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { totalCount, books });
    }

    // GET /api/books/categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Books
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
        return Ok(categories);
    }
}