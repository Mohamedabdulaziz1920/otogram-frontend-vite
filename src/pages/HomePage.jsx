import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FaHeart, FaComment, FaChevronLeft, FaChevronRight,
  FaTrash
} from 'react-icons/fa';
import NavigationBar from '../components/NavigationBar';
import { useNavigate, useLocation } from 'react-router-dom'; // ✅ نحتاج useLocation
import { useAuth, api } from '../context/AuthContext';
import Toast from '../components/Toast';

import AdvancedVideoPlayer from '../components/AdvancedVideoPlayer';
import './HomePage.css';

const HomePage = () => {
  const location = useLocation(); // ✅ مهم للانتقال من البروفايل
  const [videos, setVideos] = useState([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [activeReplyIndex, setActiveReplyIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [likedReplies, setLikedReplies] = useState(new Set());
  const [isMuted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
    // ✅ إضافة state للـ Toast
  const [toast, setToast] = useState(null);
  // ✅ دالة لإظهار Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // يختفي بعد 3 ثواني
  };
  const [isMainPlayerActive, setIsMainPlayerActive] = useState(false);
  const [isReplyPlayerActive, setIsReplyPlayerActive] = useState(false);

  const [showDeleteReplyModal, setShowDeleteReplyModal] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState(null);

  const [downloadProgress, setDownloadProgress] = useState({});
  const [downloadedVideos, setDownloadedVideos] = useState(new Set());

  const navigate = useNavigate();
  const { user } = useAuth();

  const mainVideoRef = useRef(null);
  const replyVideoRef = useRef(null);
  const lastScrollTime = useRef(0);

  const getAssetUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${url}`;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/videos');

      if (response.data && Array.isArray(response.data)) {
        const shuffledVideos = shuffleArray(response.data);
        setVideos(shuffledVideos);

        if (user) {
          const userLikedVideos = new Set();
          const userLikedReplies = new Set();
          
          shuffledVideos.forEach(video => {
            if (video.likes?.includes(user._id || user.id)) {
              userLikedVideos.add(video._id);
            }
            video.replies?.forEach(reply => {
              if (reply.likes?.includes(user._id || user.id)) {
                userLikedReplies.add(reply._id);
              }
            });
          });
          
          setLikedVideos(userLikedVideos);
          setLikedReplies(userLikedReplies);
        }
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error.message || 'فشل في تحميل الفيديوهات');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // ✅ الانتقال التلقائي للفيديو من البروفايل - مهم جداً!
  useEffect(() => {
    if (location.state?.scrollToVideoId && videos.length > 0) {
      const videoIndex = videos.findIndex(
        v => v._id === location.state.scrollToVideoId
      );
      
      if (videoIndex !== -1) {
        console.log('✅ تم العثور على الفيديو في الموضع:', videoIndex);
        setActiveVideoIndex(videoIndex);
        setActiveReplyIndex(0);
        
        // مسح الـ state بعد الاستخدام
        window.history.replaceState({}, document.title);
      } else {
        console.log('⚠️ الفيديو غير موجود في القائمة الحالية');
      }
    }
  }, [location.state, videos]);

  // باقي الكود كما هو...
  useEffect(() => {
    const loadDownloadedVideos = () => {
      try {
        const downloaded = localStorage.getItem('downloadedVideos');
        if (downloaded) {
          setDownloadedVideos(new Set(JSON.parse(downloaded)));
        }
      } catch (error) {
        console.error('Error loading downloaded videos:', error);
      }
    };
    loadDownloadedVideos();
  }, []);

  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (!userInteracted) {
        setUserInteracted(true);
      }
    };

    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [userInteracted]);

  useEffect(() => {
    setIsMainPlayerActive(false);
    setIsReplyPlayerActive(false);
  }, [activeVideoIndex]);

  useEffect(() => {
    setIsReplyPlayerActive(false);
  }, [activeReplyIndex]);

// ✅ تحديث دالة التحميل
  const downloadVideo = async (videoUrl, videoId, fileName) => {
    try {
      console.log('📥 Starting download for video:', videoId);
      
      setDownloadProgress(prev => ({ ...prev, [videoId]: 0 }));

      const response = await fetch(getAssetUrl(videoUrl));

      if (!response.ok) {
        throw new Error('فشل تنزيل الفيديو');
      }

      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (total) {
          const progress = Math.round((loaded / total) * 100);
          setDownloadProgress(prev => ({ ...prev, [videoId]: progress }));
        }
      }

      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      await saveVideoToIndexedDB(videoId, blob, fileName);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `otogram_${videoId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const newDownloaded = new Set(downloadedVideos);
      newDownloaded.add(videoId);
      setDownloadedVideos(newDownloaded);
      localStorage.setItem('downloadedVideos', JSON.stringify([...newDownloaded]));

      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[videoId];
        return newProgress;
      });

      // ✅ استبدال alert بـ Toast
      showToast('تم تنزيل الفيديو بنجاح !', 'success');

    } catch (error) {
      console.error('❌ Download error:', error);
      
      // ✅ استبدال alert بـ Toast
      showToast('فشل تنزيل الفيديو', 'error');
      
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[videoId];
        return newProgress;
      });
    }
  };


  const saveVideoToIndexedDB = (videoId, blob, fileName) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VideosDB', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');
        
        store.put({
          id: videoId,
          blob: blob,
          fileName: fileName,
          downloadedAt: new Date().toISOString()
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  };

  const goToNextReply = useCallback(() => {
    setActiveReplyIndex(prev => {
      const currentVideo = videos[activeVideoIndex];
      if (currentVideo?.replies && prev < currentVideo.replies.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [videos, activeVideoIndex]);

  const goToPrevReply = useCallback(() => {
    setActiveReplyIndex(prev => prev > 0 ? prev - 1 : prev);
  }, []);

  useEffect(() => {
    const SCROLL_THRESHOLD = 50;
    const SCROLL_COOLDOWN = 800;

    const handleWheel = (e) => {
      const now = Date.now();
      
      if (now - lastScrollTime.current < SCROLL_COOLDOWN) return;
      
      const delta = e.deltaY;
      
      if (Math.abs(delta) < SCROLL_THRESHOLD) return;

      if (isMainPlayerActive || isReplyPlayerActive) {
        if (isMainPlayerActive) setIsMainPlayerActive(false);
        if (isReplyPlayerActive) setIsReplyPlayerActive(false);
      }
      
      if (delta > 0 && activeVideoIndex < videos.length - 1) {
        setActiveVideoIndex(prev => prev + 1);
        setActiveReplyIndex(0);
        lastScrollTime.current = now;
      } else if (delta < 0 && activeVideoIndex > 0) {
        setActiveVideoIndex(prev => prev - 1);
        setActiveReplyIndex(0);
        lastScrollTime.current = now;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [activeVideoIndex, videos.length, isMainPlayerActive, isReplyPlayerActive]);

  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;
    const SWIPE_THRESHOLD = 50;
    const SWIPE_VELOCITY = 0.3;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndTime = Date.now();
      const deltaY = touchStartY - touchEndY;
      const deltaX = touchStartX - touchEndX;
      const deltaTime = touchEndTime - touchStartTime;
      const velocityY = Math.abs(deltaY) / deltaTime;
      const velocityX = Math.abs(deltaX) / deltaTime;

      const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX);
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

      if (isVerticalSwipe && (Math.abs(deltaY) > SWIPE_THRESHOLD || velocityY > SWIPE_VELOCITY)) {
        if (isMainPlayerActive) setIsMainPlayerActive(false);
        if (isReplyPlayerActive) setIsReplyPlayerActive(false);
        
        if (deltaY > 0 && activeVideoIndex < videos.length - 1) {
          setActiveVideoIndex(prev => prev + 1);
          setActiveReplyIndex(0);
        } else if (deltaY < 0 && activeVideoIndex > 0) {
          setActiveVideoIndex(prev => prev - 1);
          setActiveReplyIndex(0);
        }
      } else if (isHorizontalSwipe && !isMainPlayerActive && !isReplyPlayerActive) {
        if (Math.abs(deltaX) > SWIPE_THRESHOLD || velocityX > SWIPE_VELOCITY) {
          if (deltaX > 0) {
            goToNextReply();
          } else {
            goToPrevReply();
          }
        }
      }
    };

    const mainSection = document.querySelector('.main-video-section');
    const replySection = document.querySelector('.replies-section');

    if (mainSection) {
      mainSection.addEventListener('touchstart', handleTouchStart, { passive: true });
      mainSection.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    if (replySection) {
      replySection.addEventListener('touchstart', handleTouchStart, { passive: true });
      replySection.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (mainSection) {
        mainSection.removeEventListener('touchstart', handleTouchStart);
        mainSection.removeEventListener('touchend', handleTouchEnd);
      }
      if (replySection) {
        replySection.removeEventListener('touchstart', handleTouchStart);
        replySection.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [activeVideoIndex, videos.length, goToNextReply, goToPrevReply, isMainPlayerActive, isReplyPlayerActive]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isMainPlayerActive) setIsMainPlayerActive(false);
        if (isReplyPlayerActive) setIsReplyPlayerActive(false);
        return;
      }

      if (isMainPlayerActive || isReplyPlayerActive) return;

      switch(e.key) {
        case 'ArrowDown':
          if (activeVideoIndex < videos.length - 1) {
            setActiveVideoIndex(prev => prev + 1);
            setActiveReplyIndex(0);
          }
          break;
        case 'ArrowUp':
          if (activeVideoIndex > 0) {
            setActiveVideoIndex(prev => prev - 1);
            setActiveReplyIndex(0);
          }
          break;
        case 'ArrowLeft':
          goToNextReply();
          break;
        case 'ArrowRight':
          goToPrevReply();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideoIndex, videos.length, goToNextReply, goToPrevReply, isMainPlayerActive, isReplyPlayerActive]);

  const handleLikeMainVideo = async (videoId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/api/videos/${videoId}/like`);
      const liked = response.data.liked;
      
      setLikedVideos(prev => {
        const newSet = new Set(prev);
        liked ? newSet.add(videoId) : newSet.delete(videoId);
        return newSet;
      });
      
      setVideos(prevVideos => 
        prevVideos.map(video => {
          if (video._id === videoId) {
            const userId = user._id || user.id;
            return {
              ...video,
              likes: liked 
                ? [...(video.likes || []), userId]
                : (video.likes || []).filter(id => id !== userId)
            };
          }
          return video;
        })
      );
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleLikeReply = async (replyId, parentId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/api/videos/${replyId}/like`);
      const liked = response.data.liked;
      
      setLikedReplies(prev => {
        const newSet = new Set(prev);
        liked ? newSet.add(replyId) : newSet.delete(replyId);
        return newSet;
      });
      
      setVideos(prevVideos => 
        prevVideos.map(video => {
          if (video._id === parentId) {
            const userId = user._id || user.id;
            return {
              ...video,
              replies: video.replies.map(reply => {
                if (reply._id === replyId) {
                  return {
                    ...reply,
                    likes: liked 
                      ? [...(reply.likes || []), userId]
                      : (reply.likes || []).filter(id => id !== userId)
                  };
                }
                return reply;
              })
            };
          }
          return video;
        })
      );
    } catch (error) {
      console.error('Like reply error:', error);
    }
  };

  const handleReply = (videoId) => {
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    navigate(`/upload?replyTo=${videoId}`);
  };

  const navigateToProfile = (username) => navigate(`/profile/${username}`);

  const canDeleteReply = (reply, mainVideo) => {
    if (!user) return false;
    
    const userId = user._id || user.id;
    const replyOwnerId = reply.user._id || reply.user.id;
    const videoOwnerId = mainVideo.user._id || mainVideo.user.id;
    
    return userId === replyOwnerId || userId === videoOwnerId;
  };

  const confirmDeleteReply = (replyId, videoId) => {
    setReplyToDelete({ replyId, videoId });
    setShowDeleteReplyModal(true);
  };

  const handleDeleteReply = async () => {
    if (!replyToDelete) return;
    
    try {
      await api.delete(`/api/videos/${replyToDelete.replyId}`);
      
      setVideos(prevVideos => 
        prevVideos.map(video => {
          if (video._id === replyToDelete.videoId) {
            return {
              ...video,
              replies: video.replies.filter(r => r._id !== replyToDelete.replyId)
            };
          }
          return video;
        })
      );
      
      const currentVideoReplies = videos[activeVideoIndex].replies;
      if (currentVideoReplies.length > 1) {
        if (activeReplyIndex >= currentVideoReplies.length - 1 && activeReplyIndex > 0) {
          setActiveReplyIndex(prev => prev - 1);
        }
      } else {
        setActiveReplyIndex(0);
      }
      
      setShowDeleteReplyModal(false);
      setReplyToDelete(null);
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert(error.response?.data?.error || 'فشل حذف الرد');
    }
  };

  const currentVideo = videos[activeVideoIndex];

  if (error) {
    return (
      <div className="error-container">
        <div className="error-wrapper">
          <h2>خطأ في التحميل</h2>
          <p>{error}</p>
          <button onClick={fetchVideos} className="retry-btn">إعادة المحاولة</button>
        </div>
        <NavigationBar currentPage="home" />
      </div>
    );
  }
  
  if (!loading && !videos?.length) {
    return (
      <div className="empty-state-container">
        <div className="empty-wrapper">
          <h2>لا توجد فيديوهات</h2>
          <p>كن أول من يشارك محتوى!</p>
        </div>
        <NavigationBar currentPage="home" />
      </div>
    );
  }

  if (loading || !currentVideo) {
    return null;
  }

  return (
    <div className="home-page">
      <div className="content-wrapper">
        {/* Main Video Section */}
        <div className={`main-video-section ${isMainPlayerActive ? 'player-active' : ''}`}>
          <AdvancedVideoPlayer
            ref={mainVideoRef}
            videoUrl={getAssetUrl(currentVideo.videoUrl)}
            isMuted={isMuted}
            videoId={currentVideo._id}
            onDownload={(url, id, name) => downloadVideo(url, id, name)}
            downloadProgress={downloadProgress[currentVideo._id]}
            isDownloaded={downloadedVideos.has(currentVideo._id)}
            isPlayerActive={isMainPlayerActive}
            onActivatePlayer={() => setIsMainPlayerActive(true)}
            onDeactivatePlayer={() => setIsMainPlayerActive(false)}
            showNavigationArrows={false}
          />

          <div className={`video-info ${isMainPlayerActive ? 'hidden' : ''}`}>
            <p className="video-description">{currentVideo.description}</p>
          </div>

          <div className={`action-buttons ${isMainPlayerActive ? 'hidden' : ''}`}>
            <div 
              className="action-btn-unified profile-btn"
              onClick={() => navigateToProfile(currentVideo.user.username)}
            >
              <img 
                src={getAssetUrl(currentVideo.user.profileImage) || '/default-avatar.png'} 
                alt={currentVideo.user.username}
                className="profile-image"
              />
            </div>

            <button 
              className={`action-btn-unified ${likedVideos.has(currentVideo._id) ? 'liked' : ''}`}
              onClick={() => handleLikeMainVideo(currentVideo._id)}
            >
              <FaHeart />
              <span className="count">{currentVideo.likes?.length || 0}</span>
            </button>

            <button 
              className="action-btn-unified"
              onClick={() => handleReply(currentVideo._id)}
            >
              <FaComment />
              <span className="count">{currentVideo.replies?.length || 0}</span>
            </button>
          </div>
        </div>

        {/* Replies Section */}
        <div className={`replies-section ${isReplyPlayerActive ? 'player-active' : ''}`}>
          {currentVideo?.replies?.length > 0 ? (
            <div className="reply-video-container">
              <AdvancedVideoPlayer
                ref={replyVideoRef}
                videoUrl={getAssetUrl(currentVideo.replies[activeReplyIndex].videoUrl)}
                isMuted={isMuted}
                videoId={currentVideo.replies[activeReplyIndex]._id}
                onDownload={(url, id, name) => downloadVideo(url, id, name)}
                downloadProgress={downloadProgress[currentVideo.replies[activeReplyIndex]._id]}
                isDownloaded={downloadedVideos.has(currentVideo.replies[activeReplyIndex]._id)}
                key={currentVideo.replies[activeReplyIndex]._id}
                isPlayerActive={isReplyPlayerActive}
                onActivatePlayer={() => setIsReplyPlayerActive(true)}
                onDeactivatePlayer={() => setIsReplyPlayerActive(false)}
                showNavigationArrows={true}
              />

              {!isReplyPlayerActive && (
                <>
                  {canDeleteReply(currentVideo.replies[activeReplyIndex], currentVideo) && (
                    <button
                      className="delete-reply-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeleteReply(
                          currentVideo.replies[activeReplyIndex]._id,
                          currentVideo._id
                        );
                      }}
                      title="حذف الرد"
                    >
                      <FaTrash />
                    </button>
                  )}

                  <div className="reply-info">
                    <p className="reply-description">{currentVideo.replies[activeReplyIndex].description}</p>
                  </div>

                  <div className="reply-actions">
                    <div 
                      className="action-btn-unified reply-profile-btn"
                      onClick={() => navigateToProfile(currentVideo.replies[activeReplyIndex].user.username)}
                    >
                      <img 
                        src={getAssetUrl(currentVideo.replies[activeReplyIndex].user.profileImage) || '/default-avatar.png'} 
                        alt={currentVideo.replies[activeReplyIndex].user.username}
                        className="profile-image"
                      />
                    </div>

                    <button
                      className={`action-btn-unified ${likedReplies.has(currentVideo.replies[activeReplyIndex]._id) ? 'liked' : ''}`}
                      onClick={() => handleLikeReply(currentVideo.replies[activeReplyIndex]._id, currentVideo._id)}
                    >
                      <FaHeart />
                      <span className="count">{currentVideo.replies[activeReplyIndex].likes?.length || 0}</span>
                    </button>
                  </div>
                </>
              )}

              {currentVideo.replies.length > 0 && (
                <>
                  <button 
                    className={`reply-nav reply-nav-right ${activeReplyIndex === 0 ? 'disabled' : ''}`}
                    onClick={goToPrevReply}
                    disabled={activeReplyIndex === 0}
                  >
                    <FaChevronRight />
                  </button>
                  <button 
                    className={`reply-nav reply-nav-left ${activeReplyIndex === currentVideo.replies.length - 1 ? 'disabled' : ''}`}
                    onClick={goToNextReply}
                    disabled={activeReplyIndex === currentVideo.replies.length - 1}
                  >
                    <FaChevronLeft />
                  </button>
                </>
              )}

              <div className={`reply-counter ${isReplyPlayerActive ? 'player-mode' : ''}`}>
                {activeReplyIndex + 1} / {currentVideo.replies.length}
              </div>
            </div>
          ) : (
            <div className="no-replies">
              <div className="no-replies-content">
                <div className="no-replies-icon">
                  <FaComment />
                </div>
                <h3>لا توجد ردود بعد</h3>
                <p>كن أول من يشارك رأيه</p>
                <button className="create-reply-btn" onClick={() => handleReply(currentVideo._id)}>
                  إضافة رد
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteReplyModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteReplyModal(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>تأكيد حذف الرد</h3>
            </div>
            <div className="modal-body">
              <p>هل أنت متأكد من حذف هذا الرد؟ لا يمكن التراجع عن هذا الإجراء.</p>
            </div>
            <div className="modal-actions">
              <button className="confirm-delete-btn" onClick={handleDeleteReply}>
                <FaTrash /> حذف نهائياً
              </button>
              <button className="cancel-modal-btn" onClick={() => setShowDeleteReplyModal(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
{/* ✅ Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <NavigationBar currentPage="home" />
    </div>
  );
};

export default HomePage;
