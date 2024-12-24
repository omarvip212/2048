const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { HfInference } = require('@huggingface/inference');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

// Initialize AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Helper function to download image
async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
}

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

// Generate QR code
client.on('qr', (qr) => {
    console.log('Please scan this QR code to connect to WhatsApp Web:');
    qrcode.generate(qr, { small: true });
});

// Ready event
client.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
    console.log('\nInstructions:');
    console.log('1. Send messages starting with !ai');
    console.log('2. Send images with caption starting with !ai');
    console.log('Example: !ai What is in this image?');
});

// Handle incoming messages
client.on('message', async msg => {
    if (msg.body.startsWith('!ai')) {
        const query = msg.body.slice(4).trim();
        console.log(`Processing query: ${query}`);

        try {
            let response;
            
            // Check if message has media
            if (msg.hasMedia) {
                const media = await msg.downloadMedia();
                if (media.mimetype.startsWith('image/')) {
                    // Save image temporarily
                    const tempPath = path.join(__dirname, 'temp_image.jpg');
                    fs.writeFileSync(tempPath, Buffer.from(media.data, 'base64'));

                    try {
                        // Use Hugging Face for image analysis
                        const imageAnalysis = await hf.imageToText({
                            model: 'Salesforce/blip-image-captioning-large',
                            data: fs.readFileSync(tempPath)
                        });

                        // Get text response from Gemini
                        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                        const prompt = `Image description: ${imageAnalysis.generated_text}\nUser question: ${query}\nPlease provide a detailed response about the image based on this information.`;
                        
                        const result = await model.generateContent(prompt);
                        response = await result.response;

                    } catch (error) {
                        console.error('Error analyzing image:', error);
                        response = { text: () => "Sorry, there was an error analyzing the image. Please try again." };
                    }

                    // Clean up temp file
                    fs.unlinkSync(tempPath);
                } else {
                    response = { text: () => "Sorry, I can only process images at the moment." };
                }
            } else {
                // Text-only query
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                const result = await model.generateContent(query);
                response = await result.response;
            }

            const text = response.text();
            console.log(`AI Response: ${text}`);
            await msg.reply(text);
        } catch (error) {
            console.error('Error:', error);
            await msg.reply('Sorry, there was an error generating the response. Please try again.');
        }
    }
});

// Error handling
client.on('auth_failure', () => {
    console.error('Authentication failed');
});

client.on('disconnected', (reason) => {
    console.log('Client disconnected:', reason);
});

// Initialize client
console.log('Starting WhatsApp Bot...');
client.initialize();
