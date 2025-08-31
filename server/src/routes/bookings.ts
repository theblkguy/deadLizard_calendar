import express from 'express';
import passport from 'passport';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking';
import User from '../models/User';

const router = express.Router();

// Middleware to authenticate user
const authenticate = passport.authenticate('jwt', { session: false });

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get all bookings (admin only) or user's bookings
router.get('/', authenticate, async (req: any, res: any) => {
  try {
    let bookings;
    
    if (req.user.role === 'admin') {
      // Admin can see all bookings
      bookings = await Booking.find()
        .populate('userId', 'name email')
        .sort({ date: 1, startTime: 1 });
    } else {
      // Users can only see their own bookings
      bookings = await Booking.find({ userId: req.user._id })
        .sort({ date: 1, startTime: 1 });
    }
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Get bookings for a specific date (public for guest access)
router.get('/date/:date', async (req: any, res: any) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD' });
    }
    
    const bookings = await Booking.find({ 
      date,
      status: 'confirmed'
    }).select('date startTime endTime title userName');
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings for date:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

// Create a new booking
router.post('/', 
  authenticate,
  [
    body('date').isISO8601().withMessage('Invalid date format'),
    body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
    body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format'),
    body('title').isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
  ],
  async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { date, startTime, endTime, title, description } = req.body;
      
      // Check if start time is before end time
      const start = new Date(`2000-01-01T${startTime}:00`);
      const end = new Date(`2000-01-01T${endTime}:00`);
      
      if (start >= end) {
        return res.status(400).json({ message: 'Start time must be before end time' });
      }
      
      // Check for overlapping bookings
      const overlappingBookings = await Booking.find({
        date,
        status: 'confirmed',
        $or: [
          {
            $and: [
              { startTime: { $lte: startTime } },
              { endTime: { $gt: startTime } }
            ]
          },
          {
            $and: [
              { startTime: { $lt: endTime } },
              { endTime: { $gte: endTime } }
            ]
          },
          {
            $and: [
              { startTime: { $gte: startTime } },
              { endTime: { $lte: endTime } }
            ]
          }
        ]
      });
      
      if (overlappingBookings.length > 0) {
        return res.status(409).json({ 
          message: 'Time slot conflicts with existing booking',
          conflictingBookings: overlappingBookings
        });
      }
      
      // Create new booking
      const booking = new Booking({
        date,
        startTime,
        endTime,
        userId: req.user._id,
        userName: req.user.name,
        title,
        description,
        status: 'confirmed'
      });
      
      await booking.save();
      
      res.status(201).json(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Error creating booking' });
    }
  }
);

// Update a booking
router.put('/:id', authenticate, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updates = req.body;
    Object.assign(booking, updates);
    
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
});

// Delete a booking
router.delete('/:id', authenticate, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Booking.findByIdAndDelete(id);
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

export default router;
