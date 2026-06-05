const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file path
const dataFile = 'data.json';

// Initialize data if doesn't exist
function initData() {
  if (!fs.existsSync(dataFile)) {
    const initialData = {
      tips: [
        { id:1, sport:'fudbal', match:'Manchester City - Liverpool', league:'Premier League', tip:'1X', odds:'1.45', result:'win', date:new Date('2024-01-15').toISOString(), visibility:'free', note:'Očekujem dominaciju domaćina sa minimalno 2 gola razlike.', bookmakers:[{name:'Mozzart Bet',url:'https://mozzartbet.com'},{name:'1xBet',url:'https://1xbet.com'}] },
        { id:2, sport:'košarka', match:'Lakers - Celtics', league:'NBA', tip:'Kemba Amer >48.5', odds:'1.92', result:'loss', date:new Date('2024-01-14').toISOString(), visibility:'free', note:'Analiza pokazuje da bi trebalo prebiti liniju.' },
        { id:3, sport:'tenis', match:'Djokovic - Alcaraz', league:'Australian Open', tip:'Under 27.5', odds:'1.88', result:'pending', date:new Date('2024-01-13').toISOString(), visibility:'free', note:'Oba igrača su trenirala tvrdu poziciju.' },
      ],
      promos: [
        { id:1, name:'Mozzart Bet', code:'TIPKING100', bonus:'100% do 10.000 RSD', desc:'Bonus do 10.000 RSD na prvi depozit. Koeficijent 3.0.', status:'aktivan', featured:'da', clicks:0 },
        { id:2, name:'1xBet', code:'KING2024', bonus:'100% do 33.000 RSD', desc:'Dobrodošlica bonus do 33.000 RSD. Minimum koeficijent 1.5.', status:'aktivan', featured:'ne', clicks:0 },
        { id:3, name:'Meridianbet', code:'TIPKING50', bonus:'50% do 5.000 RSD + 50 FS', desc:'Bonus 50% na depozit, maksimalno 5.000 RSD + 50 besplatnih spinova.', status:'aktivan', featured:'ne', clicks:0 },
        { id:4, name:'Admiral', code:'ADMTIP', bonus:'2.000 RSD + spinovi', desc:'Kombinovani bonus za sport i kasino. 50 besplatnih spinova odmah.', status:'aktivan', featured:'ne', clicks:0 },
      ],
      siteStats: { winRate:'74%', roi:'+38.7%', totalTips:'1.240', avgOdds:'2.21', members:'4.6k+' },
      bookmakers: [
        { name:'Mozzart Bet', url:'https://mozzartbet.com' },
        { name:'1xBet', url:'https://1xbet.com' },
        { name:'Meridianbet', url:'https://meridianbet.rs' },
      ]
    };
    fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
  }
}

// Read data
function readData() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return { tips: [], promos: [], siteStats: {}, bookmakers: [] };
  }
}

// Write data
function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// ────── API ENDPOINTS ──────

// GET all data
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

// GET tips
app.get('/api/tips', (req, res) => {
  const data = readData();
  res.json(data.tips);
});

// POST new tip
app.post('/api/tips', (req, res) => {
  const data = readData();
  const newTip = req.body;
  if (!newTip.id) newTip.id = Date.now();
  if (!newTip.date) newTip.date = new Date().toISOString();
  if (!newTip.visibility) newTip.visibility = 'free';
  if (!newTip.bookmakers) newTip.bookmakers = [];
  
  const index = data.tips.findIndex(t => t.id === newTip.id);
  if (index >= 0) {
    data.tips[index] = newTip;
  } else {
    data.tips.push(newTip);
  }
  writeData(data);
  res.json(newTip);
});

// DELETE tip
app.delete('/api/tips/:id', (req, res) => {
  const data = readData();
  data.tips = data.tips.filter(t => t.id !== parseInt(req.params.id));
  writeData(data);
  res.json({ success: true });
});

// GET promos
app.get('/api/promos', (req, res) => {
  const data = readData();
  res.json(data.promos);
});

// POST new promo
app.post('/api/promos', (req, res) => {
  const data = readData();
  const newPromo = req.body;
  if (!newPromo.id) newPromo.id = Date.now();
  if (!newPromo.clicks) newPromo.clicks = 0;
  
  const index = data.promos.findIndex(p => p.id === newPromo.id);
  if (index >= 0) {
    data.promos[index] = newPromo;
  } else {
    data.promos.push(newPromo);
  }
  writeData(data);
  res.json(newPromo);
});

// DELETE promo
app.delete('/api/promos/:id', (req, res) => {
  const data = readData();
  data.promos = data.promos.filter(p => p.id !== parseInt(req.params.id));
  writeData(data);
  res.json({ success: true });
});

// UPDATE promo clicks
app.patch('/api/promos/:id/clicks', (req, res) => {
  const data = readData();
  const promo = data.promos.find(p => p.id === parseInt(req.params.id));
  if (promo) {
    promo.clicks = (promo.clicks || 0) + 1;
    writeData(data);
  }
  res.json(promo);
});

// GET site stats
app.get('/api/stats', (req, res) => {
  const data = readData();
  res.json(data.siteStats);
});

// POST site stats
app.post('/api/stats', (req, res) => {
  const data = readData();
  data.siteStats = req.body;
  writeData(data);
  res.json(data.siteStats);
});

// GET bookmakers
app.get('/api/bookmakers', (req, res) => {
  const data = readData();
  res.json(data.bookmakers);
});

// POST bookmakers
app.post('/api/bookmakers', (req, res) => {
  const data = readData();
  data.bookmakers = req.body;
  writeData(data);
  res.json(data.bookmakers);
});

// ────── EXPORT DATA ──────
app.get('/api/export', (req, res) => {
  const data = readData();
  data.exported = new Date().toISOString();
  res.json(data);
});

// ────── IMPORT DATA ──────
app.post('/api/import', (req, res) => {
  const importData = req.body;
  if (importData.tips) {
    const data = readData();
    if (importData.tips) data.tips = importData.tips;
    if (importData.promos) data.promos = importData.promos;
    if (importData.siteStats) data.siteStats = importData.siteStats;
    if (importData.bookmakers) data.bookmakers = importData.bookmakers;
    writeData(data);
    res.json({ success: true });
  } else {
    res.json({ error: 'Invalid data' });
  }
});

// Initialize and start
initData();
app.listen(PORT, () => {
  console.log(`🚀 TipKing server je pokrenut na http://localhost:${PORT}`);
  console.log(`📊 Admin panel: http://localhost:${PORT}/admin.html`);
  console.log(`🌐 Glavna stranica: http://localhost:${PORT}`);
});
