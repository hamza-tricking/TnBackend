

// Or using native fetch in Node 18+
const API_URL = 'https://api.yalidine.com/v1';

class YalidineService {
  constructor() {
    this.apiId = process.env.YALIDINE_API_ID;
    this.apiToken = process.env.YALIDINE_API_TOKEN;
  }

  getHeaders() {
    return {
      'X-API-ID': this.apiId,
      'X-API-TOKEN': this.apiToken,
      'Content-Type': 'application/json'
    };
  }

  async createParcel(order) {
    if (!this.apiId || !this.apiToken) {
      throw new Error('Yalidine API credentials are not configured.');
    }

    // Determine stopdesk based on shipping method
    const isStopdesk = order.shippingMethod === 'bureau';
    
    // Extract name
    const fullName = order.customerInfo?.fullName || order.user?.username || 'Client';
    const names = fullName.trim().split(' ');
    const firstname = names[0];
    const familyname = names.slice(1).join(' ') || '.';

    const parcelData = {
      order_id: order.orderNumber,
      firstname: firstname,
      familyname: familyname,
      contact_phone: order.customerInfo?.phone || '0000000000',
      address: order.shippingAddress.street || '.',
      to_commune_name: order.shippingAddress.baladiya || order.shippingAddress.city,
      to_wilaya_name: order.shippingAddress.wilaya,
      product_list: order.items.map(item => `${item.quantity}x ${item.product?.name || 'Product'}`).join(', '),
      price: order.total,
      freeshipping: false,
      is_stopdesk: isStopdesk,
      has_exchange: false,
      product_to_collect: null
    };

    console.log('Sending parcel to Yalidine:', parcelData);

    try {
      const response = await global.fetch(`${API_URL}/parcels/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify([parcelData])
      });

      const data = await response.json();
      
      if (!response.ok || (data.error && data.error.code)) {
        console.error('Yalidine API Error:', data);
        throw new Error(data.error?.message || 'Failed to create parcel in Yalidine');
      }
      
      // Look at the returned structure. If validation fails, Yalidine returns { [tracking]: 'Error details...' } sometimes,
      // but usually successful creation returns an object with a tracking number mapped to success
      
      return data;
    } catch (error) {
      console.error('Yalidine Service Error:', error);
      throw error;
    }
  }
}

module.exports = new YalidineService();
