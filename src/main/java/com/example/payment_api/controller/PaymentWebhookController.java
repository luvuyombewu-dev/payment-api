package com.example.payment_api.controller;

import com.example.payment_api.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentService paymentService;

    @PostMapping("/api/payments/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature
    ) {

        paymentService.handleWebhook(
                payload,
                signature
        );

        return ResponseEntity.ok("Webhook received");
    }
}