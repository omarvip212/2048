import os
import time
from groq import Groq
from dotenv import load_dotenv
from whatsapp_bot import WhatsAppBot

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(
    api_key=os.getenv('GROQ_API_KEY', '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')
)

class AIWhatsAppBot:
    def __init__(self):
        self.phone_number = os.getenv('WHATSAPP_PHONE')
        if not self.phone_number:
            raise ValueError("Please set WHATSAPP_PHONE in your .env file")
        
        # Initialize WhatsApp bot
        self.bot = WhatsAppBot()
        
    def generate_ai_response(self, query):
        """Generate AI response using Groq"""
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "أنت مساعد ذكي يجيب باللغة العربية. قدم إجابات مفيدة ودقيقة ومختصرة."
                    },
                    {
                        "role": "user",
                        "content": query
                    }
                ],
                model="llama3-70b-8192",
                temperature=0.7,
                max_tokens=500,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Error generating AI response: {e}")
            return "عذراً، حدث خطأ في توليد الرد. الرجاء المحاولة مرة أخرى."

    def process_message(self, message):
        """Process incoming message"""
        if message.startswith('!ai'):
            query = message[4:].strip()
            print(f"Processing query: {query}")
            response = self.generate_ai_response(query)
            print(f"AI Response: {response}")
            return self.bot.send_message(self.phone_number, response)
        return False

    def start(self):
        """Start the bot"""
        print("WhatsApp Bot Starting...")
        
        try:
            # Send welcome message
            welcome_message = "مرحباً! أنا بوت الذكاء الاصطناعي. أرسل '!ai' متبوعاً برسالتك للتفاعل معي."
            self.bot.send_message(self.phone_number, welcome_message)
            
            print("\nInstructions:")
            print("1. Scan the QR code when it appears")
            print("2. Send messages starting with '!ai'")
            print("Example: !ai ما هو أفضل لغة برمجة للمبتدئين؟")
            
            # Start listening for messages
            print("\nBot is running. Press Ctrl+C to stop.")
            self.bot.start()
            
        except KeyboardInterrupt:
            print("\nBot stopped by user.")
        except Exception as e:
            print(f"Error: {e}")

def main():
    bot = AIWhatsAppBot()
    bot.start()

if __name__ == "__main__":
    main()
