package com.sems;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class SemsApplication {
    public static void main(String[] args) {
        SpringApplication.run(SemsApplication.class, args);
    }

    @GetMapping("/api/health")
    public String health() {
        return "SEMS Backend is running!";
    }

    @GetMapping("/")
    public String home() {
        return "SEMS Backend API - Health: OK";
    }
}
