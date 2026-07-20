package com.espe.product.controller;

import com.espe.product.dto.*;
import com.espe.product.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar un usuario con rol USER")
    public ResponseEntity<UsuarioResponse> registrar(
            @Valid @RequestBody RegistroUsuarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usuarioService.registrar(request));
    }

    @PostMapping("/login")
    @SecurityRequirement(name = "basicAuth")
    @Operation(summary = "Comprobar credenciales con HTTP Basic")
    public AuthResponse login(Authentication authentication) {
        return respuesta(authentication, "Autenticación correcta");
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "basicAuth")
    @Operation(summary = "Consultar el usuario autenticado")
    public AuthResponse me(Authentication authentication) {
        return respuesta(authentication, "Usuario autenticado");
    }

    private AuthResponse respuesta(Authentication authentication,
                                   String message) {
        return new AuthResponse(
                authentication.getName(),
                authentication.getAuthorities().stream()
                        .map(Object::toString).toList(),
                message);
    }
}