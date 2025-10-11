import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUser, FaPlus, FaShieldAlt, FaMoon, FaSun, FaFire
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './NavigationBar.css';

const NavigationBar = ({ currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUploadTip, setShowUploadTip] = useState(false);
  const [rippleEffect, setRippleEffect] = useState({ x: 0, y: 0, show: false });

  const canUpload = user && (user.role === 'creator' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';

  // Get profile image URL
  const getProfileImage = () => {
    if (!user?.profileImage || user.profileImage === '/default-avatar.png') {
      return '/default-avatar.png';
    }
    if (user.profileImage.startsWith('http')) {
      return user.profileImage;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${user.profileImage}`;
  };

  // Handle profile navigation
  const handleProfileClick = () => {
    if (isAuthenticated && user?.username) {
      navigate(`/profile/${user.username}`);
    } else {
      navigate('/login');
    }
  };

  // Handle upload click with ripple effect
  const handleUploadClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRippleEffect({ x, y, show: true });
    setTimeout(() => setRippleEffect({ x: 0, y: 0, show: false }), 600);

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (canUpload) {
      navigate('/upload');
    } else {
      setShowUploadTip(true);
      setTimeout(() => setShowUploadTip(false), 3000);
    }
  };

  // Determine active page
  const isActive = (page) => {
    if (page === 'home' && location.pathname === '/') return true;
    if (page === 'profile' && location.pathname.includes('/profile')) return true;
    if (page === 'admin' && location.pathname === '/admin') return true;
    return currentPage === page;
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navigation-bar">
        {/* Gradient Background */}
        <div className="nav-gradient-bg"></div>
        
        <div className="nav-container">
          {/* Home */}
          <Link 
            to="/" 
            className={`nav-item ${isActive('home') ? 'active' : ''}`}
            aria-label="الرئيسية"
          >
            <div className="nav-icon-wrapper">
              <div className="icon-bg"></div>
              <FaHome className="nav-icon" />
              {isActive('home') && (
                <>
                  <div className="active-indicator"></div>
                  <div className="glow-effect"></div>
                </>
              )}
            </div>
            <span className="nav-label">الرئيسية</span>
          </Link>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="nav-item theme-toggle-nav"
            aria-label={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
            title={theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
          >
            <div className="nav-icon-wrapper">
              <div className="icon-bg theme-bg"></div>
              {theme === 'dark' ? (
                <FaSun className="nav-icon theme-icon sun-icon" />
              ) : (
                <FaMoon className="nav-icon theme-icon moon-icon" />
              )}
            </div>
            <span className="nav-label">
              {theme === 'dark' ? 'فاتح' : 'داكن'}
            </span>
          </button>

          {/* Upload Button - Center with Enhanced Design */}
          <button 
            className="nav-item upload-button"
            onClick={handleUploadClick}
            aria-label="رفع فيديو"
          >
            <div className="upload-icon-wrapper">
              <div className="upload-glow"></div>
              <div className="upload-icon-bg">
                <div className="upload-icon-part upload-left">
                  <div className="particle"></div>
                </div>
                <div className="upload-icon-part upload-center">
                  <FaPlus className="upload-icon" />
                  <div className="center-glow"></div>
                </div>
                <div className="upload-icon-part upload-right">
                  <div className="particle"></div>
                </div>
              </div>
              {rippleEffect.show && (
                <span 
                  className="upload-ripple"
                  style={{ left: rippleEffect.x, top: rippleEffect.y }}
                ></span>
              )}
            </div>
           
          </button>

          {/* Profile */}
          <button 
            onClick={handleProfileClick}
            className={`nav-item ${isActive('profile') ? 'active' : ''}`}
            aria-label="الملف الشخصي"
          >
            <div className="nav-icon-wrapper">
              <div className="icon-bg"></div>
              {isAuthenticated && user ? (
                <div className="profile-avatar-nav">
                  <img 
                    src={getProfileImage()} 
                    alt={user.username}
                    className="nav-profile-img"
                    onError={(e) => e.target.src = '/default-avatar.png'}
                  />
                  {isActive('profile') && (
                    <>
                      <div className="active-ring"></div>
                      <div className="profile-glow"></div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <FaUser className="nav-icon" />
                  {isActive('profile') && <div className="active-indicator"></div>}
                </>
              )}
            </div>
            <span className="nav-label">
              {isAuthenticated ? 'حسابي' : 'الدخول'}
            </span>
          </button>

          {/* Admin - Only for admins */}
          {isAdmin && (
            <Link 
              to="/admin" 
              className={`nav-item admin-item ${isActive('admin') ? 'active' : ''}`}
              aria-label="لوحة التحكم"
            >
              <div className="nav-icon-wrapper">
                <div className="icon-bg admin-bg"></div>
                <FaShieldAlt className="nav-icon admin-icon" />
                {isActive('admin') && (
                  <>
                    <div className="active-indicator admin-indicator"></div>
                    <div className="admin-glow"></div>
                  </>
                )}
              </div>
              <span className="nav-label">الإدارة</span>
            </Link>
          )}
        </div>

        {/* Floating Particles */}
        <div className="nav-particles">
          <span className="particle-dot" style={{ left: '10%', animationDelay: '0s' }}></span>
          <span className="particle-dot" style={{ left: '30%', animationDelay: '1s' }}></span>
          <span className="particle-dot" style={{ left: '50%', animationDelay: '2s' }}></span>
          <span className="particle-dot" style={{ left: '70%', animationDelay: '1.5s' }}></span>
          <span className="particle-dot" style={{ left: '90%', animationDelay: '0.5s' }}></span>
        </div>
      </nav>

      {/* Upload Tip Tooltip - Enhanced */}
      {showUploadTip && (
        <div className="upload-tip">
          <div className="tip-icon">
            <FaFire />
          </div>
          <p>ليس لديك صلاحية النشر</p>
          <span>تواصل مع الإدارة للحصول على صلاحية منشئ المحتوى</span>
          <div className="tip-arrow"></div>
        </div>
      )}
    </>
  );
};

export default NavigationBar;
