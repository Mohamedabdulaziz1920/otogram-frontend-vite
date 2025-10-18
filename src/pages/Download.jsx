import { FaDownload, FaAndroid } from 'react-icons/fa'

export default function Download() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <FaAndroid className="text-green-500 text-6xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4">تحميل تطبيق Otogram</h1>
        <p className="text-gray-400 mb-8">
          النسخة: 1.0.0
          <br />
          الحجم: ~5 MB
        </p>
        
        <a
          href="/downloads/otogram-v1.0.0.apk"
          download
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 
                     text-white px-8 py-4 rounded-lg text-lg font-bold transition"
        >
          <FaDownload />
          تحميل التطبيق
        </a>
        
        <div className="mt-8 text-sm text-gray-500">
          <p className="mb-2">⚠️ تعليمات التثبيت:</p>
          <ol className="text-right list-decimal list-inside space-y-1">
            <li>الإعدادات → الأمان</li>
            <li>فعّل "مصادر غير معروفة"</li>
            <li>افتح الملف المحمّل</li>
            <li>اضغط "تثبيت"</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
