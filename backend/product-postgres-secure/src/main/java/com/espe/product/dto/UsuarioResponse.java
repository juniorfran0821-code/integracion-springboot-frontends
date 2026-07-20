package com.espe.product.dto;

public record UsuarioResponse(
        Long id,
        String username,
        String role,
        Boolean enabled
) {}