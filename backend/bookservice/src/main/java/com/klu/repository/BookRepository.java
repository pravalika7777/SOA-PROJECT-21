package com.klu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klu.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {

}