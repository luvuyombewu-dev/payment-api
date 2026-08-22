package com.example.payment_api.controller;

import com.example.payment_api.dto.OrderRequest;
import com.example.payment_api.model.Order;
import com.example.payment_api.service.OrderService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @Valid @RequestBody OrderRequest request
    ) {

        Order order = orderService.createOrder(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(order);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                orderService.getOrderById(id)
        );
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(
            @PathVariable String orderNumber
    ) {

        return ResponseEntity.ok(
                orderService.getOrderByNumber(orderNumber)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, status)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Long id
    ) {

        orderService.deleteOrder(id);

        return ResponseEntity.noContent().build();
    }
}