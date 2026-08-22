package com.example.payment_api;

import com.example.payment_api.dto.OrderItemRequest;
import com.example.payment_api.dto.OrderRequest;
import com.example.payment_api.model.Order;
import com.example.payment_api.model.OrderStatus;
import com.example.payment_api.model.Product;
import com.example.payment_api.repository.OrderRepository;
import com.example.payment_api.repository.ProductRepository;
import com.example.payment_api.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)(addFilters = false)
class PaymentApiApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        productRepository.deleteAll();
    }

    @Test
    void applicationContextLoads() {
    }

    // =========================================================
    // PRODUCT TESTS
    // =========================================================

    @Test
    void shouldCreateProduct() throws Exception {

        String requestBody = """
                {
                    "name": "Laptop",
                    "description": "Development laptop",
                    "price": 14999.99,
                    "stock": 10,
                    "active": true
                }
                """;

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Laptop"))
                .andExpect(jsonPath("$.description").value("Development laptop"))
                .andExpect(jsonPath("$.price").value(14999.99))
                .andExpect(jsonPath("$.stock").value(10))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldGetAllProducts() throws Exception {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(10)
                .active(true)
                .build();

        productRepository.save(product);

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Laptop"))
                .andExpect(jsonPath("$[0].description").value("Development laptop"))
                .andExpect(jsonPath("$[0].price").value(14999.99))
                .andExpect(jsonPath("$[0].stock").value(10))
                .andExpect(jsonPath("$[0].active").value(true));
    }

    @Test
    void shouldGetProductById() throws Exception {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(10)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        mockMvc.perform(get("/api/products/" + savedProduct.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedProduct.getId()))
                .andExpect(jsonPath("$.name").value("Laptop"))
                .andExpect(jsonPath("$.description").value("Development laptop"))
                .andExpect(jsonPath("$.price").value(14999.99))
                .andExpect(jsonPath("$.stock").value(10))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldUpdateProduct() throws Exception {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(10)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        String requestBody = """
                {
                    "name": "Laptop Pro",
                    "description": "Updated development laptop",
                    "price": 17999.99,
                    "stock": 8,
                    "active": true
                }
                """;

        mockMvc.perform(put("/api/products/" + savedProduct.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedProduct.getId()))
                .andExpect(jsonPath("$.name").value("Laptop Pro"))
                .andExpect(jsonPath("$.description").value("Updated development laptop"))
                .andExpect(jsonPath("$.price").value(17999.99))
                .andExpect(jsonPath("$.stock").value(8))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void shouldDeleteProduct() throws Exception {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(10)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        mockMvc.perform(delete("/api/products/" + savedProduct.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/products/" + savedProduct.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnNotFoundForMissingProduct() throws Exception {

        mockMvc.perform(get("/api/products/999999"))
                .andExpect(status().isNotFound());
    }

    // =========================================================
    // ORDER TESTS
    // =========================================================

    @Test
    void shouldCreateOrder() {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(10)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        OrderRequest request = new OrderRequest(
                List.of(
                        new OrderItemRequest(savedProduct.getId(), 2)
                )
        );

        Order order = orderService.createOrder(request);

        assertNotNull(order.getId());
        assertNotNull(order.getOrderNumber());
        assertEquals(OrderStatus.PENDING, order.getStatus());
        assertEquals(new BigDecimal("29999.98"), order.getTotalAmount());
        assertEquals(1, order.getItems().size());
        assertEquals(2, order.getItems().get(0).getQuantity());
        assertEquals(
                new BigDecimal("14999.99"),
                order.getItems().get(0).getUnitPrice()
        );
        assertEquals(
                new BigDecimal("29999.98"),
                order.getItems().get(0).getSubtotal()
        );

        Product updatedProduct =
                productRepository.findById(savedProduct.getId()).orElseThrow();

        assertEquals(8, updatedProduct.getStock());
    }

    @Test
    void shouldGetOrderById() {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(10)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        OrderRequest request = new OrderRequest(
                List.of(
                        new OrderItemRequest(savedProduct.getId(), 1)
                )
        );

        Order createdOrder = orderService.createOrder(request);

        Order foundOrder =
                orderService.getOrderById(createdOrder.getId());

        assertEquals(createdOrder.getId(), foundOrder.getId());
        assertEquals(
                createdOrder.getOrderNumber(),
                foundOrder.getOrderNumber()
        );
    }

    @Test
    void shouldGetOrderByNumber() {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(10)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        OrderRequest request = new OrderRequest(
                List.of(
                        new OrderItemRequest(savedProduct.getId(), 1)
                )
        );

        Order createdOrder = orderService.createOrder(request);

        Order foundOrder =
                orderService.getOrderByNumber(createdOrder.getOrderNumber());

        assertEquals(
                createdOrder.getId(),
                foundOrder.getId()
        );
    }

    @Test
    void shouldGetAllOrders() {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(20)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        OrderRequest request = new OrderRequest(
                List.of(
                        new OrderItemRequest(savedProduct.getId(), 1)
                )
        );

        orderService.createOrder(request);

        List<Order> orders = orderService.getAllOrders();

        assertEquals(1, orders.size());
        assertNotNull(orders.get(0).getId());
    }

    @Test
    void shouldUpdateOrderStatus() {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(10)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        OrderRequest request = new OrderRequest(
                List.of(
                        new OrderItemRequest(savedProduct.getId(), 1)
                )
        );

        Order createdOrder = orderService.createOrder(request);

        Order updatedOrder =
                orderService.updateOrderStatus(
                        createdOrder.getId(),
                        "CONFIRMED"
                );

        assertEquals(
                OrderStatus.CONFIRMED,
                updatedOrder.getStatus()
        );
    }

    @Test
    void shouldDeleteOrder() {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(10)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        OrderRequest request = new OrderRequest(
                List.of(
                        new OrderItemRequest(savedProduct.getId(), 1)
                )
        );

        Order createdOrder = orderService.createOrder(request);

        orderService.deleteOrder(createdOrder.getId());

        assertEquals(
                0,
                orderRepository.count()
        );
    }

    @Test
    void shouldRejectOrderWithInsufficientStock() {

        Product product = Product.builder()
                .name("Laptop")
                .description("Development laptop")
                .price(new BigDecimal("14999.99"))
                .stock(2)
                .active(true)
                .build();

        Product savedProduct = productRepository.save(product);

        OrderRequest request = new OrderRequest(
                List.of(
                        new OrderItemRequest(savedProduct.getId(), 5)
                )
        );

        assertThrows(
                RuntimeException.class,
                () -> orderService.createOrder(request)
        );

        assertEquals(0, orderRepository.count());
    }
}