#!/bin/bash

# سكريبت التحقق من التثبيت
# Installation Verification Script

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   🔍 فحص التثبيت"
echo "   Installation Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# التحقق من Node.js
echo "📦 فحص Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js مثبت: $NODE_VERSION"
else
    echo "   ❌ Node.js غير مثبت"
    exit 1
fi

# التحقق من npm
echo "📦 فحص npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✅ npm مثبت: $NPM_VERSION"
else
    echo "   ❌ npm غير مثبت"
    exit 1
fi

# التحقق من Git
echo "📦 فحص Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "   ✅ Git مثبت: $GIT_VERSION"
else
    echo "   ⚠️  Git غير مثبت (اختياري)"
fi

# التحقق من FFmpeg
echo "📦 فحص FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n 1)
    echo "   ✅ FFmpeg مثبت"
else
    echo "   ⚠️  FFmpeg غير مثبت (مطلوب للميديا)"
fi

# التحقق من الملفات الرئيسية
echo ""
echo "📂 فحص الملفات الرئيسية..."

files=("index.js" "main.js" "config.js" "package.json" "termux-install.sh" "termux-start.sh")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file موجود"
    else
        echo "   ❌ $file مفقود"
    fi
done

# التحقق من السكريبتات القابلة للتنفيذ
echo ""
echo "🔐 فحص صلاحيات التنفيذ..."

scripts=("termux-install.sh" "termux-start.sh" "INSTALL_GUIDE.sh")

for script in "${scripts[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            echo "   ✅ $script قابل للتنفيذ"
        else
            echo "   ⚠️  $script غير قابل للتنفيذ (يمكن إصلاحه بـ: chmod +x $script)"
        fi
    fi
done

# التحقق من المجلدات الضرورية
echo ""
echo "📁 فحص المجلدات..."

dirs=("tmp" "Data/Sesiones/Principal" "Data/Sesiones/Subbots" "plugins" "lib")

for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "   ✅ $dir موجود"
    else
        echo "   ⚠️  $dir مفقود (سيتم إنشاؤه تلقائياً)"
    fi
done

# التحقق من node_modules
echo ""
echo "📚 فحص حزم Node.js..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules موجود"
    
    # عد عدد الحزم المثبتة
    package_count=$(ls -1 node_modules | wc -l)
    echo "   📦 عدد الحزم المثبتة: $package_count"
else
    echo "   ⚠️  node_modules مفقود"
    echo "   💡 قم بتشغيل: npm install"
fi

# التحقق من صحة الأكواد
echo ""
echo "🔍 فحص صحة الأكواد..."

if [ -d "node_modules" ]; then
    node --check index.js 2>/dev/null && echo "   ✅ index.js: صحيح" || echo "   ❌ index.js: يحتوي على أخطاء"
    node --check main.js 2>/dev/null && echo "   ✅ main.js: صحيح" || echo "   ❌ main.js: يحتوي على أخطاء"
    node --check config.js 2>/dev/null && echo "   ✅ config.js: صحيح" || echo "   ❌ config.js: يحتوي على أخطاء"
else
    echo "   ⚠️  تخطي فحص الأكواد (node_modules مفقود)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   ✅ اكتمل الفحص!"
echo "   Verification Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 لبدء التثبيت: bash termux-install.sh"
echo "💡 لتشغيل البوت: bash termux-start.sh"
echo ""
