
// Standard Yalidine API v1 endpoint
const API_URL = 'https://api.yalidine.app/v1';

// Map from checkout wilaya names → Yalidine exact wilaya names
const WILAYA_NAME_MAP = {
  'Adrar': 'Adrar',
  'Chlef': 'Chlef',
  'Laghouat': 'Laghouat',
  'Oum El Bouaghi': 'Oum El Bouaghi',
  'Batna': 'Batna',
  'Béjaïa': 'Béjaïa',
  'Bejaia': 'Béjaïa',
  'Bejaïa': 'Béjaïa',
  'Biskra': 'Biskra',
  'Béchar': 'Béchar',
  'Bechar': 'Béchar',
  'Blida': 'Blida',
  'Bouira': 'Bouira',
  'Tamanrasset': 'Tamanrasset',
  'Tébessa': 'Tébessa',
  'Tebessa': 'Tébessa',
  'Tlemcen': 'Tlemcen',
  'Tiaret': 'Tiaret',
  'Tizi Ouzou': 'Tizi Ouzou',
  'Alger': 'Alger',
  'Djelfa': 'Djelfa',
  'Jijel': 'Jijel',
  'Sétif': 'Sétif',
  'Setif': 'Sétif',
  'Saïda': 'Saïda',
  'Saida': 'Saïda',
  'Skikda': 'Skikda',
  'Sidi Bel Abbès': 'Sidi Bel Abbès',
  'Sidi Bel Abbes': 'Sidi Bel Abbès',
  'Annaba': 'Annaba',
  'Guelma': 'Guelma',
  'Constantine': 'Constantine',
  'Médéa': 'Médéa',
  'Medea': 'Médéa',
  'Mostaganem': 'Mostaganem',
  "M'Sila": "M'Sila",
  "M'sila": "M'Sila",
  'Mascara': 'Mascara',
  'Ouargla': 'Ouargla',
  'Oran': 'Oran',
  'El Bayadh': 'El Bayadh',
  'Illizi': 'Illizi',
  'Bordj Bou Arréridj': 'Bordj Bou Arreridj',
  'Bordj Bou Arreridj': 'Bordj Bou Arreridj',
  'Boumerdès': 'Boumerdès',
  'Boumerdes': 'Boumerdès',
  'El Tarf': 'El Tarf',
  'Tindouf': 'Tindouf',
  'Tissemsilt': 'Tissemsilt',
  'El Oued': 'El Oued',
  'Khenchela': 'Khenchela',
  'Souk Ahras': 'Souk Ahras',
  'Tipaza': 'Tipaza',
  'Mila': 'Mila',
  'Aïn Defla': 'Aïn Defla',
  'Ain Defla': 'Aïn Defla',
  'Aïn Temouchent': 'Aïn Témouchent',
  'Ain Temouchent': 'Aïn Témouchent',
  'Aïn Témouchent': 'Aïn Témouchent',
  'Ghardaïa': 'Ghardaïa',
  'Ghardaia': 'Ghardaïa',
  'Relizane': 'Relizane',
  'Timimoun': 'Timimoun',
  'Bordj Badji Mokhtar': 'Bordj Badji Mokhtar',
  'Ouled Djellal': 'Ouled Djellal',
  'Béni Abbès': 'Béni Abbès',
  'Beni Abbes': 'Béni Abbès',
  'In Salah': 'In Salah',
  'In Guezzam': 'In Guezzam',
  'Touggourt': 'Touggourt',
  'Djanet': 'Djanet',
  "El M'Ghair": "El M'Ghair",
  'El Menia': 'El Menia',
};

function normalizeWilayaName(name) {
  if (!name) return name;
  if (WILAYA_NAME_MAP[name]) return WILAYA_NAME_MAP[name];
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(WILAYA_NAME_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }
  return name;
}

let communesByWilaya = {};
try {
  communesByWilaya = require('../data/yalidineCommunesByWilaya.json');
} catch (e) {
  console.warn('Could not load local yalidineCommunesByWilaya.json:', e.message);
}

