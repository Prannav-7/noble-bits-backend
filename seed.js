const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

// Load environment variables
dotenv.config();

// Product data from your frontend
const products = [
    {
        name: "Murukku",
        price: 50,
        category: "Savory",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop",
        description: "Crunchy spiral-shaped South Indian snack made from rice flour.",
        ingredients: "Rice Flour, Urad Dal Flour, Butter, Cumin Seeds, Asafoetida, Oil",
        shelfLife: "30 Days",
        weight: "250g",
        rating: 5,
        inStock: true,
        stockQuantity: 100,
        featured: true
    },
    {
        name: "Thattai",
        price: 40,
        category: "Savory",
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=1887&auto=format&fit=crop",
        description: "Crispy deep-fried snack made with rice flour and spices.",
        ingredients: "Rice Flour, Roasted Gram, Red Chilli Powder, Curry Leaves, Oil",
        shelfLife: "25 Days",
        weight: "200g",
        rating: 4,
        inStock: true,
        stockQuantity: 150
    },
    {
        name: "Seedai",
        price: 60,
        category: "Savory",
        image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=2070&auto=format&fit=crop",
        description: "Tiny crunchy balls made of rice flour and urad dal.",
        ingredients: "Rice Flour, Urad Dal, Coconut, Butter, Sesame Seeds",
        shelfLife: "45 Days",
        weight: "250g",
        rating: 5,
        inStock: true,
        stockQuantity: 80,
        featured: true
    },
    {
        name: "Oomapodi",
        price: 30,
        category: "Savory",
        image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=2070&auto=format&fit=crop",
        description: "Fine sev snack flavored with carom seeds (ajwain).",
        ingredients: "Gram Flour, Rice Flour, Carom Seeds (Omam), Butter, Oil",
        shelfLife: "20 Days",
        weight: "150g",
        rating: 4,
        inStock: true,
        stockQuantity: 120
    },
    {
        name: "Mixture",
        price: 75,
        category: "Savory",
        image: "https://images.unsplash.com/photo-1613619581787-885444738553?q=80&w=2070&auto=format&fit=crop",
        description: "Spicy mix of fried snacks, nuts, and curry leaves.",
        ingredients: "Gram Flour, Peanuts, Fried Gram, Curry Leaves, Red Chilli",
        shelfLife: "30 Days",
        weight: "400g",
        rating: 5,
        inStock: true,
        stockQuantity: 60,
        featured: true
    },
    {
        name: "Pakkoda",
        price: 60,
        category: "Savory",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop",
        description: "Crispy fritters made with gram flour and onions.",
        ingredients: "Gram Flour, Rice Flour, Onion, Green Chillies, Ginger, Oil",
        shelfLife: "15 Days",
        weight: "250g",
        rating: 4,
        inStock: true,
        stockQuantity: 90
    },
    {
        name: "Adhirasam",
        price: 50,
        category: "Sweet",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Adhirasam.jpg/1200px-Adhirasam.jpg",
        description: "Traditional sweet made from rice flour and jaggery.",
        ingredients: "Raw Rice, Jaggery, Cardamom, Dry Ginger Powder, Ghee",
        shelfLife: "10 Days",
        weight: "5 pcs",
        rating: 5,
        inStock: true,
        stockQuantity: 50
    },
    {
        name: "Jangiri",
        price: 40,
        category: "Sweet",
        image: "https://images.unsplash.com/photo-1643448450894-4152cb23a120?q=80&w=2070&auto=format&fit=crop",
        description: "Bright orange, juicy sweet made from urad dal batter.",
        ingredients: "Urad Dal, Sugar Syrup, Rose Essence, Food Color, Oil",
        shelfLife: "5 Days",
        weight: "200g",
        rating: 5,
        inStock: true,
        stockQuantity: 40,
        featured: true
    },
    {
        name: "Mysorepak",
        price: 60,
        category: "Sweet",
        image: "https://images.unsplash.com/photo-1600555379875-5ff2b8f4bf6f?q=80&w=2070&auto=format&fit=crop",
        description: "Rich sweet made of ghee, sugar, and gram flour.",
        ingredients: "Gram Flour (Besan), Sugar, Pure Ghee",
        shelfLife: "15 Days",
        weight: "250g",
        rating: 5,
        inStock: true,
        stockQuantity: 70
    },
    {
        name: "Laddu",
        price: 60,
        category: "Sweet",
        image: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=2080&auto=format&fit=crop",
        description: "Ball-shaped sweet made of flour, fat, and sugar.",
        ingredients: "Gram Flour, Sugar, Ghee, Cashews, Raisins, Cardamom",
        shelfLife: "15 Days",
        weight: "6 pcs",
        rating: 4,
        inStock: true,
        stockQuantity: 100
    }
];

// Seed function
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Insert products
        const createdProducts = await Product.insertMany(products);
        console.log(`✅ Successfully seeded ${createdProducts.length} products`);

        console.log('\n📦 Seeded Products:');
        createdProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} - ₹${product.price} (${product.category})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

// Run seed
seedDatabase();
