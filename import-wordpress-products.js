const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

// WordPress products data
const wordpressProducts = [
    {
        "id": "1473",
        "type": "simple",
        "variations": [],
        "properties": {
            "name": {
                "title": [
                    {
                        "plain_text": "love white"
                    }
                ]
            },
            "Description-en": {
                "rich_text": [
                    {
                        "plain_text": "<div class=\"xdj266r x14z9mp xat24cr x1lziwak x1vvkbs x126k92a\">TN LOVE white عودة الوايت لوف الاصلي وهذه المرة من ماركتنا الخاصة TN 🥰 توضيح :: المنتج مصنوع في البرازيل وبالوثائق من الشركة المصنعة للمنتج الحمدلله الجدييييييد و بقوة💪💪😍😍😍</div>\n<div class=\"x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a\">〽〽TN white love 💥💥🔥🔥</div>\n<div class=\"x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a\">بروتين TN الاصلي🇧🇷⁩💯 بروتين وايت لوف⁦♥️⁩ مميزات البروتين TN: 👈خالي من الفرمول . 👈خالي من المواد الكيميائة الضارة. 👈لايسبب دخان أثناء التطبيق. 👈يستعمل للشعر الأفريقي و الضعيف و الحساس . 👈 يستعمل المرأة الحاملة . 👈 يستعمل الاطفال الصغار. 👈يستعمل للشعر الخشن والرقيق توصيل 58 ولاية للطلب راسلونا عبر الخاص متوفر ايضا بالعبوة 1 لتر 😍😍 للصالونات الكمية محدودة السعر 4500دج لادوز 100مل التوصيل 58 ولاية المحل<a href=\"https://www.tnshoppingg.com/wp-content/uploads/2025/04/1000103319-scaled.jpg\"><img class=\"alignnone size-full wp-image-1328\" src=\"https://www.tnshoppingg.com/wp-content/uploads/2025/04/1000103319-scaled.jpg\" alt=\"\" width=\"1440\" height=\"2560\" /></a> في العاصمة localisation</div>\n"
                    }
                ]
            },
            "Description-ar": {
                "rich_text": [
                    {
                        "plain_text": "<div class=\"xdj266r x14z9mp xat24cr x1lziwak x1vvkbs x126k92a\">TN LOVE white عودة الوايت لوف الاصلي وهذه المرة من ماركتنا الخاصة TN 🥰 توضيح :: المنتج مصنوع في البرازيل وبالوثائق من الشركة المصنعة للمنتج الحمدلله الجدييييييد و بقوة💪💪😍😍😍</div>\n<div class=\"x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a\">〽〽TN white love 💥💥🔥🔥</div>\n<div class=\"x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a\">بروتين TN الاصلي🇧🇷⁩💯 بروتين وايت لوف⁦♥️⁩ مميزات البروتين TN: 👈خالي من الفرمول . 👈خالي من المواد الكيميائة الضارة. 👈لايسبب دخان أثناء التطبيق. 👈يستعمل للشعر الأفريقي و الضعيف و الحساس . 👈 يستعمل المرأة الحاملة . 👈 يستعمل الاطفال الصغار. 👈يستعمل للشعر الخشن والرقيق توصيل 58 ولاية للطلب راسلونا عبر الخاص متوفر ايضا بالعبوة 1 لتر 😍😍 للصالونات الكمية محدودة السعر 4500دج لادوز 100مل التوصيل 58 ولاية المحل<a href=\"https://www.tnshoppingg.com/wp-content/uploads/2025/04/1000103319-scaled.jpg\"><img class=\"alignnone size-full wp-image-1328\" src=\"https://www.tnshoppingg.com/wp-content/uploads/2025/04/1000103319-scaled.jpg\" alt=\"\" width=\"1440\" height=\"2560\" /></a> في العاصمة localisation</div>\n"
                    }
                ]
            },
            "Description-fr": {
                "rich_text": [
                    {
                        "plain_text": "<div class=\"xdj266r x14z9mp xat24cr x1lziwak x1vvkbs x126k92a\">TN LOVE white عودة الوايت لوف الاصلي وهذه المرة من ماركتنا الخاصة TN 🥰 توضيح :: المنتج مصنوع في البرازيل وبالوثائق من الشركة المصنعة للمنتج الحمدلله الجدييييييد و بقوة💪💪😍😍😍</div>\n<div class=\"x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a\">〽〽TN white love 💥💥🔥🔥</div>\n<div class=\"x14z9mp xat24cr x1lziwak x1vvkbs xtlvy1s x126k92a\">بروتين TN الاصلي🇧🇷⁩💯 بروتين وايت لوف⁦♥️⁩ مميزات البروتين TN: 👈خالي من الفرمول . 👈خالي من المواد الكيميائة الضارة. 👈لايسبب دخان أثناء التطبيق. 👈يستعمل للشعر الأفريقي و الضعيف و الحساس . 👈 يستعمل المرأة الحاملة . 👈 يستعمل الاطفال الصغار. 👈يستعمل للشعر الخشن والرقيق توصيل 58 ولاية للطلب راسلونا عبر الخاص متوفر ايضا بالعبوة 1 لتر 😍😍 للصالونات الكمية محدودة السعر 4500دج لادوز 100مل التوصيل 58 ولاية المحل<a href=\"https://www.tnshoppingg.com/wp-content/uploads/2025/04/1000103319-scaled.jpg\"><img class=\"alignnone size-full wp-image-1328\" src=\"https://www.tnshoppingg.com/wp-content/uploads/2025/04/1000103319-scaled.jpg\" alt=\"\" width=\"1440\" height=\"2560\" /></a> في العاصمة localisation</div>\n"
                    }
                ]
            },
            "Short Description-en": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Short Description-ar": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Short Description-fr": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Usage-en": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Usage-ar": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Usage-fr": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "price": {
                "number": 32000
            },
            "old price": {
                "number": 35000
            },
            "image1": {
                "url": "https://wp.tnshoppingg.com/wp-content/uploads/2025/08/unnamed.jpg"
            },
            "image2": {
                "url": "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/1000103319-scaled.jpg"
            },
            "images": [
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/08/unnamed.jpg",
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/1000103319-scaled.jpg"
            ],
            "rating": {
                "number": 0
            },
            "ID": {
                "unique_id": {
                    "number": 1473
                }
            }
        }
    },
    {
        "id": "1424",
        "type": "variable",
        "variations": [
            {
                "id": 1433,
                "price": 8000,
                "regular_price": 9000,
                "sale_price": 8000,
                "attributes": [
                    {
                        "id": 0,
                        "name": "العروض",
                        "slug": "%d8%a7%d9%84%d8%b9%d8%b1%d9%88%d8%b6",
                        "option": "160 مل +شامبو"
                    }
                ],
                "description": "",
                "sku": ""
            },
            {
                "id": 1431,
                "price": 5000,
                "regular_price": 6000,
                "sale_price": 5000,
                "attributes": [
                    {
                        "id": 0,
                        "name": "العروض",
                        "slug": "%d8%a7%d9%84%d8%b9%d8%b1%d9%88%d8%b6",
                        "option": "100مل +شامبو"
                    }
                ],
                "description": "",
                "sku": ""
            },
            {
                "id": 1430,
                "price": 35000,
                "regular_price": 38000,
                "sale_price": 35000,
                "attributes": [
                    {
                        "id": 0,
                        "name": "العروض",
                        "slug": "%d8%a7%d9%84%d8%b9%d8%b1%d9%88%d8%b6",
                        "option": "1 لتر +1 لتر شامبو مهداة"
                    }
                ],
                "description": "",
                "sku": ""
            }
        ],
        "properties": {
            "name": {
                "title": [
                    {
                        "plain_text": "luxury therapie"
                    }
                ]
            },
            "Description-en": {
                "rich_text": [
                    {
                        "plain_text": "<p><a href=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344338/Group_222_eyd83x.png\"><br />\n  <img src=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344338/Group_222_eyd83x.png\" /><br />\n</a></p>\n"
                    }
                ]
            },
            "Description-ar": {
                "rich_text": [
                    {
                        "plain_text": "<p><a href=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344338/Group_222_eyd83x.png\"><br />\n  <img src=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344338/Group_222_eyd83x.png\" /><br />\n</a></p>\n"
                    }
                ]
            },
            "Description-fr": {
                "rich_text": [
                    {
                        "plain_text": "<p><a href=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344338/Group_222_eyd83x.png\"><br />\n  <img src=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344338/Group_222_eyd83x.png\" /><br />\n</a></p>\n"
                    }
                ]
            },
            "Short Description-en": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Short Description-ar": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Short Description-fr": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Usage-en": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Usage-ar": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Usage-fr": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "price": {
                "number": 5000
            },
            "old price": {
                "number": 38000
            },
            "image1": {
                "url": "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/1000082172.jpg"
            },
            "image2": {
                "url": "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/1000062512.png"
            },
            "images": [
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/1000082172.jpg",
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/1000062512.png",
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/1000056315-scaled.jpg",
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/WhatsApp-Image-2025-04-24-at-23.01.49.jpeg"
            ],
            "rating": {
                "number": 0
            },
            "ID": {
                "unique_id": {
                    "number": 1424
                }
            }
        }
    },
    {
        "id": "1202",
        "type": "variable",
        "variations": [
            {
                "id": 1374,
                "price": 8000,
                "regular_price": 9000,
                "sale_price": 8000,
                "attributes": [
                    {
                        "id": 0,
                        "name": "العروض",
                        "slug": "%d8%a7%d9%84%d8%b9%d8%b1%d9%88%d8%b6",
                        "option": "160 مل لتر +شامبو"
                    }
                ],
                "description": "",
                "sku": ""
            },
            {
                "id": 1372,
                "price": 5000,
                "regular_price": 6000,
                "sale_price": 5000,
                "attributes": [
                    {
                        "id": 0,
                        "name": "العروض",
                        "slug": "%d8%a7%d9%84%d8%b9%d8%b1%d9%88%d8%b6",
                        "option": "100 مل لتر + شامبو"
                    }
                ],
                "description": "",
                "sku": ""
            },
            {
                "id": 1371,
                "price": 35000,
                "regular_price": 38000,
                "sale_price": 35000,
                "attributes": [
                    {
                        "id": 0,
                        "name": "العروض",
                        "slug": "%d8%a7%d9%84%d8%b9%d8%b1%d9%88%d8%b6",
                        "option": "1 لتر +عبوة شامبو مهداة"
                    }
                ],
                "description": "",
                "sku": ""
            }
        ],
        "properties": {
            "name": {
                "title": [
                    {
                        "plain_text": "la cystéine gold thérapie"
                    }
                ]
            },
            "Description-en": {
                "rich_text": [
                    {
                        "plain_text": "<p><a href=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344378/product1_kzg8it.jpg\"><br />\n<img class=\"aligncenter wp-image-1417 size-full\" src=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344378/product1_kzg8it.jpg\" alt=\"\" width=\"680\" height=\"8000\" /><br />\n</a></p>\n"
                    }
                ]
            },
            "Description-ar": {
                "rich_text": [
                    {
                        "plain_text": "<p><a href=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344378/product1_kzg8it.jpg\"><br />\n<img class=\"aligncenter wp-image-1417 size-full\" src=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344378/product1_kzg8it.jpg\" alt=\"\" width=\"680\" height=\"8000\" /><br />\n</a></p>\n"
                    }
                ]
            },
            "Description-fr": {
                "rich_text": [
                    {
                        "plain_text": "<p><a href=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344378/product1_kzg8it.jpg\"><br />\n<img class=\"aligncenter wp-image-1417 size-full\" src=\"https://res.cloudinary.com/dicpjm1dz/image/upload/v1769344378/product1_kzg8it.jpg\" alt=\"\" width=\"680\" height=\"8000\" /><br />\n</a></p>\n"
                    }
                ]
            },
            "Short Description-en": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Short Description-ar": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Short Description-fr": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Usage-en": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Usage-ar": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "Usage-fr": {
                "rich_text": [
                    {
                        "plain_text": ""
                    }
                ]
            },
            "price": {
                "number": 5000
            },
            "old price": {
                "number": 38000
            },
            "image1": {
                "url": "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/1000082167.jpg"
            },
            "image2": {
                "url": "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/20250420_2015451-scaled.jpg"
            },
            "images": [
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/1000082167.jpg",
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/20250420_2015451-scaled.jpg",
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/20250420_2009311-scaled.jpg",
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/IMG_20241105_222833_9011.jpg",
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/Photo_1726918875598.jpg",
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/Photo_1726918875728.jpg",
                "https://wp.tnshoppingg.com/wp-content/uploads/2025/04/IMG_20240706_200559_017.jpg"
            ],
            "rating": {
                "number": 0
            },
            "ID": {
                "unique_id": {
                    "number": 1202
                }
            }
        }
    }
];