const ARABIC_WILAYA_MAP = {
  'الجزائر': 'Alger Centre',
  'وهران': 'Oran',
  'قسنطينة': 'Constantine',
  'سطيف': 'Sétif',
  'عنابة': 'Annaba',
  'البليدة': 'Blida',
  'تلمسان': 'Tlemcen',
  'باتنة': 'Batna',
  'بجاية': 'Béjaïa',
  'بسكرة': 'Biskra',
  'تيزي وزو': 'Tizi Ouzou',
  'بومرداس': 'Boumerdes',
  'تيبازة': 'Tipaza',
  'الشلف': 'Chlef',
  'مستغانم': 'Mostaganem',
  'برج بوعريريج': 'Bordj Bou Arreridj',
  'المدية': 'Médéa',
  'عين الدفلى': 'Aïn Defla',
  'جيجل': 'Jijel',
  'سكيكدة': 'Skikda',
  'قالمة': 'Guelma',
  'ورقلة': 'Ouargla',
  'الوادي': 'El Oued',
  'غرداية': 'Ghardaïa',
  'خنشلة': 'Khenchela',
  'سوق أهراس': 'Souk Ahras',
  'ميلة': 'Mila',
  'عين تموشنت': 'Aïn Témouchent',
  'غليزان': 'Relizane',
  'تيارت': 'Tiaret',
  'الأغواط': 'Laghouat',
  'المسيلة': "M'Sila",
  'معسكر': 'Mascara',
  'تبسة': 'Tébessa',
  'سعيدة': 'Saïda',
  'تيسمسيلت': 'Tissemsilt',
  'الطارف': 'El Tarf',
  'تندوف': 'Tindouf',
  'أدرار': 'Adrar',
  'بشار': 'Béchar',
  'تمنراست': 'Tamanrasset',
  'إليزي': 'Illizi',
  'تيميمون': 'Timimoun',
  'برج باجي مختار': 'Bordj Badji Mokhtar',
  'أولاد جلال': 'Ouled Djellal',
  'بني عباس': 'Béni Abbès',
  'عين صالح': 'In Salah',
  'عين قزام': 'In Guezzam',
  'تقرت': 'Touggourt',
  'جانت': 'Djanet',
  'المغير': "El M'Ghair",
  'المنيعة': 'El Menia'
};

