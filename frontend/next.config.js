/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
              "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.openweathermap.org https://tile.openweathermap.org https://server.arcgisonline.com https://services.arcgisonline.com https://*.arcgisonline.com https://*.tile.openstreetmap.org https://unpkg.com",
              "font-src 'self' https://fonts.gstatic.com https://unpkg.com",
              "frame-src 'self' https://www.google.com",
              "connect-src 'self' http://localhost:5000 https://api.open-meteo.com https://api.openweathermap.org https://tile.openweathermap.org https://server.arcgisonline.com https://services.arcgisonline.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
