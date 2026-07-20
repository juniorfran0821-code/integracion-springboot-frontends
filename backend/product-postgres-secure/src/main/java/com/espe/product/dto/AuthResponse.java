package com.espe.product.dto;

import java.util.List;

public record AuthResponse(
        String username,
        List<String> authorities,
        String message
) {}