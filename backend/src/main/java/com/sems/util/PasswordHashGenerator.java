package com.sems.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt password hashes for seed data
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Generate hash for "password"
        String password = "password";
        String hash = encoder.encode(password);
        
        System.out.println("BCrypt hash for '" + password + "':");
        System.out.println(hash);
        
        // Verify the hash works
        boolean matches = encoder.matches(password, hash);
        System.out.println("Verification: " + matches);
        
        // Generate hash for "Owner@12345" as well
        String ownerPassword = "Owner@12345";
        String ownerHash = encoder.encode(ownerPassword);
        System.out.println("\nBCrypt hash for '" + ownerPassword + "':");
        System.out.println(ownerHash);
    }
}