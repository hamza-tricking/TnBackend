const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for guest orders
  },
  // Guest customer information
  customerInfo: {
    fullName: {
      type: String,
      required: function() { return !this.user; } // Required only for guest orders
    },
    phone: {
      type: String,
      required: function() { return !this.user; }
    },
    email: {
      type: String,
      required: false
    }
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    wilaya: {
      type: String,
      required: true
    },
    baladiya: {
      type: String,
      required: false
    },
    zipCode: {
      type: String,
      required: false
    },
    country: {
      type: String,
      required: true,
      default: 'Algeria'
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery']
  },
  shippingMethod: {
    type: String,
    required: true,
    enum: ['home', 'bureau'],
    default: 'home'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    required: true,
    min: [0, 'Tax cannot be negative'],
    default: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    min: [0, 'Shipping cost cannot be negative'],
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Calculate total before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('tax') || this.isModified('shippingCost')) {
    this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    this.total = this.subtotal + this.tax + this.shippingCost;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
