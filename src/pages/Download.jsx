import { FaDownload, FaAndroid, FaCheckCircle } from 'react-icons/fa'
import { useState } from 'react'

export default function Download() {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => setDownloading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <FaAndroid className="text-green-500 text-6xl mx-auto mb-4 animate-pulse" />
        <h1 className="text-3xl font-bold mb-4">تحميل تطبيق Otogram</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">النسخة:</span>
            <span className="font-bold">1.0.0</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">الحجم:</span>
            <span className="font-bold">~5 MB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">المنصة:</span>
            <span className="font-bold">Android 5.0+</span>
          </div>
        </div>
        
        <a
          href="/downloads/otogram-v1.0.0.apk"
          download="otogram-v1.0.0.apk"
          onClick={handleDownload}
          className={`inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 
                     text-white px-8 py-4 rounded-lg text-lg font-bold transition
                     ${downloading ? 'opacity-75 cursor-wait' : ''}`}
        >
          {downloading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              جاري التحميل...
            </>
          ) : (
            <>
              <FaDownload />
              تحميل التطبيق
            </>
          )}
        </a>

        <div className="mt-8 bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
          <p className="text-yellow-500 font-bold mb-3 flex items-center justify-center gap-2">
            <FaCheckCircle />
            تعليمات التثبيت
          </p>
          <ol className="text-right list-decimal list-inside space-y-2 text-sm text-gray-300">
            <li>افتح <span className="text-white font-bold">الإعدادات</span> → الأمان</li>
            <li>فعّل <span className="text-white font-bold">"مصادر غير معروفة"</span> أو <span className="text-white font-bold">"السماح من هذا المصدر"</span></li>
            <li>افتح الملف المحمّل من شريط الإشعارات</li>
            <li>اضغط <span className="text-white font-bold">"تثبيت"</span></li>
          </ol>
        </div>

        <div className="mt-6">
          <a 
            href="/"
            className="text-green-500 hover:text-green-400 underline"
          >
            ← العودة للموقع
          </a>
        </div>
      </div>
    </div>
  )
}
