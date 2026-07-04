import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

# BotFather-dən aldığınız token
BOT_TOKEN = 'SIZIN_BOT_TOKEN_BURAYA'
bot = telebot.TeleBot(BOT_TOKEN)

# Sizin Web App-in host edildiyi URL (HTTPS olmalıdır)
WEB_APP_URL = 'https://sizin-domain.com/frontend/index.html'

@bot.message_handler(commands=['play', 'start'])
def send_game_invite(message):
    # Inline klaviatura yaradırıq
    markup = InlineKeyboardMarkup()
    
    # Web App düyməsi
    web_app_info = WebAppInfo(url=WEB_APP_URL)
    play_btn = InlineKeyboardButton(text="🎲 Dominoya Qoşul (2v2)", web_app=web_app_info)
    markup.add(play_btn)
    
    # Mesajı göndər
    bot.send_message(
        message.chat.id, 
        "Dostlarınla 4 nəfərlik Domino oynamağa hazırsan?\n\nAşağıdakı düyməyə bas və oyuna qoşul!",
        reply_markup=markup
    )

if __name__ == '__main__':
    print("Bot işə düşdü...")
    bot.infinity_polling()