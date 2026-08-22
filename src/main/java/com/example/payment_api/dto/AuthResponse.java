package com.example.payment_api.dto;

public record AuthResponse(

        String token,
        String type,
        Long userId,
        String name,
        String email

) {
}