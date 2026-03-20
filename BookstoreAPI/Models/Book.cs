// Models/Book.cs
namespace BookstoreAPI.Models;

public class Book
{
    public int BookID { get; set; }
    public required string Title { get; set; }
    public required string Author { get; set; }
    public required string Publisher { get; set; }
    public required string ISBN { get; set; }
    public required string Classification { get; set; }
    public required string Category { get; set; }
    public int PageCount { get; set; }
    public decimal Price { get; set; }
}