// Helper function to extract text from WordPress rich text
const extractText = (richTextArray) => {
    if (richTextArray && richTextArray.length > 0 && richTextArray[0].plain_text) {
        return richTextArray[0].plain_text;
    }
    return '';
};

// Helper function to extract title from WordPress title
const extractTitle = (titleArray) => {
    if (titleArray && titleArray.length > 0 && titleArray[0].plain_text) {
        return titleArray[0].plain_text;
    }
    return '';
};

// Helper function to find matching product folder
const findProductFolder = (productName) => {
    const productsPath = path.join(__dirname, '../public/assets/products');
    
    try {
        const folders = fs.readdirSync(productsPath);
        
        // Try exact match first
        const exactMatch = folders.find(folder => 
            folder.toLowerCase() === productName.toLowerCase()
        );
        if (exactMatch) return exactMatch;
        
        // Try partial match
        const partialMatch = folders.find(folder => 
            folder.toLowerCase().includes(productName.toLowerCase()) ||
            productName.toLowerCase().includes(folder.toLowerCase())
        );
        if (partialMatch) return partialMatch;
        
        // Try removing spaces and special characters
        const cleanProductName = productName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanMatch = folders.find(folder => {
            const cleanFolder = folder.toLowerCase().replace(/[^a-z0-9]/g, '');
            return cleanFolder === cleanProductName || cleanFolder.includes(cleanProductName);
        });
        if (cleanMatch) return cleanMatch;
        
    } catch (error) {
        console.log(`Could not read products directory: ${error.message}`);
    }
    
    return null;
};

