// Quick test script to check registration
const axios = require('axios');

async function testRegistration() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test Admin',
            email: 'prannavp803@gmail.com',
            password: 'test123456'
        });

        console.log('✅ Registration successful:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('❌ Registration failed:');
        console.log('Status:', error.response?.status);
        console.log('Error:', error.response?.data);
        console.log('Message:', error.message);
    }
}

testRegistration();
