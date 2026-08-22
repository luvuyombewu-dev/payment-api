import { useState } from 'react';

import {
    PaymentElement,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';

function StripePayment({
    onSuccess,
    onCancel,
}) {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(event) {
        event.preventDefault();

        if (!stripe || !elements) {
            setError(
                'Stripe payment form is still loading. Please wait.'
            );

            return;
        }

        setLoading(true);
        setError('');

        try {
            const result =
                await stripe.confirmPayment({
                    elements,
                    redirect: 'if_required',
                });

            if (result.error) {
                setError(
                    result.error.message ||
                        'Payment failed.'
                );

                return;
            }

            if (
                result.paymentIntent &&
                result.paymentIntent.status ===
                    'succeeded'
            ) {
                onSuccess(result.paymentIntent);

                return;
            }

            setError(
                `Payment was not completed. Current status: ${
                    result.paymentIntent?.status ||
                    'unknown'
                }`
            );
        } catch (err) {
            console.error(
                'Stripe confirmation error:',
                err
            );

            setError(
                err.message ||
                    'Payment processing failed.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            className="stripe-payment-form"
            onSubmit={handleSubmit}
        >
            <div className="stripe-element-container">
                <PaymentElement />
            </div>

            {error && (
                <div className="message error">
                    {error}
                </div>
            )}

            <div className="form-actions">
                <button
                    type="submit"
                    className="pay-button"
                    disabled={
                        !stripe ||
                        !elements ||
                        loading
                    }
                >
                    {loading
                        ? 'Processing Payment...'
                        : 'Pay Now'}
                </button>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default StripePayment;