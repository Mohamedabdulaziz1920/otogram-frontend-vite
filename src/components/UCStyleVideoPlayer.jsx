// src/components/UCStyleVideoPlayer.jsx

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress,
  FaDownload, FaCheckCircle, FaSpinner, FaSun, FaArrowLeft, FaArrowRight
} from 'react-icons/fa';
import { MdPictureInPictureAlt } from 'react-icons/md';
import './UCStyleVideoPlayer.css';

const UCStyleVideoPlayer = forwardRef((props, ref) => {
  const {
    src,
    poster,
    onDownload,
    downloadProgress,
    isDownloaded,
    videoId,
    autoplay = true,
  } = props;


  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
const [isPlaying, setIsPlaying] = useState(autoplay); 
 
  const [isMuted, setIsMuted] = useState(false); 
  const [volume, setVolume] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, value: 0, visible: false });

  useImperativeHandle(ref, () => videoRef.current);

  const hideControls = () => setShowControls(false);
  const showAndAutoHideControls = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('mouseenter', showAndAutoHideControls);
    container.addEventListener('mousemove', showAndAutoHideControls);
    container.addEventListener('mouseleave', hideControls);
    return () => {
      container.removeEventListener('mouseenter', showAndAutoHideControls);
      container.removeEventListener('mousemove', showAndAutoHideControls);
      container.removeEventListener('mouseleave', hideControls);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const handleContainerClick = (e) => {
    // لا تفعل شيئاً إذا كان النقر على أزرار التحكم
    if (e.target.closest('.controls-overlay')) {
      return;
    }
    
    // عند أول نقرة على الحاوية، قم بتوسيع الفيديو
    if (!isExpanded) {
      setIsExpanded(true);
    }
    
    // قم بتشغيل/إيقاف الفيديو أيضاً
    togglePlay(e);
  };
  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current?.paused) {
      videoRef.current.play();
    } else {
      videoRef.current?.pause();
    }
  };

  useEffect(() => {
    setIsExpanded(false);
  }, [src]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setCurrentTime(video.currentTime);
    };
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    if (autoplay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {

          setIsPlaying(false);
        });
      }
    } else {

      setIsPlaying(false);
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [src, autoplay]); 


  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const currentVolume = useRef(volume);
  const currentBrightness = useRef(brightness);
  const gestureType = useRef(null);
  
  const showFeedback = (type, value) => {
    setFeedback({ type, value, visible: true });
    setTimeout(() => setFeedback(prev => ({ ...prev, visible: false })), 1500);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    currentVolume.current = videoRef.current.volume;
    currentBrightness.current = brightness;
    gestureType.current = null;
  };

  const handleTouchMove = (e) => {
    if (!containerRef.current) return;
    const deltaY = touchStartY.current - e.touches[0].clientY;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const containerWidth = containerRef.current.offsetWidth;
    
    if (gestureType.current === null) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        gestureType.current = e.touches[0].clientX < containerWidth / 2 ? 'brightness' : 'volume';
      } else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        gestureType.current = 'seek';
      }
    }
    
    if (gestureType.current === 'volume') {
      const newVolume = Math.max(0, Math.min(1, currentVolume.current + deltaY / 200));
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      showFeedback('volume', newVolume * 100);
    } else if (gestureType.current === 'brightness') {
      const newBrightness = Math.max(0.5, Math.min(2, currentBrightness.current + deltaY / 200));
      setBrightness(newBrightness);
      showFeedback('brightness', ((newBrightness - 0.5) / 1.5) * 100);
    } else if (gestureType.current === 'seek') {
      const seekAmount = (deltaX / containerWidth) * 30; // Seek up to 30s
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seekAmount));
      videoRef.current.currentTime = newTime;
      showFeedback('seek', newTime > videoRef.current.currentTime ? 'forward' : 'backward');
      touchStartX.current = e.touches[0].clientX;
    }
  };
  
  const handleTouchEnd = () => gestureType.current = null;
  
  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.target.clientWidth) * duration;
    videoRef.current.currentTime = seekTime;
  };
  
  const toggleMute = (e) => {
    e.stopPropagation();
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) containerRef.current.requestFullscreen();
    else document.exitFullscreen();
  };

  const handlePiP = (e) => {
    e.stopPropagation();
    if (document.pictureInPictureElement) document.exitPictureInPicture();
    else if (document.pictureInPictureEnabled) videoRef.current.requestPictureInPicture();
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    onDownload(src, videoId, `video_${videoId}.mp4`);
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
  <div
      className="uc-player-container"
      ref={containerRef}
      onClick={handleContainerClick} // استخدم الدالة الجديدة هنا
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ✅ 5. أضف كلاس ديناميكي لعنصر الفيديو */}
      <video
        ref={videoRef}
        className={`uc-video-element ${isExpanded ? 'contain' : 'cover'}`}
        src={src}
        poster={poster}
        playsInline
        loop
      />
      
      <div className="brightness-overlay" style={{ filter: `brightness(${brightness})` }}></div>

      {feedback.visible && (
        <div className="feedback-indicator">
          {feedback.type === 'volume' && <FaVolumeUp />}
          {feedback.type === 'brightness' && <FaSun />}
          {feedback.type === 'seek' && (feedback.value === 'forward' ? <FaArrowRight /> : <FaArrowLeft />)}
          {typeof feedback.value === 'number' && (
             <div className="feedback-bar-container">
               <div className="feedback-bar" style={{ width: `${feedback.value}%` }}></div>
             </div>
          )}
        </div>
      )}
      
      <div className={`center-play-pause ${showControls ? 'visible' : ''}`} onClick={togglePlay}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </div>

      <div className={`controls-overlay ${showControls ? 'visible' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="progress-bar-container" onClick={handleSeek}>
          <div className="progress-bar-filled" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="controls-bottom">
          <div className="controls-left">
            <button onClick={togglePlay}>{isPlaying ? <FaPause /> : <FaPlay />}</button>
            <button onClick={toggleMute}>{isMuted ? <FaVolumeMute /> : <FaVolumeUp />}</button>
            <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
          </div>
          <div className="controls-right">
            {isDownloaded ? (
              <button className="download-btn downloaded" title="تم التنزيل"><FaCheckCircle /></button>
            ) : downloadProgress > 0 ? (
              <button className="download-btn in-progress" title={`...${downloadProgress}%`}><FaSpinner className="spinner" /></button>
            ) : (
              <button className="download-btn" onClick={handleDownload} title="تنزيل"><FaDownload /></button>
            )}

            {document.pictureInPictureEnabled && <button onClick={handlePiP} title="صورة داخل صورة"><MdPictureInPictureAlt /></button>}
            <button onClick={toggleFullscreen} title="ملء الشاشة">{isFullscreen ? <FaCompress /> : <FaExpand />}</button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default UCStyleVideoPlayer;
