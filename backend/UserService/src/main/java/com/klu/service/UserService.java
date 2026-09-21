package com.klu.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.klu.entity.User;
import com.klu.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User addUser(User user) {
        return repository.save(user);
    }

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User getUserById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(Long id, User user) {

        User existingUser = getUserById(id);

        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());

        return repository.save(existingUser);
    }

    public void deleteUser(Long id) {

        if (!repository.existsById(id)) {
            throw new RuntimeException("User not found");
        }

        repository.deleteById(id);
    }
}