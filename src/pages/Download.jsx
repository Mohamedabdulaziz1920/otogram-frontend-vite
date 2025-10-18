import { FaDownload, FaAndroid, FaCheckCircle, FaStar, FaShieldAlt, FaRocket, FaMobileAlt, FaArrowRight } from 'react-icons/fa'
import { useState } from 'react'
import './Download.css'

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
    <div className="download-page">
      {/* الخلفية المتحركة */}
      <div className="tiktok-background">
        <div className="neon-orb cyan-orb orb-1"></div>
        <div className="neon-orb pink-orb orb-2"></div>
        <div className="neon-orb cyan-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="download-container">
        
        {/* Header */}
        <div className="download-header">
          <a href="/" className="tiktok-back-btn">
            <FaArrowRight />
          </a>
          
          <div className="header-content">
            <div className="tiktok-icon-wrapper">
              <div className="icon-glow"></div>
              <FaAndroid className="header-icon" size={48} />
            </div>
            <h1 className="tiktok-title">حمّل تطبيق Otogram</h1>
            <p className="tiktok-subtitle">شارك لحظاتك مع العالم • فيديوهات قصيرة تفاعلية</p>
          </div>
        </div>

        <div className="download-grid">
          
          {/* Download Card */}
          <div className="download-card">
            {/* App Info */}
            <div className="app-info">
              <div className="info-row">
                <span className="info-label">
                  <div className="status-dot cyan-dot"></div>
                  النسخة
                </span>
                <span className="info-value">1.0.0</span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <div className="status-dot blue-dot"></div>
                  الحجم
                </span>
                <span className="info-value">~5 MB</span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <div className="status-dot purple-dot"></div>
                  المنصة
                </span>
                <span className="info-value">Android 5.0+</span>
              </div>
            </div>

            {/* Download Button */}
            <a
              href="/downloads/otogram-v1.0.0.apk"
              download="otogram-v1.0.0.apk"
              onClick={handleDownload}
              className={`tiktok-btn-primary ${downloading ? 'downloading' : ''}`}
            >
              <div className="btn-glow"></div>
              {downloading ? (
                <>
                  <div className="spinner"></div>
                  <span>جاري التحميل...</span>
                </>
              ) : (
                <>
                  <FaDownload size={24} />
                  <span>تحميل التطبيق الآن</span>
                  <FaArrowRight />
                </>
              )}
            </a>

            {/* QR Code */}
            <div className="qr-section">
              <div className="qr-container">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://otogram.app/downloads/otogram-v1.0.0.apk"
                  alt="QR Code"
                  className="qr-image"
                />
              </div>
              <p className="qr-text">امسح الكود للتحميل السريع</p>
            </div>
          </div>

          {/* Features & Instructions */}
          <div className="download-sidebar">
            
            {/* Features */}
            <div className="features-card">
              <h3 className="section-title">
                <FaStar className="title-icon star-icon" />
                مميزات التطبيق
              </h3>
              <div className="features-list">
                {features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-content">
                      <h4 className="feature-title">{feature.title}</h4>
                      <p className="feature-desc">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="instructions-card">
              <h3 className="instructions-title">
                <FaCheckCircle />
                خطوات التثبيت
              </h3>
              <ol className="instructions-list">
                <li className="instruction-step">
                  <span className="step-number">1</span>
                  <span className="step-text">افتح <strong>الإعدادات</strong> ← الأمان</span>
                </li>
                <li className="instruction-step">
                  <span className="step-number">2</span>
                  <span className="step-text">فعّل <strong>"مصادر غير معروفة"</strong></span>
                </li>
                <li className="instruction-step">
                  <span className="step-number">3</span>
                  <span className="step-text">افتح الملف من <strong>شريط الإشعارات</strong></span>
                </li>
                <li className="instruction-step">
                  <span className="step-number">4</span>
                  <span className="step-text">اضغط <strong>"تثبيت"</strong> وانتظر</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="download-footer">
          <a href="/" className="back-link">
            <FaArrowRight />
            <span>العودة للموقع الرئيسي</span>
          </a>
          <div className="footer-links">
            <a href="/privacy" className="footer-link">سياسة الخصوصية</a>
            <span className="footer-divider">•</span>
            <a href="/terms" className="footer-link">شروط الاستخدام</a>
            <span className="footer-divider">•</span>
            <a href="/support" className="footer-link">الدعم الفني</a>
          </div>
          <p className="copyright">© 2025 Otogram. جميع الحقوق محفوظة.</p>
          
          {/* ===== الكود المضاف ===== */}
          <p className="copyright">
            تصميم وبرمجة : <a 
              href="https://mohammed-almalgami.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer-link"
            >
              محمد الملجمي
            </a>
          </p>
          {/* ===== نهاية الكود المضاف ===== */}

        </div>

      </div>
    </div>
  )
}
