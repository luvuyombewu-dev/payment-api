package com.example.payment_api.service;

import com.example.payment_api.dto.AuthResponse;
import com.example.payment_api.dto.LoginRequest;
import com.example.payment_api.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}