package com.klu.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex, HttpServletRequest request) {
        Map<String, Object> errorBody = new LinkedHashMap<>();
        errorBody.put("timestamp", LocalDateTime.now().toString());
        errorBody.put("status", ex.getStatusCode().value());
        errorBody.put("error", HttpStatus.valueOf(ex.getStatusCode().value()).getReasonPhrase());
        errorBody.put("message", ex.getReason());
        errorBody.put("path", request.getRequestURI());
        return new ResponseEntity<>(errorBody, ex.getStatusCode());
    }

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<Map<String, Object>> handleHttpClientErrorException(HttpClientErrorException ex, HttpServletRequest request) {
        Map<String, Object> errorBody = new LinkedHashMap<>();
        errorBody.put("timestamp", LocalDateTime.now().toString());
        errorBody.put("status", ex.getStatusCode().value());
        errorBody.put("error", ex.getStatusText());
        errorBody.put("message", ex.getResponseBodyAsString());
        errorBody.put("path", request.getRequestURI());
        return new ResponseEntity<>(errorBody, ex.getStatusCode());
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, Object>> handleResourceAccessException(ResourceAccessException ex, HttpServletRequest request) {
        Map<String, Object> errorBody = new LinkedHashMap<>();
        errorBody.put("timestamp", LocalDateTime.now().toString());
        errorBody.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        errorBody.put("error", "Service Unavailable");
        errorBody.put("message", "Downstream service is temporarily unavailable: " + ex.getMessage());
        errorBody.put("path", request.getRequestURI());
        return new ResponseEntity<>(errorBody, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, HttpServletRequest request) {
        Map<String, Object> errorBody = new LinkedHashMap<>();
        errorBody.put("timestamp", LocalDateTime.now().toString());
        errorBody.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorBody.put("error", "Internal Server Error");
        errorBody.put("message", ex.getMessage());
        errorBody.put("path", request.getRequestURI());
        return new ResponseEntity<>(errorBody, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
