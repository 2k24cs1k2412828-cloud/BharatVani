export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'BharatVani PIB Live & Archive News Engine (Vercel Serverless)',
    languages: ['hi', 'en', 'ta', 'te', 'gu'],
    endpoints: ['/api/news', '/api/news/detail', '/api/tts', '/api/health']
  });
}
