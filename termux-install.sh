#!/bin/bash

# سكريبت تثبيت بوت OBI-BOT2 على الترمكس
# Termux Installation Script for OBI-BOT2

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   🤖 تثبيت بوت OBI-BOT2 على الترمكس"
echo "   Installing OBI-BOT2 Bot on Termux"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# تحديث قائمة الحزم
echo "📦 تحديث قائمة الحزم..."
echo "📦 Updating package list..."
pkg update -y

# ترقية الحزم المثبتة
echo "⬆️  ترقية الحزم المثبتة..."
echo "⬆️  Upgrading installed packages..."
pkg upgrade -y

# تثبيت الحزم الأساسية
echo "🔧 تثبيت الحزم الأساسية..."
echo "🔧 Installing essential packages..."
pkg install -y git nodejs-lts python ffmpeg imagemagick wget yarn libvips

# التحقق من تثبيت Node.js
echo ""
echo "✅ التحقق من تثبيت Node.js..."
echo "✅ Verifying Node.js installation..."
node --version
npm --version

# تثبيت حزم Node.js
echo ""
echo "📚 تثبيت حزم Node.js المطلوبة..."
echo "📚 Installing required Node.js packages..."

# استخدام --no-bin-links لتجنب مشاكل الصلاحيات في Termux
# Using --no-bin-links to avoid permission issues in Termux
npm install --no-bin-links --legacy-peer-deps

# التحقق من نجاح التثبيت
if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  حدث خطأ أثناء تثبيت الحزم. جاري المحاولة مرة أخرى..."
    echo "⚠️  Error occurred during package installation. Retrying..."
    echo ""
    
    # تنظيف ذاكرة التخزين المؤقت ومحاولة مجدداً
    npm cache clean --force
    npm install --no-bin-links --legacy-peer-deps --verbose
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ فشل تثبيت الحزم!"
        echo "❌ Package installation failed!"
        echo ""
        echo "💡 جرب الحلول التالية:"
        echo "💡 Try these solutions:"
        echo "   1. rm -rf node_modules package-lock.json"
        echo "   2. npm cache clean --force"
        echo "   3. npm install --no-bin-links --legacy-peer-deps"
        echo ""
        exit 1
    fi
fi

echo ""
echo "✅ تم تثبيت الحزم بنجاح!"
echo "✅ Packages installed successfully!"

# إعادة بناء حزمة sharp لتعمل مع Termux
echo ""
echo "🖼️  إعادة بناء حزمة sharp للعمل مع Termux..."
echo "🖼️  Rebuilding sharp package for Termux compatibility..."

# التحقق من وجود sharp في node_modules
if [ -d "node_modules/sharp" ]; then
    # محاولة إعادة بناء sharp
    npm rebuild sharp --no-bin-links 2>/dev/null || {
        echo "⚠️  تحذير: قد تكون هناك مشكلة في حزمة sharp"
        echo "⚠️  Warning: There might be an issue with sharp package"
        echo "ℹ️  البوت سيعمل ولكن بعض ميزات معالجة الصور قد لا تعمل"
        echo "ℹ️  Bot will work but some image processing features may not work"
    }
else
    echo "ℹ️  حزمة sharp غير موجودة - تخطي إعادة البناء"
    echo "ℹ️  Sharp package not found - skipping rebuild"
fi

# محاولة إصلاح الثغرات الأمنية
echo ""
echo "🔒 فحص وإصلاح الثغرات الأمنية..."
echo "🔒 Checking and fixing security vulnerabilities..."

# إنشاء package-lock.json إذا لم يكن موجوداً
if [ ! -f "package-lock.json" ]; then
    npm i --package-lock-only --no-bin-links --legacy-peer-deps 2>/dev/null
fi

# محاولة إصلاح الثغرات الأمنية تلقائياً
npm audit fix --no-bin-links --legacy-peer-deps 2>/dev/null || true

echo ""
echo "ℹ️  ملاحظة: بعض التحذيرات الأمنية قد تظهر من حزم فرعية ولا يمكن إصلاحها تلقائياً"
echo "ℹ️  Note: Some security warnings from sub-packages may appear and cannot be auto-fixed"
echo "ℹ️  هذا طبيعي ولا يؤثر على عمل البوت"
echo "ℹ️  This is normal and does not affect the bot's functionality"

# إنشاء المجلدات الضرورية
echo ""
echo "📁 إنشاء المجلدات الضرورية..."
echo "📁 Creating necessary directories..."
mkdir -p Data/Sesiones/Principal
mkdir -p Data/Sesiones/Subbots
mkdir -p tmp

# منح صلاحيات التنفيذ لسكريبت التشغيل
echo ""
echo "🔐 منح صلاحيات التنفيذ..."
echo "🔐 Granting execution permissions..."
chmod +x termux-start.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   ✅ اكتمل التثبيت بنجاح!"
echo "   ✅ Installation completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "▶️  لتشغيل البوت، استخدم الأمر:"
echo "▶️  To start the bot, use the command:"
echo "   ./termux-start.sh"
echo ""
echo "أو / or:"
echo "   npm start"
echo ""
