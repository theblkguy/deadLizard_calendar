import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  date: string;
  startTime: string;
  endTime: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  title: string;
  description?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema({
  date: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Indexes
BookingSchema.index({ date: 1 });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ date: 1, startTime: 1 });

// Compound index to prevent overlapping bookings
BookingSchema.index({ 
  date: 1, 
  startTime: 1, 
  endTime: 1 
}, { 
  unique: false 
});

// Virtual for duration calculation
BookingSchema.virtual('duration').get(function() {
  const start = new Date(`2000-01-01T${this.startTime}:00`);
  const end = new Date(`2000-01-01T${this.endTime}:00`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Duration in minutes
});

// Method to check if booking overlaps with another
BookingSchema.methods.overlapsWithBooking = function(otherBooking: IBooking): boolean {
  if (this.date !== otherBooking.date) {
    return false;
  }
  
  const thisStart = new Date(`2000-01-01T${this.startTime}:00`);
  const thisEnd = new Date(`2000-01-01T${this.endTime}:00`);
  const otherStart = new Date(`2000-01-01T${otherBooking.startTime}:00`);
  const otherEnd = new Date(`2000-01-01T${otherBooking.endTime}:00`);
  
  return (thisStart < otherEnd && thisEnd > otherStart);
};

export default mongoose.model<IBooking>('Booking', BookingSchema);
