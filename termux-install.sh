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
pkg install -y git nodejs-lts python ffmpeg imagemagick wget yarn

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
npm install

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
