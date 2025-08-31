import express from 'express';
import passport from 'passport';
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

// Get all users (admin only)
router.get('/', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const users = await User.find()
      .select('-googleId')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID (admin only or own profile)
router.get('/:id', authenticate, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Users can only access their own profile, admins can access any
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findById(id).select('-googleId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user profile
router.put('/:id', authenticate, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Users can only update their own profile, admins can update any
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updates = req.body;
    
    // Prevent users from changing their own role (only admin can do this)
    if (req.user.role !== 'admin' && updates.role) {
      delete updates.role;
    }
    
    // Prevent updating sensitive fields
    delete updates.googleId;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-googleId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Update user role (admin only)
router.patch('/:id/role', authenticate, requireAdmin, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['guest', 'user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Prevent admin from changing their own role
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-googleId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

export default router;
