#!/bin/bash

# سكريبت تشغيل بوت OBI-BOT2 على الترمكس
# Termux Start Script for OBI-BOT2

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   🤖 تشغيل بوت OBI-BOT2"
echo "   Starting OBI-BOT2 Bot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# التحقق من وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت!"
    echo "❌ Node.js is not installed!"
    echo "📥 قم بتشغيل سكريبت التثبيت أولاً: ./termux-install.sh"
    echo "📥 Please run the installation script first: ./termux-install.sh"
    exit 1
fi

# التحقق من تثبيت الحزم المطلوبة
if [ ! -d "node_modules" ]; then
    echo "❌ الحزم المطلوبة غير مثبتة!"
    echo "❌ Required packages are not installed!"
    echo "📥 قم بتشغيل سكريبت التثبيت أولاً: ./termux-install.sh"
    echo "📥 Please run the installation script first: ./termux-install.sh"
    echo ""
    echo "أو قم بتثبيت الحزم يدوياً / Or install packages manually:"
    echo "   npm install --no-bin-links --legacy-peer-deps"
    echo ""
    exit 1
fi

# التحقق من وجود المجلدات الضرورية
if [ ! -d "Data/Sesiones/Principal" ]; then
    echo "📁 إنشاء المجلدات الضرورية..."
    echo "📁 Creating necessary directories..."
    mkdir -p Data/Sesiones/Principal
    mkdir -p Data/Sesiones/Subbots
    mkdir -p tmp
fi

# بدء تشغيل البوت
echo "🚀 جاري تشغيل البوت..."
echo "🚀 Starting the bot..."
echo ""

# تشغيل البوت مع إعادة التشغيل التلقائي في حالة الأخطاء
while true; do
    node index.js
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "✅ توقف البوت بشكل طبيعي"
        echo "✅ Bot stopped normally"
        break
    else
        echo "❌ توقف البوت بشكل غير متوقع (كود الخطأ: $exit_code)"
        echo "❌ Bot stopped unexpectedly (exit code: $exit_code)"
        echo "🔄 إعادة التشغيل خلال 5 ثوانٍ..."
        echo "🔄 Restarting in 5 seconds..."
        sleep 5
    fi
done
