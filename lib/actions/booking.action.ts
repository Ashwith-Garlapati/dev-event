'use server';

import Booking from "@/database/booking.model";
import connectToDatabase from "../mongodb";

export interface CreateBookingResult {
    success: boolean;
    booking?: {
        id: string;
        eventId: string;
        slug: string;
        email: string;
        createdAt?: Date;
    } | null;
    error?: {
        message: string;
        code?: string;
        raw?: unknown;
    };
}

export const createBooking = async (
    { eventId, slug, email }: { eventId: string; slug: string; email: string; }
): Promise<CreateBookingResult> => {
    try {
        // Validate inputs
        if (!eventId?.trim() || !slug?.trim() || !email?.trim()) {
            return {
                success: false,
                booking: null,
                error: {
                    message: 'Missing required fields',
                    code: 'MISSING_FIELDS',
                },
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                booking: null,
                error: {
                    message: 'Invalid email format',
                    code: 'INVALID_EMAIL',
                },
            };
        }

        await connectToDatabase();

        // Check for existing booking
        const existingBooking = await Booking.findOne({ eventId, email }).lean();
        if (existingBooking) {
            // Validate slug consistency
            if (existingBooking.slug !== slug) {
                return {
                    success: false,
                    booking: null,
                    error: {
                        message: 'Booking exists with different event slug',
                        code: 'SLUG_MISMATCH',
                    },
                };
            }

            return {
                success: true,
                booking: {
                    id: String(existingBooking._id), // Convert to string safely
                    eventId: String(existingBooking.eventId),
                    slug: existingBooking.slug,
                    email: existingBooking.email,
                    createdAt: existingBooking.createdAt,
                },
            };
        }
        // Create new booking
        const createdBooking = await Booking.create({ eventId, slug, email });

        return {
            success: true,
            booking: {
                id: String(createdBooking._id), // Use String() constructor instead
                eventId: String(createdBooking.eventId),
                slug: createdBooking.slug,
                email: createdBooking.email,
                createdAt: createdBooking.createdAt,
            },
        };
    } catch (error) {
        console.error("create booking failed", error);

        return {
            success: false,
            booking: null,
            error: {
                message: error instanceof Error ? error.message : 'Failed to create booking',
                code: 'CREATE_BOOKING_ERROR',
            },
        };
    }}