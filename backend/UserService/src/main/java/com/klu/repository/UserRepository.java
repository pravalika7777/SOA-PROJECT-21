package com.klu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klu.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

}