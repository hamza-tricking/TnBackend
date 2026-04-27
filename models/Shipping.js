const mongoose = require('mongoose');

const shippingPriceSchema = new mongoose.Schema({
  wilaya: {
    type: String,
    required: [true, 'Wilaya name is required'],
    trim: true,
    unique: true
  },
  home: {
    type: Number,
    required: [true, 'Home delivery price is required'],
    min: [0, 'Price cannot be negative'],
    default: 600
  },
  bureau: {
    type: Number,
    required: [true, 'Bureau delivery price is required'],
    min: [0, 'Price cannot be negative'],
    default: 400
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for faster lookups
shippingPriceSchema.index({ wilaya: 1 });

// Static method to get all active shipping prices
shippingPriceSchema.statics.getActivePrices = function() {
  return this.find({ isActive: true }).sort({ wilaya: 1 });
};

// Static method to get shipping price for specific wilaya
shippingPriceSchema.statics.getPriceForWilaya = function(wilaya) {
  return this.findOne({ wilaya: wilaya, isActive: true });
};

// Static method to bulk update prices
shippingPriceSchema.statics.bulkUpdatePrices = function(updates) {
  const bulkOps = updates.map(update => ({
    updateOne: {
      filter: { wilaya: update.wilaya },
      update: { 
        $set: {
          home: update.home,
          bureau: update.bureau,
          isActive: update.isActive !== undefined ? update.isActive : true
        }
      },
      upsert: true
    }
  }));
  
  return this.bulkWrite(bulkOps);
};

// Static method to initialize default prices for all Algerian wilayas
shippingPriceSchema.statics.initializeDefaults = function() {
  const algerianWilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 
    'Bechar', 'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 
    'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 
    'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 
    'MSila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh', 'Boumerdès', 'El Tarf', 
    'Tindouf', 'Tissemsilt', 'Eloued', 'Khenchela', 'Souk Ahras', 'Tipaza', 
    'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 
    'Timimoun', 'Djinet', 'El MGhair', 'El Menia', 'Bordj Bou Arreridj'
  ];

  const operations = algerianWilayas.map(wilaya => ({
    updateOne: {
      filter: { wilaya },
      update: { 
        $setOnInsert: {
          home: 600,
          bureau: 400,
          isActive: true
        }
      },
      upsert: true
    }
  }));

  return this.bulkWrite(operations);
};

module.exports = mongoose.model('Shipping', shippingPriceSchema);
