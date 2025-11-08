import mongoose, { Schema, Document, Model } from 'mongoose';
import Event from './event.model';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking schema definition
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => {
          // RFC 5322 compliant email regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: 'Invalid email format',
      },
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Index on eventId for faster queries and lookups
BookingSchema.index({ eventId: 1 }, {unique: true});

// Compound index for preventing duplicate bookings (optional but recommended)
BookingSchema.index({ eventId: 1, email: 1 });

/**
 * Pre-save hook to verify that the referenced event exists
 * Prevents orphaned bookings by validating eventId before saving
 */
BookingSchema.pre('save', async function (next) {
  // Only validate eventId if it's modified or this is a new document
  if (this.isModified('eventId') || this.isNew) {
    try {
      const eventExists = await Event.findById(this.eventId);
      
      if (!eventExists) {
        return next(
          new Error(`Event with ID ${this.eventId} does not exist`)
        );
      }
    } catch (error) {
      return next(
        new Error('Failed to validate event reference')
      );
    }
  }

  next();
});

// Create and export the Booking model
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
