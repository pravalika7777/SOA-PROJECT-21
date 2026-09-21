package com.klu.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // No copies available -> 409 Conflict
    @ExceptionHandler(BookNotAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleBookNotAvailable(BookNotAvailableException ex, HttpServletRequest request) {
        Map<String, Object> errorBody = new LinkedHashMap<>();
        errorBody.put("timestamp", LocalDateTime.now().toString());
        errorBody.put("status", HttpStatus.CONFLICT.value());
        errorBody.put("error", "Conflict");
        errorBody.put("message", ex.getMessage());
        errorBody.put("path", request.getRequestURI());
        return new ResponseEntity<>(errorBody, HttpStatus.CONFLICT);
    }

    // Illegal argument (e.g. negative copies) -> 400 Bad Request
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        Map<String, Object> errorBody = new LinkedHashMap<>();
        errorBody.put("timestamp", LocalDateTime.now().toString());
        errorBody.put("status", HttpStatus.BAD_REQUEST.value());
        errorBody.put("error", "Bad Request");
        errorBody.put("message", ex.getMessage());
        errorBody.put("path", request.getRequestURI());
        return new ResponseEntity<>(errorBody, HttpStatus.BAD_REQUEST);
    }

    // Resource not found -> 404 Not Found
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex, HttpServletRequest request) {
        Map<String, Object> errorBody = new LinkedHashMap<>();
        errorBody.put("timestamp", LocalDateTime.now().toString());
        errorBody.put("status", HttpStatus.NOT_FOUND.value());
        errorBody.put("error", "Not Found");
        errorBody.put("message", ex.getMessage());
        errorBody.put("path", request.getRequestURI());
        return new ResponseEntity<>(errorBody, HttpStatus.NOT_FOUND);
    }
}