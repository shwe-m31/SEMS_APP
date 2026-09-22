package com.sems.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordGeneratorTest {

    private final PasswordGenerator generator = new PasswordGenerator();

    @Test
    void testPasswordLengthAndComposition() {
        String pwd = generator.generateTemporaryPassword(10);
        assertNotNull(pwd);
        assertEquals(10, pwd.length());

        // Check that it contains at least one digit, letter, or special character
        boolean hasDigit = pwd.matches(".*[0-9].*");
        boolean hasUpper = pwd.matches(".*[A-Z].*");
        boolean hasLower = pwd.matches(".*[a-z].*");
        boolean hasSpecial = pwd.matches(".*[#@!$%&*].*");

        assertTrue(hasDigit, "Should contain a digit");
        assertTrue(hasUpper, "Should contain an uppercase letter");
        assertTrue(hasLower, "Should contain a lowercase letter");
        assertTrue(hasSpecial, "Should contain a special character");
    }

    @Test
    void testDefaultLength() {
        String pwd = generator.generateTemporaryPassword();
        assertEquals(10, pwd.length());
    }
}
