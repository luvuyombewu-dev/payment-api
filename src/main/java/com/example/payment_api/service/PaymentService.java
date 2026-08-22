package com.example.payment_api.service;

import com.example.payment_api.dto.PaymentRequest;
import com.example.payment_api.dto.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    void handleWebhook(String payload, String signature);
}