const mongoose = require('mongoose');
require('dotenv').config();
const HomeContent = require('./models/HomeContent');

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tn-shopping';

// Fix truncated database name if needed
if (mongoUri.includes('/tn-shopping>')) {
    mongoUri = mongoUri.replace('/tn-shopping>', '/tn-shopping');
    console.log('🔧 Fixed truncated database name in URI');
}

// Current static content from the components
const homeContentData = {
  heroSlides: [
    {
      image: '/assets/ssss.jpg',
      titles: { 
        ar: 'التميز في العناية بالشعر', 
        fr: 'Excellence Capillaire', 
        en: 'Hair Excellence' 
      },
      subtitles: { 
        ar: 'حلول العناية الاحترافية', 
        fr: 'Solutions de Soins Professionnels', 
        en: 'Professional Care Solutions' 
      },
      descriptions: { 
        ar: 'حوّل روتين العناية بشعرك بمنتجاتنا الاحترافية المتميزة المصممة لنتائج صالون في المنزل.', 
        fr: 'Transformez votre routine de soins capillaires avec nos produits professionnels premium conçus pour des résultats de salon à domicile.', 
        en: 'Transform your hair care routine with our premium professional products designed for salon-quality results at home.' 
      },
      showCertificationButton: false
    },
    {
      image: '/assets/heroparts/heropart22.webp',
      titles: { 
        ar: 'شهادة الخبراء', 
        fr: 'Certification d\'Expert', 
        en: 'Expert Certification' 
      },
      subtitles: { 
        ar: 'أتقن مهاراتك', 
        fr: 'Maîtrisez vos Compétences', 
        en: 'Master Your Skills' 
      },
      descriptions: { 
        ar: 'انضم إلى برامج التدريب الاحترافية وكن خبيرًا معتمدًا في العناية بالشعر بتقنيات رائدة في الصناعة.', 
        fr: 'Rejoignez nos programmes de formation professionnelle et devenez un expert certifié en soins capillaires avec des techniques de pointe.', 
        en: 'Join our professional training programs and become a certified hair care expert with industry-leading techniques.' 
      },
      buttonTexts: { 
        ar: 'احصل على الشهادة', 
        fr: 'Devenir Certifié', 
        en: 'Get Certified' 
      },
      buttonLink: '/certification',
      showCertificationButton: true
    },
    {
      image: '/assets/heroparts/heropart3.webp',
      titles: { 
        ar: 'منتجات مبتكرة', 
        fr: 'Produits Innovants', 
        en: 'Innovative Products' 
      },
      subtitles: { 
        ar: 'العناية بالشعر الثورية', 
        fr: 'Soins Capillaires Révolutionnaires', 
        en: 'Revolutionary Hair Care' 
      },
      descriptions: { 
        ar: 'اكتشف تركيباتنا المتطورة التي تقدم نتائج استثنائية لجميع أنواع الشعر والمخاوف.', 
        fr: 'Découvrez nos formulations de pointe qui offrent des résultats exceptionnels pour tous les types de cheveux et préoccupations.', 
        en: 'Discover our cutting-edge formulations that deliver exceptional results for all hair types and concerns.' 
      },
      buttonTexts: { 
        ar: 'اكتشف المنتجات الجديدة', 
        fr: 'Explorer les Nouveaux Produits', 
        en: 'Explore New Products' 
      },
      buttonLink: '/products',
      showExploreButton: true
    },
    {
      image: '/assets/heroparts/heropart4.jpg',
      titles: { 
        ar: 'جودة ممتازة', 
        fr: 'Qualité Premium', 
        en: 'Premium Quality' 
      },
      subtitles: { 
        ar: 'نتائج مستوى الصالون', 
        fr: 'Résultats de Niveau Salon', 
        en: 'Salon-Grade Results' 
      },
      descriptions: { 
        ar: 'اختبر الفرق مع منتجاتنا الاحترافية التي يثق بها مصففو الشعر حول العالم لنتائج جميلة ومتسقة.', 
        fr: 'Faites l\'expérience de la différence avec nos produits de qualité professionnelle approuvés par les coiffeurs du monde entier pour des résultats beaux et constants.', 
        en: 'Experience the difference with our professional-grade products trusted by stylists worldwide for consistent, beautiful results.' 
      },
      buttonTexts: { 
        ar: 'تسوق المجموعة', 
        fr: 'Boutiquer la Collection', 
        en: 'Shop Collection' 
      },
      buttonLink: '/products'
    },
    {
      image: '/assets/heroparts/heropart55.webp',
      titles: { 
        ar: 'لا سيستين غولد ثيرابي', 
        fr: 'La Cystéine Gold Thérapie', 
        en: 'La Cystéine Gold Thérapie' 
      },
      subtitles: { 
        ar: 'التحول النهائي للشعر', 
        fr: 'Transformation Capillaire Ultime', 
        en: 'Ultimate Hair Transformation' 
      },
      descriptions: { 
        ar: 'اكتشف نظام العلاج الثوري المعزز بالذهب الذي يقدم لمعانًا وقوة ونعومة لا مثالية لشعرك.', 
        fr: 'Découvrez notre système thérapeutique révolutionnaire infusé d\'or qui offre une brillance, une force et une douceur inégalées à vos cheveux.', 
        en: 'Discover our revolutionary gold-infused therapy system that delivers unparalleled shine, strength, and smoothness to your hair.' 
      },
      buttonTexts: { 
        ar: 'اكتشف لا سيستين غولد ثيرابي', 
        fr: 'Découvrir La Cystéine Gold Thérapie', 
        en: 'Discover La Cystéine Gold Thérapie' 
      },
      buttonLink: '/products/la-cysteine-gold-therapie',
      showDiscoverButton: true
    }
  ],
  
  aboutUs: {
    title: { 
      ar: 'من نحن', 
      fr: 'À propos de nous', 
      en: 'About Us' 
    },
    subtitle: { 
      ar: 'TN Shopping هو الموقع الرسمي لمنتجات العناية بالشعر من ماركة TN', 
      fr: 'TN Shopping est le site officiel des produits de soins capillaires de la marque TN', 
      en: 'TN Shopping is the official website for TN brand hair care products' 
    },
    description: { 
      ar: 'العلامة الرائدة في تقديم حلول فعّالة وآمنة لمشاكل الشعر المختلفة. نؤمن بأن جمال الشعر يبدأ من العناية الصحيحة، ولهذا نحرص على توفير منتجات أصلية، مجرّبة ومصنوعة بمكونات عالية الجودة لتناسب جميع أنواع الشعر.', 
      fr: 'La marque leader dans la fourniture de solutions efficaces et sûres pour divers problèmes capillaires. Nous croyons que la beauté des cheveux commence par des soins appropriés, c\'est pourquoi nous nous efforçons de fournir des produits authentiques, testés et fabriqués avec des ingrédients de haute qualité pour convenir à tous les types de cheveux.', 
      en: 'The leading brand in providing effective and safe solutions for various hair problems. We believe that hair beauty starts with proper care, which is why we strive to provide authentic, tested products made with high-quality ingredients to suit all hair types.' 
    },
    features: {
      title: { 
        ar: 'لماذا تختار TN؟', 
        fr: 'Pourquoi choisir TN ?', 
        en: 'Why Choose TN?' 
      },
      items: {
        ar: [
          'منتجات أصلية ومجربة',
          'مكونات عالية الجودة',
          'لجميع أنواع الشعر',
          'نتائج ملموسة',
          'توصيل سريع لجميع الولايات',
          'خدمة عملاء متوفرة 24/7'
        ],
        fr: [
          'Produits authentiques et testés',
          'Ingrédients de haute qualité',
          'Pour tous les types de cheveux',
          'Résultats visibles',
          'Livraison rapide dans tous les États',
          'Service client disponible 24/7'
        ],
        en: [
          'Authentic and tested products',
          'High-quality ingredients',
          'For all hair types',
          'Tangible results',
          'Fast delivery to all states',
          'Customer service available 24/7'
        ]
      }
    },
    images: [
      {
        src: '/assets/variante/download (76).webp',
        alt: 'TN Hair Care Products',
        title: { 
          ar: 'منتجات عناية بالشعر', 
          fr: 'Produits de soins capillaires', 
          en: 'Hair Care Products' 
        },
        description: { 
          ar: 'مجموعة متكاملة من المستحضرات التي تلبي احتياجاتك', 
          fr: 'Une gamme complète de produits qui répondent à vos besoins', 
          en: 'A complete range of products that meet your needs' 
        }
      },
      {
        src: '/assets/variante/download (77).webp',
        alt: 'Professional Hair Solutions',
        title: { 
          ar: 'حلول احترافية', 
          fr: 'Solutions Professionnelles', 
          en: 'Professional Solutions' 
        },
        description: { 
          ar: 'سواء كنتِ تبحثين عن ترطيب، تقوية، نمو، أو علاج تساقط الشعر', 
          fr: 'Que vous cherchiez l\'hydratation, le renforcement, la croissance ou le traitement de la chute des cheveux', 
          en: 'Whether you\'re looking for hydration, strengthening, growth, or hair loss treatment' 
        }
      },
      {
        src: '/assets/variante/download (78).webp',
        alt: 'Quality Assurance',
        title: { 
          ar: 'ضمان الجودة', 
          fr: 'Garantie de Qualité', 
          en: 'Quality Assurance' 
        },
        description: { 
          ar: 'نلتزم بتقديم تجربة تسوق سهلة وآمنة', 
          fr: 'Nous nous engageons à fournir une expérience d\'achat facile et sécurisée', 
          en: 'We are committed to providing an easy and secure shopping experience' 
        }
      }
    ]
  },
  
  videos: [
    {
      src: '/media/Green Black and Brown Simple Ayurveda Hair Oil Mobile Video.mp4',
      title: 'Ayurvedic Hair Oil Treatment',
      description: 'Natural ingredients for healthy, beautiful hair'
    }
  ],
  
  suggestedProducts: [
    {
      id: '1',
      name: 'La Cystéine Gold Thérapie',
      description: 'Professional keratin treatment for damaged hair restoration with advanced formula',
      price: 32000,
      image: '/assets/products/la cystéine gold thérapie/20250426_113930.jpg',
      badge: 'Best-seller',
      badgeColor: 'bg-[#A38151]',
      enabled: true
    }
  ],
  
  reels: [
    {
      src: '/assets/video/aaaaa.mp4',
      thumbnail: '/assets/video/aaaaa.mp4',
      title: 'Hair Transformation',
      customer: 'Sarah M.',
      enabled: true
    }
  ],
  
  reviews: [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Amazing products! My hair has never looked better. The quality is outstanding and the results speak for themselves.",
      image: "/assets/whatsay/FB_IMG_1754692910658.jpg",
      date: "2 weeks ago",
      enabled: true
    }
  ],
  
  brazilian: {
    title: { 
      ar: 'أصالة برازيلية مضمونة', 
      fr: 'Authenticité Brésilienne Garantie', 
      en: 'Guaranteed Brazilian Authenticity' 
    },
    subtitle: { 
      ar: 'منتجاتنا الأصلية مباشرة من البرازيل', 
      fr: 'Nos produits originaux directement du Brésil', 
      en: 'Our original products directly from Brazil' 
    },
    description: { 
      ar: 'نحن فخورون بتقديم منتجات العناية بالشعر البرازيلية الأصلية التي تم تطويرها وتصنيعها في البرازيل. كل منتج يحمل شهادة الأصالة وضمان الجودة العالية.', 
      fr: 'Nous sommes fiers de proposer des produits de soins capillaires brésiliens authentiques développés et fabriqués au Brésil. Chaque produit porte un certificat d\'authenticité et une garantie de haute qualité.', 
      en: 'We are proud to offer authentic Brazilian hair care products developed and manufactured in Brazil. Each product carries a certificate of authenticity and high quality guarantee.' 
    },
    features: {
      title: { 
        ar: 'لماذا تختار منتجاتنا البرازيلية؟', 
        fr: 'Pourquoi choisir nos produits brésiliens ?', 
        en: 'Why Choose Our Brazilian Products?' 
      },
      items: {
        ar: [
          'منتجات أصلية 100% من البرازيل',
          'شهادة أصالة مع كل منتج',
          'مكونات طبيعية من غابات الأمازون',
          'تقنية برازيلية متقدمة'
        ],
        fr: [
          'Produits 100% authentiques du Brésil',
          'Certificat d\'authenticité avec chaque produit',
          'Ingrédients naturels de la forêt amazonienne',
          'Technologie brésilienne avancée'
        ],
        en: [
          '100% authentic products from Brazil',
          'Certificate of authenticity with each product',
          'Natural ingredients from Amazon rainforest',
          'Advanced Brazilian technology'
        ]
      }
    },
    guarantee: { 
      ar: 'ضمان الأصالة البرازيلية', 
      fr: 'Garantie d\'Authenticité Brésilienne', 
      en: 'Brazilian Authenticity Guarantee' 
    }
  }
};

async function migrateHomeContent() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing home content
    console.log('🗑️  Clearing existing home content...');
    await HomeContent.deleteMany({});
    console.log('✅ Cleared existing content');

    // Insert new home content
    console.log('📝 Inserting home content...');
    const homeContent = new HomeContent(homeContentData);
    await homeContent.save();
    console.log('✅ Home content migrated successfully!');

    console.log('\n📊 Migration Summary:');
    console.log(`- Hero Slides: ${homeContentData.heroSlides.length}`);
    console.log(`- About Us Images: ${homeContentData.aboutUs.images.length}`);
    console.log(`- Videos: ${homeContentData.videos.length}`);
    console.log(`- Suggested Products: ${homeContentData.suggestedProducts.length}`);
    console.log(`- Reels: ${homeContentData.reels.length}`);
    console.log(`- Reviews: ${homeContentData.reviews.length}`);
    console.log(`- Brazilian Features: ${homeContentData.brazilian.features.items.ar.length}`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateHomeContent();
}

module.exports = migrateHomeContent;
