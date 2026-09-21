package com.klu.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.klu.entity.Book;
import com.klu.exception.BookNotAvailableException;
import com.klu.repository.BookRepository;

@Service
public class BookService {

    private final BookRepository repository;

    public BookService(BookRepository repository) {
        this.repository = repository;
    }

    // Add book
    public Book addBook(Book book) {
        return repository.save(book);
    }

    // Get all books
    public List<Book> getAllBooks() {
        return repository.findAll();
    }

    // Get book by ID
    public Book getBookById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Book not found"));
    }

    // Update book
    public Book updateBook(Long id, Book book) {

        Book existingBook = getBookById(id);

        existingBook.setTitle(book.getTitle());
        existingBook.setAuthor(book.getAuthor());
        existingBook.setAvailableCopies(book.getAvailableCopies());

        return repository.save(existingBook);
    }

    // Delete book
    public void deleteBook(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("Book not found");
        }

        repository.deleteById(id);
    }

    // Check availability
    public boolean checkAvailability(Long id) {

        Book book = getBookById(id);

        return book.getAvailableCopies() > 0;
    }

    // Borrow book
    public Book borrowBook(Long id) {

        Book book = getBookById(id);

        // No copies available
        if (book.getAvailableCopies() <= 0) {

            throw new BookNotAvailableException(
                "No copies available"
            );
        }

        // Decrease available copies
        book.setAvailableCopies(
            book.getAvailableCopies() - 1
        );

        return repository.save(book);
    }

    // Return book
    public Book returnBook(Long id) {

        Book book = getBookById(id);

        // Increase available copies
        book.setAvailableCopies(
            book.getAvailableCopies() + 1
        );

        return repository.save(book);
    }
}