// Helper function to get images from product folder
const getImagesFromFolder = (folderName) => {
    const folderPath = path.join(__dirname, '../public/assets/products', folderName);
    const images = [];
    
    try {
        if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath);
            const imageFiles = files.filter(file => 
                /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
            );
            
            imageFiles.forEach(file => {
                images.push({
                    url: `/assets/products/${folderName}/${file}`,
                    alt: folderName,
                    caption: file
                });
            });
        }
    } catch (error) {
        console.log(`Could not read images from folder ${folderName}: ${error.message}`);
    }
    
    return images;
};

// Convert WordPress product to backend format
const convertWordPressProduct = (wpProduct) => {
    const productName = extractTitle(wpProduct.properties?.name?.title || []);
    const folderName = findProductFolder(productName);
    const localImages = folderName ? getImagesFromFolder(folderName) : [];
    
    // Use local images if found, otherwise use WordPress images
    const images = localImages.length > 0 ? localImages : (wpProduct.properties?.images || []).map(url => ({
        url: url,
        alt: productName,
        caption: ''
    }));
    
    return {
        name: productName,
        description_ar: extractText(wpProduct.properties?.['Description-ar']?.rich_text || []),
        description_fr: extractText(wpProduct.properties?.['Description-fr']?.rich_text || []),
        description_en: extractText(wpProduct.properties?.['Description-en']?.rich_text || []),
        shortDescription_ar: extractText(wpProduct.properties?.['Short Description-ar']?.rich_text || []),
        shortDescription_fr: extractText(wpProduct.properties?.['Short Description-fr']?.rich_text || []),
        shortDescription_en: extractText(wpProduct.properties?.['Short Description-en']?.rich_text || []),
        usage_ar: extractText(wpProduct.properties?.['Usage-ar']?.rich_text || []),
        usage_fr: extractText(wpProduct.properties?.['Usage-fr']?.rich_text || []),
        usage_en: extractText(wpProduct.properties?.['Usage-en']?.rich_text || []),
        price: wpProduct.properties?.price?.number || 0,
        old_price: wpProduct.properties?.['old price']?.number || 0,
        rating: wpProduct.properties?.rating?.number || 0,
        type: wpProduct.type || 'simple',
        variations: wpProduct.variations || [],
        images: images,
        isActive: true, // Explicitly set to true
        featured: false,
        stock: 100, // Default stock
        sku: `TN-${wpProduct.id}`, // Generate SKU from WordPress ID
        category: 'hair-care', // Default category
        brand: 'TN Shopping',
        tags: [],
        tax_rate: 19,
        meta_keywords: []
    };
};

