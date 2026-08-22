package com.example.payment_api.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentRequest(

        @NotBlank(message = "Order number is required")
        String orderNumber

) {
}
