const API_BASE_URL = '/api';

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        try {
            const errorData = await response.json();

            if (errorData.message) {
                message = errorData.message;
            } else if (errorData.error) {
                message = errorData.error;
            }
        } catch {
            // Response did not contain JSON.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

/* =========================
   AUTHENTICATION
   ========================= */

export async function register(userData) {
    return apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

export async function login(credentials) {
    const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });

    if (response.token) {
        localStorage.setItem('token', response.token);
    }

    localStorage.setItem(
        'user',
        JSON.stringify({
            userId: response.userId,
            name: response.name,
            email: response.email,
        })
    );

    return response;
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

export function getToken() {
    return localStorage.getItem('token');
}

export function getCurrentUser() {
    const user = localStorage.getItem('user');

    return user ? JSON.parse(user) : null;
}

/* =========================
   PRODUCTS
   ========================= */

export async function getProducts() {
    return apiRequest('/products');
}

export async function getProductById(id) {
    return apiRequest(`/products/${id}`);
}

export async function createProduct(product) {
    return apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(product),
    });
}

export async function updateProduct(id, product) {
    return apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
    });
}

export async function deleteProduct(id) {
    return apiRequest(`/products/${id}`, {
        method: 'DELETE',
    });
}

/* =========================
   ORDERS
   ========================= */

export async function getOrders() {
    return apiRequest('/orders');
}

export async function getOrderById(id) {
    return apiRequest(`/orders/${id}`);
}

export async function getOrderByNumber(orderNumber) {
    return apiRequest(
        `/orders/number/${encodeURIComponent(orderNumber)}`
    );
}

export async function createOrder(items) {
    return apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
            items,
        }),
    });
}

export async function updateOrderStatus(id, status) {
    return apiRequest(
        `/orders/${id}/status?status=${encodeURIComponent(status)}`,
        {
            method: 'PUT',
        }
    );
}

export async function deleteOrder(id) {
    return apiRequest(`/orders/${id}`, {
        method: 'DELETE',
    });
}

/* =========================
   PAYMENTS
   ========================= */

export async function createPayment(orderNumber) {
    return apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify({
            orderNumber,
        }),
    });
}