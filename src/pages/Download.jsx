import { FaDownload, FaAndroid, FaCheckCircle, FaStar, FaShieldAlt, FaRocket, FaMobileAlt, FaArrowRight } from 'react-icons/fa'
import { useState } from 'react'

export default function Download() {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => setDownloading(false), 2000)
  }

  const features = [
    { icon: <FaRocket />, title: 'سريع وخفيف', desc: 'حجم صغير وأداء عالي' },
    { icon: <FaShieldAlt />, title: 'آمن 100%', desc: 'موقع رقمياً ومشفر' },
    { icon: <FaMobileAlt />, title: 'تجربة سلسة', desc: 'واجهة سهلة وبسيطة' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-48 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-48 w-96 h-96 bg-green-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-block relative mb-6">
              <div className="absolute inset-0 bg-green-500/20 blur-2xl animate-pulse"></div>
              <FaAndroid className="relative text-green-500 text-7xl mx-auto drop-shadow-2xl animate-bounce" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-green-100 to-green-500 bg-clip-text text-transparent">
              حمّل تطبيق Otogram
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              شارك لحظاتك مع العالم • فيديوهات قصيرة تفاعلية
            </p>
          </div>

          {/* Main Card */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* Download Section */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
              
              {/* App Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-gray-700/30">
                  <span className="text-gray-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    النسخة
                  </span>
                  <span className="font-bold text-lg">1.0.0</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-gray-700/30">
                  <span className="text-gray-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    الحجم
                  </span>
                  <span className="font-bold text-lg">~5 MB</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-gray-700/30">
                  <span className="text-gray-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    المنصة
                  </span>
                  <span className="font-bold text-lg">Android 5.0+</span>
                </div>
              </div>

              {/* Download Button */}
              <a
                href="/downloads/otogram-v1.0.0.apk"
                download="otogram-v1.0.0.apk"
                onClick={handleDownload}
                className={`
                  group relative w-full flex items-center justify-center gap-3 
                  bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400
                  text-white px-8 py-5 rounded-2xl text-lg font-bold 
                  transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50
                  ${downloading ? 'opacity-75 cursor-wait scale-95' : 'active:scale-95'}
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-300 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                
                {downloading ? (
                  <>
                    <div className="relative animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                    <span className="relative">جاري التحميل...</span>
                  </>
                ) : (
                  <>
                    <FaDownload className="relative text-2xl" />
                    <span className="relative">تحميل التطبيق الآن</span>
                    <FaArrowRight className="relative group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </a>

              {/* QR Code */}
              <div className="mt-6 p-4 bg-white rounded-2xl shadow-xl">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://otogram.app/downloads/otogram-v1.0.0.apk&bgcolor=ffffff&color=000000`}
                  alt="QR Code"
                  className="mx-auto w-32 h-32"
                />
                <p className="text-gray-800 text-xs mt-2 text-center font-bold">
                  امسح الكود للتحميل السريع
                </p>
              </div>
            </div>

            {/* Features & Instructions */}
            <div className="space-y-6">
              
              {/* Features */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  مميزات التطبيق
                </h3>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl bg-black/20 hover:bg-black/30 transition-colors border border-gray-700/20 hover:border-green-500/30 group"
                    >
                      <div className="text-2xl text-green-500 mt-1 group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{feature.title}</h4>
                        <p className="text-sm text-gray-400">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installation Instructions */}
              <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 backdrop-blur-xl rounded-3xl p-6 border border-yellow-600/30">
                <h3 className="text-yellow-500 font-bold text-lg mb-4 flex items-center justify-center gap-2">
                  <FaCheckCircle />
                  خطوات التثبيت
                </h3>
                <ol className="space-y-3 text-right">
                  {[
                    { num: '1', text: 'افتح', bold: 'الإعدادات', extra: '← الأمان' },
                    { num: '2', text: 'فعّل', bold: '"مصادر غير معروفة"' },
                    { num: '3', text: 'افتح الملف المحمّل من', bold: 'شريط الإشعارات' },
                    { num: '4', text: 'اضغط', bold: '"تثبيت"', extra: 'وانتظر' },
                  ].map((step) => (
                    <li 
                      key={step.num}
                      className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-yellow-600/20 hover:border-yellow-500/40 transition-colors"
                    >
                      <span className="flex-shrink-0 w-7 h-7 bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center text-sm">
                        {step.num}
                      </span>
                      <span className="text-gray-300 text-sm">
                        {step.text} <span className="text-white font-bold">{step.bold}</span> {step.extra}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            <a 
              href="/"
              className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 font-bold text-lg transition-colors group"
            >
              <FaArrowRight className="group-hover:-translate-x-1 transition-transform" />
              العودة للموقع الرئيسي
            </a>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-green-500 transition-colors">سياسة الخصوصية</a>
              <span>•</span>
              <a href="/terms" className="hover:text-green-500 transition-colors">شروط الاستخدام</a>
              <span>•</span>
              <a href="/support" className="hover:text-green-500 transition-colors">الدعم الفني</a>
            </div>

            <p className="text-gray-600 text-xs">
              © 2025 Otogram. جميع الحقوق محفوظة.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
