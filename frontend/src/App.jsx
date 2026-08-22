import { useEffect, useState } from 'react';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import StripePayment from './components/StripePayment';

import {
    login,
    register,
    logout,
    getCurrentUser,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    createPayment,
    getOrderByNumber,
    updateOrderStatus,
} from './services/api';

import './App.css';

const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

function App() {
    /* =========================
       AUTHENTICATION
       ========================= */

    const [user, setUser] = useState(getCurrentUser());
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });

    /* =========================
       PRODUCTS
       ========================= */

    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        active: true,
    });
    const [editingProductId, setEditingProductId] = useState(null);

    /* =========================
       CART
       ========================= */

    const [cart, setCart] = useState([]);

    /* =========================
       ORDERS
       ========================= */

    const [createdOrder, setCreatedOrder] = useState(null);

    /* =========================
       PAYMENTS
       ========================= */

    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    /* =========================
       GENERAL STATE
       ========================= */

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /* =========================
       LOAD PRODUCTS
       ========================= */

    useEffect(() => {
        if (user) {
            loadProducts();
        }
    }, [user]);

    async function loadProducts() {
        setProductsLoading(true);

        try {
            const data = await getProducts();
            console.log('Products loaded:', data);
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Load products error:', err);
            setError(err.message || 'Failed to load products.');
        } finally {
            setProductsLoading(false);
        }
    }

    /* =========================
       AUTHENTICATION
       ========================= */

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    }

    async function handleAuthSubmit(event) {
        event.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            if (mode === 'register') {
                await register({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                });

                setMessage('Registration successful. You can now log in.');
                setMode('login');
                setForm({
                    name: '',
                    email: form.email,
                    password: '',
                });
            } else {
                const response = await login({
                    email: form.email,
                    password: form.password,
                });

                setUser({
                    userId: response.userId,
                    name: response.name,
                    email: response.email,
                });
                setMessage(`Welcome, ${response.name}!`);
                setForm({
                    name: '',
                    email: '',
                    password: '',
                });
            }
        } catch (err) {
            console.error('Authentication error:', err);
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        logout();
        setUser(null);
        setProducts([]);
        setCart([]);
        setCreatedOrder(null);
        setPaymentResult(null);
        setMessage('');
        setError('');
    }

    /* =========================
       PRODUCT FORM
       ========================= */

    function handleProductChange(event) {
        const { name, value, type, checked } = event.target;
        setProductForm({
            ...productForm,
            [name]: type === 'checkbox' ? checked : value,
        });
    }

    async function handleProductSubmit(event) {
        event.preventDefault();
        setMessage('');
        setError('');

        try {
            const product = {
                name: productForm.name,
                description: productForm.description,
                price: Number(productForm.price),
                stock: Number(productForm.stock),
                active: productForm.active,
            };

            if (editingProductId !== null) {
                await updateProduct(editingProductId, product);
                setMessage('Product updated successfully.');
            } else {
                await createProduct(product);
                setMessage('Product created successfully.');
            }

            resetProductForm();
            await loadProducts();
        } catch (err) {
            console.error('Save product error:', err);
            setError(err.message || 'Failed to save product.');
        }
    }

    function resetProductForm() {
        setProductForm({
            name: '',
            description: '',
            price: '',
            stock: '',
            active: true,
        });
        setEditingProductId(null);
    }

    function editProduct(product) {
        setEditingProductId(product.id);
        setProductForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            stock: product.stock,
            active:
                product.active === true ||
                product.active === 'true' ||
                product.active === 1,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function handleDeleteProduct(id) {
        setMessage('');
        setError('');

        try {
            await deleteProduct(id);
            setMessage('Product deleted successfully.');
            setCart((currentCart) =>
                currentCart.filter((item) => item.product.id !== id)
            );
            await loadProducts();
        } catch (err) {
            console.error('Delete product error:', err);
            setError(err.message || 'Failed to delete product.');
        }
    }

    /* =========================
       PRODUCT STATUS HELPERS
       ========================= */

    function isProductActive(product) {
        return (
            product.active === true ||
            product.active === 'true' ||
            product.active === 1
        );
    }

    function getProductStock(product) {
        const stock = Number(product.stock);
        return Number.isFinite(stock) ? stock : 0;
    }

    /* =========================
       SHOPPING CART
       ========================= */

    function addToCart(product) {
        const active = isProductActive(product);
        const stock = getProductStock(product);

        console.log('Adding product to cart:', product);

        if (!active) {
            setError(`${product.name} is inactive.`);
            setMessage('');
            return;
        }

        if (stock <= 0) {
            setError(`${product.name} is out of stock.`);
            setMessage('');
            return;
        }

        const existing = cart.find(
            (item) => item.product.id === product.id
        );

        if (existing) {
            if (existing.quantity >= stock) {
                setError(`Only ${stock} ${product.name} available in stock.`);
                setMessage('');
                return;
            }

            setCart((currentCart) =>
                currentCart.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
            setMessage(`${product.name} quantity increased.`);
            setError('');
            return;
        }

        setCart((currentCart) => [
            ...currentCart,
            {
                product: { ...product, stock },
                quantity: 1,
            },
        ]);
        setMessage(`${product.name} added to cart.`);
        setError('');
    }

    function increaseQuantity(productId) {
        setCart((currentCart) =>
            currentCart.map((item) => {
                if (item.product.id !== productId) {
                    return item;
                }
                const stock = getProductStock(item.product);
                if (item.quantity >= stock) {
                    return item;
                }
                return { ...item, quantity: item.quantity + 1 };
            })
        );
    }

    function decreaseQuantity(productId) {
        setCart((currentCart) =>
            currentCart
                .map((item) => {
                    if (item.product.id !== productId) {
                        return item;
                    }
                    return { ...item, quantity: item.quantity - 1 };
                })
                .filter((item) => item.quantity > 0)
        );
    }

    function removeFromCart(productId) {
        setCart((currentCart) =>
            currentCart.filter((item) => item.product.id !== productId)
        );
        setMessage('Item removed from cart.');
    }

    function getCartTotal() {
        return cart.reduce(
            (total, item) =>
                total + Number(item.product.price) * item.quantity,
            0
        );
    }

    /* =========================
       CREATE ORDER
       ========================= */

    async function handleCreateOrder() {
        if (cart.length === 0) {
            setError('Your cart is empty.');
            return;
        }

        setMessage('');
        setError('');
        setPaymentResult(null);
        setLoading(true);

        try {
            const items = cart.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
            }));

            console.log('Creating order with:', items);
            const order = await createOrder(items);
            setCreatedOrder(order);
            setCart([]);
            setMessage('Order created successfully.');
            await loadProducts();
        } catch (err) {
            console.error('Create order error:', err);
            setError(err.message || 'Failed to create order.');
        } finally {
            setLoading(false);
        }
    }

    /* =========================
       CREATE PAYMENT
       ========================= */

    async function handlePayment() {
        if (!createdOrder) {
            setError('No order is available for payment.');
            return;
        }

        setMessage('');
        setError('');
        setPaymentLoading(true);
        setPaymentResult(null);
        setShowPaymentForm(false);

        try {
            const payment = await createPayment(createdOrder.orderNumber);
            setPaymentResult(payment);
            setShowPaymentForm(true);
            setMessage('Payment is ready. Enter your card details.');
            console.log('PaymentIntent created:', payment.paymentIntentId);
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message || 'Failed to create payment.');
        } finally {
            setPaymentLoading(false);
        }
    }

    /* =========================
       LOGIN / REGISTER SCREEN
       ========================= */

    if (!user) {
        return (
            <main className="app">
                <section className="auth-card">
                    <div className="brand">
                        <h1>Payment API</h1>
                        <p>Secure payment and order management</p>
                    </div>

                    <div className="tabs">
                        <button
                            type="button"
                            className={mode === 'login' ? 'active' : ''}
                            onClick={() => {
                                setMode('login');
                                setMessage('');
                                setError('');
                            }}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className={mode === 'register' ? 'active' : ''}
                            onClick={() => {
                                setMode('register');
                                setMessage('');
                                setError('');
                            }}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleAuthSubmit}>
                        {mode === 'register' && (
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        {error && <div className="message error">{error}</div>}
                        {message && <div className="message success">{message}</div>}

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading
                                ? 'Please wait...'
                                : mode === 'login'
                                ? 'Login'
                                : 'Create Account'}
                        </button>
                    </form>
                </section>
            </main>
        );
    }

    /* =========================
       DASHBOARD
       ========================= */

    return (
        <main className="dashboard">
            <header className="topbar">
                <div>
                    <h1>Payment API</h1>
                    <p>Product and Order Management</p>
                </div>

                <div className="user-area">
                    <span>
                        Welcome, <strong>{user.name}</strong>
                    </span>
                    <button
                        type="button"
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="content">
                {error && <div className="message error">{error}</div>}
                {message && <div className="message success">{message}</div>}

                {/* =========================
                    PRODUCTS
                   ========================= */}

                <section className="panel">
                    <div className="section-header">
                        <div>
                            <h2>Products</h2>
                            <p>Create products and add them to your order.</p>
                        </div>
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={loadProducts}
                            disabled={productsLoading}
                        >
                            {productsLoading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    <form className="product-form" onSubmit={handleProductSubmit}>
                        <h3>
                            {editingProductId !== null
                                ? 'Edit Product'
                                : 'Add Product'}
                        </h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="product-name">Product Name</label>
                                <input
                                    id="product-name"
                                    name="name"
                                    value={productForm.name}
                                    onChange={handleProductChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="product-price">Price</label>
                                <input
                                    id="product-price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={productForm.price}
                                    onChange={handleProductChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="product-stock">Stock</label>
                                <input
                                    id="product-stock"
                                    name="stock"
                                    type="number"
                                    min="0"
                                    value={productForm.stock}
                                    onChange={handleProductChange}
                                    required
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        name="active"
                                        type="checkbox"
                                        checked={productForm.active}
                                        onChange={handleProductChange}
                                    />
                                    Active
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="product-description">Description</label>
                            <textarea
                                id="product-description"
                                name="description"
                                value={productForm.description}
                                onChange={handleProductChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="primary-button">
                                {editingProductId !== null
                                    ? 'Update Product'
                                    : 'Create Product'}
                            </button>
                            {editingProductId !== null && (
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={resetProductForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="product-list">
                        <h3>Product List</h3>
                        {products.length === 0 ? (
                            <p className="empty">No products found.</p>
                        ) : (
                            products.map((product) => {
                                const active = isProductActive(product);
                                const stock = getProductStock(product);

                                return (
                                    <article
                                        className="product-card"
                                        key={product.id}
                                    >
                                        <div className="product-info">
                                            <div className="product-title">
                                                <h4>{product.name}</h4>
                                                <span
                                                    className={
                                                        active
                                                            ? 'status active'
                                                            : 'status inactive'
                                                    }
                                                >
                                                    {active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <p>{product.description || 'No description'}</p>
                                            <div className="product-meta">
                                                <span>
                                                    Price:{' '}
                                                    <strong>
                                                        R {Number(product.price).toFixed(2)}
                                                    </strong>
                                                </span>
                                                <span>
                                                    Stock: <strong>{stock}</strong>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="product-actions">
                                            <button
                                                type="button"
                                                className="primary-button"
                                                onClick={() => addToCart(product)}
                                                disabled={!active || stock <= 0}
                                            >
                                                Add to Cart
                                            </button>
                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={() => editProduct(product)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="danger-button"
                                                onClick={() => handleDeleteProduct(product.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* =========================
                    SHOPPING CART
                   ========================= */}

                <section className="panel">
                    <div className="section-header">
                        <div>
                            <h2>Shopping Cart</h2>
                            <p>Review your products before creating the order.</p>
                        </div>
                    </div>

                    {cart.length === 0 ? (
                        <p className="empty">Your cart is empty.</p>
                    ) : (
                        <>
                            <div className="cart-list">
                                {cart.map((item) => (
                                    <div
                                        className="cart-item"
                                        key={item.product.id}
                                    >
                                        <div>
                                            <h4>{item.product.name}</h4>
                                            <p>
                                                R{' '}
                                                {Number(item.product.price).toFixed(2)}{' '}
                                                each
                                            </p>
                                        </div>

                                        <div className="quantity-controls">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    decreaseQuantity(item.product.id)
                                                }
                                            >
                                                −
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    increaseQuantity(item.product.id)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>

                                        <strong>
                                            R{' '}
                                            {(
                                                Number(item.product.price) *
                                                item.quantity
                                            ).toFixed(2)}
                                        </strong>

                                        <button
                                            type="button"
                                            className="danger-button"
                                            onClick={() =>
                                                removeFromCart(item.product.id)
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-summary">
                                <span>Total</span>
                                <strong>R {getCartTotal().toFixed(2)}</strong>
                            </div>

                            <button
                                type="button"
                                className="primary-button create-order-button"
                                onClick={handleCreateOrder}
                                disabled={loading}
                            >
                                {loading ? 'Creating Order...' : 'Create Order'}
                            </button>
                        </>
                    )}
                </section>

                {/* =========================
                    CREATED ORDER
                   ========================= */}

                {createdOrder && (
                    <section className="panel order-panel">
                        <div className="section-header">
                            <div>
                                <h2>Order Created</h2>
                                <p>Your order has been successfully created.</p>
                            </div>
                        </div>

                        <div className="order-details">
                            <div>
                                <span>Order Number</span>
                                <strong>{createdOrder.orderNumber}</strong>
                            </div>
                            <div>
                                <span>Total</span>
                                <strong>
                                    R {Number(createdOrder.totalAmount).toFixed(2)}
                                </strong>
                            </div>
                            <div>
                                <span>Status</span>
                                <strong className="status pending">
                                    {createdOrder.status}
                                </strong>
                            </div>
                        </div>

                        {/* =========================
                            PAYMENT BUTTON
                           ========================= */}

                        <button
                            type="button"
                            className="pay-button"
                            onClick={handlePayment}
                            disabled={paymentLoading}
                        >
                            {paymentLoading
                                ? 'Preparing Payment...'
                                : 'Pay Now — Stripe'}
                        </button>

                        {/* =========================
                            PAYMENT RESULT
                           ========================= */}

                        {paymentResult && showPaymentForm && (
                            <div className="payment-result">
                                <h3>Complete Payment</h3>

                                <p>
                                    Order:{' '}
                                    <strong>{paymentResult.orderNumber}</strong>
                                </p>
                                <p>
                                    Amount:{' '}
                                    <strong>
                                        R {Number(createdOrder.totalAmount).toFixed(2)}
                                    </strong>
                                </p>

                                <Elements
                                    stripe={stripePromise}
                                    options={{
                                        clientSecret: paymentResult.clientSecret,
                                    }}
                                >
                                    <StripePayment
                                        onSuccess={async (paymentIntent) => {
                                            console.log(
                                                'Payment succeeded:',
                                                paymentIntent.id
                                            );

                                            setShowPaymentForm(false);
                                            setPaymentResult({
                                                ...paymentResult,
                                                status: 'succeeded',
                                            });
                                            setCreatedOrder((currentOrder) => ({
                                                ...currentOrder,
                                                status: 'PAID',
                                            }));
                                            setMessage('Payment completed successfully.');

                                            // Update backend order status directly
                                            try {
                                                await updateOrderStatus(
                                                    createdOrder.id,
                                                    'PAID'
                                                );
                                                console.log(
                                                    'Backend order status updated to PAID'
                                                );
                                            } catch (err) {
                                                console.error(
                                                    'Failed to update order status in backend',
                                                    err
                                                );
                                                setError(
                                                    'Payment succeeded but failed to update order status.'
                                                );
                                            }
                                        }}
                                        onCancel={() => {
                                            setShowPaymentForm(false);
                                        }}
                                    />
                                </Elements>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}

export default App;