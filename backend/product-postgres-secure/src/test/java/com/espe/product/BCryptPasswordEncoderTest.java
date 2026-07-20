package com.espe.product;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;

class BCryptPasswordEncoderTest {

    @Test
    void debeCodificarYVerificarLaContrasena() {
        PasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String rawPassword = "ClaveSegura123*";

        String hash1 = encoder.encode(rawPassword);
        String hash2 = encoder.encode(rawPassword);

        assertNotEquals(rawPassword, hash1);
        assertNotEquals(hash1, hash2);
        assertTrue(encoder.matches(rawPassword, hash1));
        assertTrue(encoder.matches(rawPassword, hash2));
        assertFalse(encoder.matches("ClaveIncorrecta", hash1));
    }
}