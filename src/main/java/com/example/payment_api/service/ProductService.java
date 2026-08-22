package com.example.payment_api.service;

import com.example.payment_api.dto.ProductRequest;
import com.example.payment_api.model.Product;

import java.util.List;

public interface ProductService {

    Product createProduct(ProductRequest request);

    List<Product> getAllProducts();

    Product getProductById(Long id);

    Product updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);
}