function stripAccents(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function normalizeCommuneName(inputCommune, normalizedWilaya) {
  const communes = communesByWilaya[normalizedWilaya] || [];
  if (communes.length === 0) return inputCommune || normalizedWilaya;

  // Determine default chef-lieu commune for this wilaya
  let defaultCommune = communes.find(c => stripAccents(c) === stripAccents(normalizedWilaya));
  if (!defaultCommune) {
    if (normalizedWilaya === 'Alger') defaultCommune = 'Alger Centre';
    else defaultCommune = communes[0];
  }

  if (!inputCommune || !inputCommune.trim()) {
    return defaultCommune;
  }

  const raw = inputCommune.trim();

  // Arabic match
  if (ARABIC_WILAYA_MAP[raw]) {
    const arabMatch = ARABIC_WILAYA_MAP[raw];
    const found = communes.find(c => stripAccents(c) === stripAccents(arabMatch));
    if (found) return found;
    if (arabMatch === 'Alger Centre' && normalizedWilaya === 'Alger') return 'Alger Centre';
  }

  // Exact match
  if (communes.includes(raw)) return raw;

  const strippedInput = stripAccents(raw);

  // If input matches wilaya name (e.g. 'Alger' or 'alger')
  if (strippedInput === stripAccents(normalizedWilaya)) {
    return defaultCommune;
  }

  // Accent-insensitive / Case-insensitive match
  const caseMatch = communes.find(c => stripAccents(c) === strippedInput);
  if (caseMatch) return caseMatch;

  // Substring match
  const subMatch = communes.find(c => {
    const sc = stripAccents(c);
    return sc.includes(strippedInput) || strippedInput.includes(sc);
  });
  if (subMatch) return subMatch;

  // Fallback to default chef-lieu
  return defaultCommune;
}

/**
 * Normalize an Algerian phone number to Yalidine-accepted format.
 * Yalidine accepts: 10-digit numbers starting with 0 (e.g. 0555123456)
 * or international format +213XXXXXXXXX
 * We strip all non-digit chars, then ensure it starts with 0 and is 10 digits.
 */
function normalizePhone(phone) {
  if (!phone) return '0000000000';

  // Remove all non-digit characters (spaces, dashes, dots, parens, +)
  let digits = phone.replace(/\D/g, '');

  // Handle international prefix: 213XXXXXXXXX → 0XXXXXXXXX
  if (digits.startsWith('213') && digits.length === 12) {
    digits = '0' + digits.slice(3);
  }
  // Handle +213 without the + (already stripped above): same as above
  if (digits.startsWith('213') && digits.length > 10) {
    digits = '0' + digits.slice(3);
  }

  // If still not 10 digits starting with 0, pad or truncate carefully
  if (!digits.startsWith('0')) {
    digits = '0' + digits;
  }

  // Take only the first 10 digits
  digits = digits.slice(0, 10);

  // Pad with zeros if shorter than 10
  while (digits.length < 10) {
    digits += '0';
  }

  return digits;
}

class YalidineService {
  getApiId() {
    return process.env.YALIDINE_API_ID;
  }

  getApiToken() {
    return process.env.YALIDINE_API_TOKEN;
  }

  getHeaders() {
    return {
      'X-API-ID': this.getApiId(),
      'X-API-TOKEN': this.getApiToken(),
      'Content-Type': 'application/json'
    };
  }

  async createParcel(order) {
    const apiId = this.getApiId();
    const apiToken = this.getApiToken();

    if (!apiId || !apiToken) {
      throw new Error('Yalidine API credentials are not configured on this server. Please set YALIDINE_API_ID and YALIDINE_API_TOKEN environment variables.');
    }

    // Determine stopdesk based on shipping method
    const isStopdesk = order.shippingMethod === 'bureau';

    // Extract name
    const fullName = order.customerInfo?.fullName || order.user?.username || 'Client';
    const names = fullName.trim().split(' ');
    const firstname = names[0];
    const familyname = names.slice(1).join(' ') || '.';

    // Normalize wilaya name to match Yalidine's exact list
    const normalizedWilaya = normalizeWilayaName(order.shippingAddress.wilaya);

    // Normalize phone number — Yalidine requires 10-digit Algerian format (0XXXXXXXXX)
    const normalizedPhone = normalizePhone(order.customerInfo?.phone);

    // Format product list including variation name (size, volume, etc.)
    const productList = order.items.map(item => {
      const prodName = item.product?.name || (typeof item.product === 'string' ? item.product : 'Product');
      let varName = item.variation?.description || item.variation?.name;
      if (!varName && order.notes) {
        const match = order.notes.match(/(?:الخيار|الحجم|النوع|variant|variation)\s*:\s*([^\n\r]+)/i);
        if (match && match[1]) {
          varName = match[1].trim();
        }
      }
      return `${item.quantity}x ${prodName}${varName ? ` (${varName})` : ''}`;
    }).join(', ').slice(0, 250);

    // Use product list with variation as order_id so Yalidine displays it as #commande
    const orderId = productList ? productList.slice(0, 100) : (order.orderNumber || order._id?.toString());

    // Normalize commune name to guarantee Yalidine recognizes it
    const normalizedCommune = normalizeCommuneName(
      order.shippingAddress.baladiya || order.shippingAddress.city,
      normalizedWilaya
    );

    const parcelData = {
      order_id: orderId,
      firstname: firstname,
      familyname: familyname,
      contact_phone: normalizedPhone,
      address: order.shippingAddress.street || order.shippingAddress.baladiya || normalizedCommune || '.',
      to_commune_name: normalizedCommune,
      to_wilaya_name: normalizedWilaya,
      product_list: order.orderNumber || (order._id ? `TN-${order._id.toString().slice(-6).toUpperCase()}` : 'TN-ORDER'),
      price: order.total,
      freeshipping: false,
      is_stopdesk: isStopdesk,
      has_exchange: false,
      product_to_collect: null
    };

    console.log('Sending parcel to Yalidine:', JSON.stringify(parcelData, null, 2));

    const response = await fetch(`${API_URL}/parcels/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify([parcelData])
    });

    const data = await response.json();
    console.log('Yalidine raw response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`Yalidine API error (${response.status}): ${JSON.stringify(data)}`);
    }

    // Check if the order's entry in response has an error
    if (data && data[orderId] && data[orderId].success === false) {
      throw new Error(`Yalidine rejected the parcel: ${data[orderId].message || JSON.stringify(data[orderId])}`);
    }

    // Extract tracking number from response
    // Yalidine response format: { "order_id": { success: true, tracking: "yal-XXXXX", ... } }
    let trackingNumber = null;

    if (data && typeof data === 'object') {
      // Try the order_id key first (most reliable)
      if (data[orderId] && data[orderId].tracking) {
        trackingNumber = data[orderId].tracking;
      } else {
        // Iterate all keys looking for a success entry with tracking
        for (const key of Object.keys(data)) {
          const entry = data[key];
          if (entry && entry.success && entry.tracking) {
            trackingNumber = entry.tracking;
            break;
          }
        }
      }
    }

    return { trackingNumber, rawResponse: data };
  }
}

module.exports = new YalidineService();
