package com.example.payment_api.dto;

public record PaymentResponse(

        String paymentIntentId,

        String clientSecret,

        String status,

        String orderNumber

) {
}
