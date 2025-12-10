'use client';

import { createBooking } from "@/lib/actions/booking.action";
import posthog from "posthog-js";
import { useState } from "react";

const BookEvent = ({ eventId, slug }: { eventId: string, slug: string; }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);
        setIsSubmitting(true);

        try {
            const result = await createBooking({ eventId, slug, email });

            if (result.success) {
                setSubmitted(true);
                posthog.capture('event_booked', { eventId, slug });
            } else {
                console.error("Booking creation failed", result.error);
                setError(result.error?.message || 'Failed to create booking. Please try again.');
                // Optional: capture structured error details for observability
                // @ts-ignore - captureException may not exist in all posthog setups
                posthog.captureException?.(
                    new Error(result.error?.message || "Booking creation failed"),
                    { error: result.error, eventId, slug, email }
                );
            }
        } catch (err) {
            console.error("Booking creation threw an exception", err);
            setError('Something went wrong while booking. Please try again.');
            // @ts-ignore - captureException may not exist in all posthog setups
            posthog.captureException?.(
                err instanceof Error ? err : new Error("Booking creation threw an exception"),
                { error: err, eventId, slug, email }
            );
        } finally {
            setIsSubmitting(false);
        }
    }

  return (
    <div id="book-event">
        {submitted ? (
            <p className="text-sm">Thank you for signing up!</p>
        ) : (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        id="email" 
                        placeholder="Enter your email address"
                    />
                    {error && (
                        <p className="text-xs text-red-500 mt-1">{error}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="button-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        )}
    </div>
  )
}

export default BookEvent