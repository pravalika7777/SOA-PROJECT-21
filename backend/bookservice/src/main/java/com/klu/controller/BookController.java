package com.klu.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.klu.entity.Book;
import com.klu.service.BookService;



@RestController



@RequestMapping("/books")



public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    
    @PostMapping
    public Book addBook(@RequestBody Book book) {
        return service.addBook(book);
    }

    
    @GetMapping
    public List<Book> getAllBooks() {
        return service.getAllBooks();
    }

  
    @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        return service.getBookById(id);
    }

    @PutMapping("/{id}")
    public Book updateBook(
            @PathVariable Long id,
            @RequestBody Book book) {

        return service.updateBook(id, book);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBook(
            @PathVariable Long id) {

        service.deleteBook(id);

        return ResponseEntity.ok("Book deleted successfully");
    }

    @GetMapping("/{id}/available")
    public boolean checkAvailability(
            @PathVariable Long id) {

        return service.checkAvailability(id);
    }

    @PutMapping("/{id}/borrow")
    public Book borrowBook(
            @PathVariable Long id) {

        return service.borrowBook(id);
    }

    @PutMapping("/{id}/return")
    public Book returnBook(
            @PathVariable Long id) {

        return service.returnBook(id);
    }
}