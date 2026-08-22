package com.example.payment_api.service;

import com.example.payment_api.dto.OrderItemRequest;
import com.example.payment_api.dto.OrderRequest;
import com.example.payment_api.model.Order;
import com.example.payment_api.model.OrderItem;
import com.example.payment_api.model.OrderStatus;
import com.example.payment_api.model.Product;
import com.example.payment_api.repository.OrderRepository;
import com.example.payment_api.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Override
    public Order createOrder(OrderRequest request) {

        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Order must contain at least one item"
            );
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.items()) {

            if (itemRequest.quantity() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Quantity must be greater than 0"
                );
            }

            Product product = productRepository
                    .findById(itemRequest.productId())
                    .orElseThrow(() ->
                            new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Product not found with id: "
                                            + itemRequest.productId()
                            )
                    );

            if (!product.getActive()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Product is not active: "
                                + product.getName()
                );
            }

            if (product.getStock() < itemRequest.quantity()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            BigDecimal subtotal = product.getPrice()
                    .multiply(
                            BigDecimal.valueOf(itemRequest.quantity())
                    );

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.quantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subtotal)
                    .build();

            order.getItems().add(orderItem);

            totalAmount = totalAmount.add(subtotal);

            product.setStock(
                    product.getStock() - itemRequest.quantity()
            );
        }

        order.setTotalAmount(totalAmount);

        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Order not found with id: " + id
                        )
                );
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Order not found: " + orderNumber
                        )
                );
    }

    @Override
    public Order updateOrderStatus(Long id, String status) {
        Order order = getOrderById(id);
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(orderStatus);
            return orderRepository.save(order);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid order status: " + status
            );
        }
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = getOrderById(id);
        // Restore stock for each item before deleting the order
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
        orderRepository.delete(order);
    }

    private String generateOrderNumber() {
        return "ORD-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }
}