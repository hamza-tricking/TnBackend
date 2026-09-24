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
  },
  variation: {
    id: { type: Number },
    name: { type: String },
    description: { type: String },
    sku: { type: String },
    attributes: [mongoose.Schema.Types.Mixed]
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
  },
  trackingNumber: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Static method to generate clean, short order number in format: TN-DDMM-XXX (e.g. TN-2409-001)
orderSchema.statics.generateOrderNumber = async function() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `TN-${day}${month}`;

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const count = await this.countDocuments({
    createdAt: { $gte: startOfDay, $lt: endOfDay }
  });

  let seq = count + 1;
  let orderNumber = `${prefix}-${String(seq).padStart(3, '0')}`;
  while (await this.exists({ orderNumber })) {
    seq++;
    orderNumber = `${prefix}-${String(seq).padStart(3, '0')}`;
  }
  return orderNumber;
};

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    this.orderNumber = await this.constructor.generateOrderNumber();
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
