package com.example.payment_api.service;

import com.example.payment_api.config.StripeConfig;
import com.example.payment_api.dto.PaymentRequest;
import com.example.payment_api.dto.PaymentResponse;
import com.example.payment_api.model.Order;
import com.example.payment_api.model.OrderStatus;
import com.example.payment_api.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentCreateParams.AutomaticPaymentMethods;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final StripeConfig stripeConfig;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        if (stripeConfig.getStripeSecretKey() == null || stripeConfig.getStripeSecretKey().isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stripe secret key is not configured");
        }
        Stripe.apiKey = stripeConfig.getStripeSecretKey();
        Order order = orderService.getOrderByNumber(request.orderNumber());
        if (order.getTotalAmount() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order total amount is missing");
        }
        if (order.getTotalAmount().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order total amount must be greater than zero");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is not available for payment");
        }
        long amountInCents;
        try {
            amountInCents = order.getTotalAmount().movePointRight(2).longValueExact();
        } catch (ArithmeticException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order amount", e);
        }
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("zar")
                .putMetadata("orderNumber", order.getOrderNumber())
                .setAutomaticPaymentMethods(AutomaticPaymentMethods.builder().setEnabled(true).build())
                .build();
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            return new PaymentResponse(paymentIntent.getId(), paymentIntent.getClientSecret(), paymentIntent.getStatus(), order.getOrderNumber());
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Stripe payment creation failed: " + e.getMessage(), e);
        }
    }

    @Override
    public void handleWebhook(String payload, String signature) {
        String webhookSecret = stripeConfig.getStripeWebhookSecret();
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stripe webhook secret is not configured");
        }
        final Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Stripe webhook signature");
        }
        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(payload);
            case "payment_intent.payment_failed" -> handlePaymentIntentFailed(payload);
            default -> System.out.println("Ignoring Stripe event: " + event.getType());
        }
    }

    private void handlePaymentIntentSucceeded(String payload) {
        try {
            String orderNumber = extractOrderNumber(payload);
            if (orderNumber == null || orderNumber.isBlank()) {
                System.err.println("PaymentIntent has no orderNumber metadata");
                return;
            }
            Order order = orderRepository.findByOrderNumber(orderNumber).orElse(null);
            if (order == null) {
                System.err.println("Order not found for Stripe PaymentIntent: " + orderNumber);
                return;
            }
            if (order.getStatus() == OrderStatus.PAID) {
                System.out.println("Order already marked PAID: " + orderNumber);
                return;
            }
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
            System.out.println("Payment confirmed. Order marked PAID: " + orderNumber);
        } catch (Exception e) {
            System.err.println("Failed to process payment_intent.succeeded event: " + e.getMessage());
        }
    }

    private void handlePaymentIntentFailed(String payload) {
        try {
            String orderNumber = extractOrderNumber(payload);
            if (orderNumber == null || orderNumber.isBlank()) return;
            System.out.println("Payment failed for order: " + orderNumber);
        } catch (Exception e) {
            System.err.println("Failed to process payment_intent.payment_failed event: " + e.getMessage());
        }
    }

    private String extractOrderNumber(String rawJson) {
        if (rawJson == null || rawJson.isEmpty()) return null;
        Pattern pattern = Pattern.compile("\"orderNumber\"\\s*:\\s*\"([^\"]+)\"");
        Matcher matcher = pattern.matcher(rawJson);
        return matcher.find() ? matcher.group(1) : null;
    }
}