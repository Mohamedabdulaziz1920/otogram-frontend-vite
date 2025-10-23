import React, { forwardRef, useState, useEffect, useRef } from 'react';
import { 
  FaDownload, 
  FaPause
} from 'react-icons/fa';
import { MdPictureInPicture, MdOutlineSpeed, MdHighQuality } from 'react-icons/md';
import './AdvancedVideoPlayer.css';

const AdvancedVideoPlayer = forwardRef(({ 
  videoUrl,
  isMuted,
  videoId,
  onDownload,
  downloadProgress,
  isDownloaded,
  isPlayerActive,
  onActivatePlayer,
  // eslint-disable-next-line no-unused-vars
  onDeactivatePlayer, // ✅ قد نحتاجه لاحقاً
  // eslint-disable-next-line no-unused-vars
  showNavigationArrows // ✅ قد نحتاجه لاحقاً
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const qualityOptions = [
    { value: 'auto', label: 'تلقائي' },
    { value: '1080p', label: '1080p' },
    { value: '720p', label: '720p' },
    { value: '480p', label: '480p' },
    { value: '360p', label: '360p' }
  ];

  // تشغيل تلقائي
  useEffect(() => {
    if (ref.current) {
      ref.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [ref, videoUrl]);

  // ✅ إظهار زر Play عند تغيير الفيديو - بدون استخدام setIsPlayerActive
  useEffect(() => {
    setShowPlayButton(true);
  }, [videoUrl]);

  // إظهار/إخفاء التحكمات
  const handleShowControls = () => {
    if (!isPlayerActive) return;
    
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowQualityMenu(false);
      }
    }, 3000);
  };

  useEffect(() => {
    if (!isPlaying && isPlayerActive) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isPlaying, isPlayerActive]);

  const handleSpeedChange = (speed) => {
    if (ref.current) {
      ref.current.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSpeedMenu(false);
    }
  };

  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    setShowQualityMenu(false);
  };

  const togglePlayPause = () => {
    if (ref.current) {
      if (isPlaying) {
        ref.current.pause();
        setIsPlaying(false);
      } else {
        ref.current.play();
        setIsPlaying(true);
      }
    }
  };

  const togglePiP = async () => {
    try {
      if (!isPiPActive && ref.current) {
        if (document.pictureInPictureEnabled) {
          await ref.current.requestPictureInPicture();
          setIsPiPActive(true);
        }
      } else if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  useEffect(() => {
    const handlePiPChange = () => {
      setIsPiPActive(!!document.pictureInPictureElement);
    };

    document.addEventListener('enterpictureinpicture', handlePiPChange);
    document.addEventListener('leavepictureinpicture', handlePiPChange);

    return () => {
      document.removeEventListener('enterpictureinpicture', handlePiPChange);
      document.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updateBuffer = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const percentage = (bufferedEnd / video.duration) * 100;
        setBuffered(percentage);
      }
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('durationchange', updateDuration);
    video.addEventListener('progress', updateBuffer);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('durationchange', updateDuration);
      video.removeEventListener('progress', updateBuffer);
    };
  }, [ref]);

  const handleProgressClick = (e) => {
    if (!ref.current || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    ref.current.currentTime = pos * duration;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    const fileName = `video_${videoId}_${Date.now()}.mp4`;
    onDownload(videoUrl, videoId, fileName);
  };

  const handleVideoClick = () => {
    if (!isPlayerActive) {
      // ✅ إخفاء زر Play وتفعيل المشغل
      setShowPlayButton(false);
      onActivatePlayer();
    } else {
      togglePlayPause();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`advanced-player ${isPlayerActive ? 'player-active' : ''}`}
      onMouseMove={handleShowControls}
      onTouchStart={handleShowControls}
    >
      <video
        ref={ref}
        src={videoUrl}
        className="advanced-player__video"
        loop
        muted={isMuted}
        playsInline
        onClick={handleVideoClick}
      />

      {/* Play Button - يظهر فقط في البداية وعند التنقل */}
      {!isPlayerActive && showPlayButton && (
        <div className="advanced-player__play-overlay" onClick={handleVideoClick}>
          <div className="advanced-player__play-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPlayerActive && !isPlaying && (
        <div className="advanced-player__pause-overlay" onClick={togglePlayPause}>
          <div className="advanced-player__pause-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </div>
        </div>
      )}

      {/* شريط التحكم */}
      {isPlayerActive && (
        <div 
          className={`advanced-player__controls ${showControls || !isPlaying ? 'visible' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div 
            ref={progressBarRef}
            className="advanced-player__progress"
            onClick={handleProgressClick}
          >
            <div 
              className="advanced-player__progress-buffered"
              style={{ width: `${buffered}%` }}
            />
            <div 
              className="advanced-player__progress-current"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="advanced-player__progress-handle"></div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="advanced-player__controls-bar">
            {/* Left */}
            <div className="advanced-player__controls-left">
              <button 
                className="advanced-player__btn advanced-player__btn--play"
                onClick={togglePlayPause}
                title={isPlaying ? 'إيقاف' : 'تشغيل'}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>
              
              <div className="advanced-player__time">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right */}
            <div className="advanced-player__controls-right">
              {/* Download */}
              <button
                className={`advanced-player__btn ${isDownloaded ? 'downloaded' : ''}`}
                onClick={handleDownloadClick}
                disabled={!!downloadProgress}
                title={isDownloaded ? 'تم التحميل' : 'تحميل'}
              >
                {downloadProgress ? (
                  <div className="advanced-player__download-progress">
                    <svg className="progress-circle" width="18" height="18">
                      <circle
                        className="progress-circle__ring"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        r="7"
                        cx="9"
                        cy="9"
                        style={{
                          strokeDasharray: `${downloadProgress * 0.44} 44`,
                          transform: 'rotate(-90deg)',
                          transformOrigin: '50% 50%'
                        }}
                      />
                    </svg>
                  </div>
                ) : (
                  <FaDownload />
                )}
              </button>

              {/* Quality */}
              <div className="advanced-player__menu-wrapper">
                <button
                  className="advanced-player__btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQualityMenu(!showQualityMenu);
                    setShowSpeedMenu(false);
                  }}
                  title="الجودة"
                >
                  <MdHighQuality />
                </button>
                
                {showQualityMenu && (
                  <div className="advanced-player__menu">
                    {qualityOptions.map(q => (
                      <button
                        key={q.value}
                        className={`advanced-player__menu-item ${quality === q.value ? 'active' : ''}`}
                        onClick={() => handleQualityChange(q.value)}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Speed */}
              <div className="advanced-player__menu-wrapper">
                <button
                  className="advanced-player__btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowQualityMenu(false);
                  }}
                  title="السرعة"
                >
                  <MdOutlineSpeed />
                </button>
                
                {showSpeedMenu && (
                  <div className="advanced-player__menu">
                    {speedOptions.map(speed => (
                      <button
                        key={speed}
                        className={`advanced-player__menu-item ${playbackRate === speed ? 'active' : ''}`}
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed === 1 ? 'عادي' : `${speed}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PiP */}
              {document.pictureInPictureEnabled && (
                <button
                  className={`advanced-player__btn ${isPiPActive ? 'active' : ''}`}
                  onClick={togglePiP}
                  title="نافذة عائمة"
                >
                  <MdPictureInPicture />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Downloaded Badge */}
      {isDownloaded && !isPlayerActive && (
        <div className="advanced-player__badge-downloaded">
          <FaDownload />
          <span>محفوظ</span>
        </div>
      )}

      {/* Buffering */}
      {buffered < 100 && buffered > 0 && (
        <div className="advanced-player__buffering">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
});

AdvancedVideoPlayer.displayName = 'AdvancedVideoPlayer';

export default AdvancedVideoPlayer;
