import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    
    // ✅ PWA Plugin Configuration
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-96x96.png',
        'apple-touch-icon.png',
        'web-app-manifest-192x192.png',
        'web-app-manifest-512x512.png'
      ],
      manifest: {
        name: 'Otogram - شارك لحظاتك مع العالم',
        short_name: 'Otogram',
        description: 'منصة عربية لمشاركة الفيديوهات القصيرة والردود التفاعلية',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/?source=pwa',
        icons: [
          {
            src: '/favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:mp4|webm|ogg)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'videos-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              rangeRequests: true
            }
          }
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: false, // ✅ تعطيل في التطوير
        type: 'module'
      }
    })
  ],
  
  // ✅ Server Configuration
  server: {
    port: 3000,
    host: true,
    strictPort: false,
    open: false,
    cors: true,
    
    // Proxy Configuration
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Received Response:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
    
    // Headers for Security
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },
  
  // ✅ Preview Server Configuration
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
    open: false,
    cors: true,
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'public, max-age=3600'
    }
  },
  
  // ✅ Build Configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    cssCodeSplit: true,
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
    
    // Terser Options for Minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      format: {
        comments: false
      }
    },
    
    // Rollup Options
    rollupOptions: {
      output: {
        // Manual Chunks for Code Splitting
        manualChunks(id) {
          // Vendor Chunks
          if (id.includes('node_modules')) {
            // React & React DOM
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            // React Router
            if (id.includes('react-router-dom') || id.includes('react-router')) {
              return 'router-vendor';
            }
            
            // Axios
            if (id.includes('axios')) {
              return 'axios-vendor';
            }
            
            // React Icons
            if (id.includes('react-icons')) {
              return 'icons-vendor';
            }
            
            // Swiper
            if (id.includes('swiper')) {
              return 'swiper-vendor';
            }
            
            // Other vendors
            return 'vendor';
          }
        },
        
        // Asset File Names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          
          if (/\.(png|jpe?g|svg|gif|webp|ico)$/.test(assetInfo.name)) {
            extType = 'images';
          } else if (/\.(woff|woff2|ttf|eot)$/.test(assetInfo.name)) {
            extType = 'fonts';
          } else if (/\.css$/.test(assetInfo.name)) {
            extType = 'css';
          }
          
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        
        // Chunk File Names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        
        // Entry File Names
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    }
  },
  
  // ✅ Dependency Optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'react-icons',
      'react-icons/fa',
      'react-icons/bs',
      'react-icons/ai',
      'swiper',
      'swiper/css',
      'swiper/css/navigation',
      'swiper/css/pagination'
    ],
    exclude: ['@vitejs/plugin-react']
  },
  
  // ✅ Environment Variables
  envPrefix: 'VITE_',
  
  // ✅ Base URL Configuration
  base: '/',
  
  // ✅ Public Directory
  publicDir: 'public',
  
  // ✅ CSS Configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false
      }
    },
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // ✅ Resolve Configuration
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@context': '/src/context',
      '@assets': '/src/assets',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks'
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  
  // ✅ JSON Configuration
  json: {
    stringify: true
  },
  
  // ✅ esbuild Configuration
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    jsxInject: "import React from 'react'"
  },
  
  // ✅ Define Global Constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
})