# WhatsApp AI Bot

This is a WhatsApp bot that uses Google's Gemini 2.0 Flash to respond to messages and analyze images.

## Setup Instructions

1. Install Python 3.8 or higher if you haven't already
2. Install the required packages:
   ```
   pip install -r requirements.txt
   ```
3. The bot uses Gemini AI which is free to use with the provided API key
4. Run the bot:
   ```
   python whatsapp_bot.py
   ```
5. Scan the QR code with WhatsApp on your phone
6. Start chatting!

## Usage

1. Activation:
   First, send "test0.1" to activate AI features for your account.
   You only need to do this once.

2. Text Analysis:
   Send a message starting with "!ai" followed by your question/prompt.
   Example: "!ai What is the capital of France?"

3. Image Analysis:
   Send an image with a caption starting with "!ai" followed by your question about the image.
   Example: "!ai What's in this image?" or "!ai What breed is this dog?"
   If you send an image without a specific question, the bot will provide a detailed description.

## Features

- QR code authentication
- User activation system for security
- AI-powered responses using Gemini 2.0 Flash (Experimental)
- Support for both text and image analysis
- Simple command interface (!ai)
- Advanced AI capabilities including:
  - Improved response speed
  - Better performance on complex tasks
  - Enhanced understanding of context
  - Support for multiple languages
  - Advanced image understanding and analysis