// Main import function
const importProducts = async () => {
    try {
        // Connect to MongoDB
        let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tn-shopping';
        
        // Fix truncated database name if needed
        if (mongoUri.includes('/Tn>')) {
            mongoUri = mongoUri.replace('/Tn>', '/tn-shopping');
            console.log('🔧 Fixed truncated database name in URI');
        }
        
        console.log('🔗 Import script connecting to MongoDB with URI:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
        
        // Clear existing products (optional)
        // await Product.deleteMany({});
        // console.log('Cleared existing products');
        
        let importedCount = 0;
        let skippedCount = 0;
        
        for (const wpProduct of wordpressProducts) {
            try {
                // Check if product already exists
                const existingProduct = await Product.findOne({ sku: `TN-${wpProduct.id}` });
                
                if (existingProduct) {
                    console.log(`Product with SKU TN-${wpProduct.id} already exists, skipping...`);
                    skippedCount++;
                    continue;
                }
                
                // Convert WordPress product to backend format
                const backendProduct = convertWordPressProduct(wpProduct);
                
                // Create new product
                const newProduct = new Product(backendProduct);
                await newProduct.save();
                
                console.log(`✅ Imported: ${backendProduct.name} (SKU: ${backendProduct.sku})`);
                importedCount++;
                
            } catch (error) {
                console.error(`❌ Error importing product ${wpProduct.id}:`, error.message);
            }
        }
        
        console.log(`\n📊 Import Summary:`);
        console.log(`✅ Successfully imported: ${importedCount} products`);
        console.log(`⏭️  Skipped: ${skippedCount} products`);
        console.log(`📦 Total processed: ${wordpressProducts.length} products`);
        
    } catch (error) {
        console.error('❌ Import failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the import
importProducts();
