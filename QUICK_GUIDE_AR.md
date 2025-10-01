# ⚡ دليل سريع - OBI-BOT2 على الترمكس
# Quick Guide - OBI-BOT2 on Termux

## 🚀 التثبيت السريع (Quick Install)

```bash
# 1. تحديث / Update
pkg update && pkg upgrade -y

# 2. تثبيت Git / Install Git
pkg install git -y

# 3. استنساخ المشروع / Clone
git clone https://github.com/obieda-hussien/OBI-BOT2.git
cd OBI-BOT2

# 4. التثبيت / Install
bash termux-install.sh

# 5. التشغيل / Start
bash termux-start.sh
```

## 📋 الأوامر الأساسية (Basic Commands)

### تشغيل البوت (Start Bot)
```bash
bash termux-start.sh
# أو / or
npm start
```

### إيقاف البوت (Stop Bot)
```bash
# اضغط / Press: Ctrl + C
```

### التحقق من الحالة (Check Status)
```bash
bash verify-install.sh
```

### التحديث (Update)
```bash
git pull
npm install
```

### عرض السجلات (View Logs)
```bash
tail -f output.log
```

## 🔧 حل المشاكل (Troubleshooting)

### مشكلة: البوت لا يعمل (Bot not working)
```bash
# إعادة التثبيت / Reinstall
rm -rf node_modules
npm install
npm start
```

### مشكلة: خطأ في الجلسة (Session error)
```bash
# حذف الجلسة / Delete session
rm -rf Data/Sesiones/Principal
npm start
```

### مشكلة: نفاد المساحة (Out of space)
```bash
# تنظيف / Clean
rm -rf tmp/*
npm cache clean --force
```

## 🌟 نصائح (Tips)

### منع الترمكس من الإيقاف (Prevent Termux Sleep)
1. افتح الترمكس / Open Termux
2. اسحب من الأعلى / Swipe down
3. اضغط "ACQUIRE WAKELOCK" / Tap "ACQUIRE WAKELOCK"

### التشغيل في الخلفية (Run in Background)
```bash
npm start > output.log 2>&1 &
```

### قتل العملية (Kill Process)
```bash
pkill -f node
```

## 📱 طرق الاتصال (Connection Methods)

### كود QR (QR Code)
1. اختر الخيار 1 / Choose option 1
2. امسح الكود / Scan the code
3. انتظر الاتصال / Wait for connection

### كود 8 أرقام (8-Digit Code)
1. اختر الخيار 2 / Choose option 2
2. أدخل رقمك / Enter your number
3. أدخل الكود / Enter the code

## 🔗 روابط مفيدة (Useful Links)

- 📖 الدليل الكامل / Full Guide: [README_AR.md](./README_AR.md)
- 📝 سجل التغييرات / Changelog: [CHANGELOG_AR.md](./CHANGELOG_AR.md)
- 🔍 فحص التثبيت / Verify: `bash verify-install.sh`

## 💡 أوامر الترمكس المفيدة (Useful Termux Commands)

```bash
# منح صلاحيات التخزين / Storage permission
termux-setup-storage

# عرض الموارد / Show resources
top

# مساحة القرص / Disk space
df -h

# تنظيف الترمكس / Clean Termux
pkg autoclean
pkg clean
```

---

**✨ نصيحة:** احتفظ بنسخة احتياطية من مجلد `Data/Sesiones/Principal` دائماً!

**✨ Tip:** Always keep a backup of `Data/Sesiones/Principal` folder!
