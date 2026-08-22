package com.example.payment_api.service;

import com.example.payment_api.dto.OrderRequest;
import com.example.payment_api.model.Order;

import java.util.List;

public interface OrderService {

    Order createOrder(OrderRequest request);

    List<Order> getAllOrders();

    Order getOrderById(Long id);

    Order getOrderByNumber(String orderNumber);

    Order updateOrderStatus(Long id, String status);

    void deleteOrder(Long id);
}