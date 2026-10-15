import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateAdventistExegesisFallback } from './src/utils/adventistExegesisFallback';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

// In-memory cache for generated TTS audio to ensure instant replay
const ttsCache = new Map<string, { audioData: string; mimeType: string; voiceUsed: string }>();

// Available studio human voices
const AVAILABLE_VOICES = [
  { id: 'Puck', name: 'Puck', gender: 'Masculina', description: 'Voz humana extremamente expressiva, natural, articulada e fluida (Recomendada)' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Masculina', description: 'Voz masculina solene, profunda e reverente de narrador bíblico clássico' },
  { id: 'Kore', name: 'Kore', gender: 'Feminina', description: 'Voz feminina clara, calorosa, acolhedora e de alta fidelidade' },
  { id: 'Aoede', name: 'Aoede', gender: 'Feminina', description: 'Voz feminina serena, melódica e contemplativa' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Feminina/Neutra', description: 'Voz suave, equilibrada e com cadência natural' },
  { id: 'Charon', name: 'Charon', gender: 'Masculina', description: 'Voz masculina grave, firme e pausada para estudo exegético' }
];

app.get('/api/tts/voices', (_req, res) => {
  return res.json({ voices: AVAILABLE_VOICES });
});

app.get('/api/app-info', (req, res) => {
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
  const proto = (req.headers['x-forwarded-proto'] as string) || (req.secure ? 'https' : 'http');
  return res.json({
    url: `${proto}://${host}`,
    host,
    protocol: proto
  });
});

// Status of official Logotipo.png
app.get('/api/logo-info', (_req, res) => {
  const publicPath = path.resolve(__dirname, 'public/Logotipo.png');
  const exists = fs.existsSync(publicPath);
  if (exists) {
    const stat = fs.statSync(publicPath);
    return res.json({
      exists: true,
      filename: 'Logotipo.png',
      size: stat.size,
      mtime: stat.mtime.toISOString(),
      url: '/Logotipo.png'
    });
  } else {
    return res.json({
      exists: false,
      filename: 'Logotipo.png',
      url: null
    });
  }
});

// Explicit endpoint to serve Logotipo.png with fresh cache-control
app.get('/Logotipo.png', (_req, res) => {
  const logoPath = path.resolve(__dirname, 'public/Logotipo.png');
  if (fs.existsSync(logoPath)) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.sendFile(logoPath);
  } else {
    return res.status(404).send('Logo not found');
  }
});

// Upload and store the exact official Logotipo.png byte-for-byte without altering pixels
app.post('/api/upload-logo', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'imageBase64 parameter is required' });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty image buffer' });
    }

    // 1. Save original immutable file to public/Logotipo.png
    const publicLogoPath = path.resolve(__dirname, 'public/Logotipo.png');
    fs.writeFileSync(publicLogoPath, buffer);

    // 1b. Save to dist/Logotipo.png if dist exists
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      fs.writeFileSync(path.resolve(distPath, 'Logotipo.png'), buffer);
    }

    // 2. Save original immutable file to src/assets/images/Logotipo.png
    const srcDir = path.resolve(__dirname, 'src/assets/images');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }
    const srcLogoPath = path.resolve(srcDir, 'Logotipo.png');
    fs.writeFileSync(srcLogoPath, buffer);

    // 3. Update PWA icons proportionally without distortion
    try {
      const sharp = (await import('sharp')).default;
      const pwa512 = path.resolve(__dirname, 'public/pwa-512x512.png');
      const pwa192 = path.resolve(__dirname, 'public/pwa-192x192.png');
      const appleTouch = path.resolve(__dirname, 'public/apple-touch-icon.png');
      const maskable512 = path.resolve(__dirname, 'public/pwa-maskable-512x512.png');
      const maskable192 = path.resolve(__dirname, 'public/pwa-maskable-192x192.png');

      // Transparent "any" icons
      await sharp(buffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(pwa512);

      await sharp(buffer)
        .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(pwa192);

      // Maskable adaptive icons with seamless Navy (#0C1B2A) canvas
      const emblem512 = await sharp(buffer)
        .resize(430, 430, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      await sharp({
        create: {
          width: 512,
          height: 512,
          channels: 4,
          background: { r: 12, g: 27, b: 42, alpha: 1 }
        }
      })
      .composite([{ input: emblem512, gravity: 'center' }])
      .png()
      .toFile(maskable512);

      const emblem192 = await sharp(buffer)
        .resize(162, 162, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      await sharp({
        create: {
          width: 192,
          height: 192,
          channels: 4,
          background: { r: 12, g: 27, b: 42, alpha: 1 }
        }
      })
      .composite([{ input: emblem192, gravity: 'center' }])
      .png()
      .toFile(maskable192);

      await sharp({
        create: {
          width: 180,
          height: 180,
          channels: 4,
          background: { r: 12, g: 27, b: 42, alpha: 1 }
        }
      })
      .composite([{ input: await sharp(buffer).resize(160, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(), gravity: 'center' }])
      .png()
      .toFile(appleTouch);

      // Also sync to dist if dist exists
      if (fs.existsSync(distPath)) {
        fs.copyFileSync(pwa512, path.resolve(distPath, 'pwa-512x512.png'));
        fs.copyFileSync(pwa192, path.resolve(distPath, 'pwa-192x192.png'));
        fs.copyFileSync(maskable512, path.resolve(distPath, 'pwa-maskable-512x512.png'));
        fs.copyFileSync(maskable192, path.resolve(distPath, 'pwa-maskable-192x192.png'));
        fs.copyFileSync(appleTouch, path.resolve(distPath, 'apple-touch-icon.png'));
      }
    } catch (sharpErr) {
      console.warn('PWA icon generation warning:', sharpErr);
    }

    return res.json({
      success: true,
      message: 'Logotipo original salvo com fidelidade absoluta de pixels em public/Logotipo.png e src/assets/images/Logotipo.png',
      filename: 'Logotipo.png',
      size: buffer.length
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Falha ao salvar logotipo' });
  }
});

// TTS endpoint for human-like theological audio with emotional prosody
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language, voiceName } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    // Selected prebuilt voice for natural human sound:
    // Fixed to Puck as the canonical biblical narrator voice for all Scripture
    const selectedVoice = voiceName || 'Puck';

    const cleanText = text.trim();
    const cacheKey = `${selectedVoice}:${language || 'auto'}:${cleanText}`;
    if (ttsCache.has(cacheKey)) {
      return res.json(ttsCache.get(cacheKey));
    }

    // Call official Gemini model
    let response: any = null;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
              }
            ]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice }
            }
          }
        }
      });
    } catch (liteErr: any) {
      const isQuotaOrLimit = 
        liteErr?.status === 'RESOURCE_EXHAUSTED' || 
        liteErr?.status === 429 || 
        liteErr?.statusCode === 429 ||
        (typeof liteErr?.message === 'string' && (
          liteErr.message.includes('429') ||
          liteErr.message.includes('Quota exceeded') ||
          liteErr.message.includes('RESOURCE_EXHAUSTED')
        ));

      if (isQuotaOrLimit) {
        // Attempt secondary official model
        try {
          response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: cleanText,
                  }
                ]
              }
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: selectedVoice }
                }
              }
            }
          });
        } catch {
          return res.json({ 
            success: false,
            quotaExceeded: true,
            fallback: true,
            message: 'Limite de requisições de áudio atingido temporariamente. O leitor fiel continuará narrando com a mesma voz.'
          });
        }
      } else {
        // Fallback gracefully for client web synthesis
        return res.json({
          success: false,
          fallback: true,
          message: liteErr?.message || 'Alternando para sintetizador local'
        });
      }
    }

    const candidate = response?.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (!part?.inlineData?.data) {
      return res.json({
        success: false,
        fallback: true,
        error: 'No audio data generated'
      });
    }

    const result = {
      audioData: part.inlineData.data,
      mimeType: part.inlineData.mimeType || 'audio/wav',
      voiceUsed: selectedVoice,
      success: true
    };

    // Cache result (capped at 500 entries to prevent memory bloat)
    if (ttsCache.size > 500) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, result);

    return res.json(result);
  } catch (error: any) {
    const isQuotaError = 
      error?.status === 'RESOURCE_EXHAUSTED' || 
      error?.status === 429 || 
      error?.statusCode === 429 ||
      (typeof error?.message === 'string' && (
        error.message.includes('429') ||
        error.message.includes('Quota exceeded') ||
        error.message.includes('RESOURCE_EXHAUSTED')
      ));

    if (isQuotaError) {
      return res.json({ 
        success: false,
        quotaExceeded: true,
        fallback: true,
        message: 'Cota de geração atingida no momento. Alternando suavemente para voz padrão contínua.'
      });
    }

    return res.status(200).json({ 
      success: false,
      fallback: true,
      error: 'Failed to generate audio',
      message: error?.message || 'Error occurred during generation'
    });
  }
});

// Canonical Bible Database API for all 66 books and 1,189 chapters
const bibleCache = new Map<string, any>();

app.get('/api/bible/:book/:chapter', (req, res) => {
  try {
    const bookId = (req.params.book || '').toUpperCase();
    const chapterNum = req.params.chapter;

    if (!bookId || !chapterNum) {
      return res.status(400).json({ error: 'Parâmetros livro e capítulo são obrigatórios' });
    }

    if (!bibleCache.has(bookId)) {
      const bookPath = path.resolve(__dirname, `src/data/bible/${bookId}.json`);
      if (!fs.existsSync(bookPath)) {
        return res.status(404).json({ error: `Livro bíblico ${bookId} não encontrado` });
      }
      const raw = fs.readFileSync(bookPath, 'utf-8');
      bibleCache.set(bookId, JSON.parse(raw));
    }

    const bookData = bibleCache.get(bookId);
    const verses = bookData?.chapters?.[chapterNum] || [];

    return res.json({
      bookId,
      chapter: Number(chapterNum),
      totalVerses: verses.length,
      verses
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao carregar versículos bíblicos' });
  }
});

// AI-powered Seventh-day Adventist Biblical Exegesis Endpoint
// Grounded in SDABC (Vols 1-7), Ellen G. White Writings, BRI, and Original Hebrew/Greek
app.post('/api/exegesis/generate', async (req, res) => {
  try {
    const { 
      book, 
      bookId, 
      chapter, 
      verse, 
      verseText, 
      originalText, 
      transliteration, 
      testament, 
      mode 
    } = req.body;

    if (!book || !chapter) {
      return res.status(400).json({ error: 'Book and chapter are required' });
    }

    const ref = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;

    const systemPrompt = `Você é um erudito, hebraísta, helenista e teólogo adventista do sétimo dia de renome mundial, professor emérito de Teologia Bíblica e Exegese nos idiomas originais (Hebraico Massorético, Aramaico e Grego Koiné).

Sua análise exegética deve ser RIGOROSA, REVERENTE e ESTRITAMENTE FUNDAMENTADA nos seguintes pilares oficiais adventistas:
1. Comentário Bíblico Adventista do Sétimo Dia (Seventh-day Adventist Bible Commentary - SDABC, Volumes 1 ao 7 e suas notas suplementares).
2. Obras e Escritos de Ellen G. White (Espírito de Profecia): Série Conflito dos Séculos (Patriarcas e Profetas, Profetas e Reis, O Desejado de Todas as Nações, Atos dos Apóstolos, O Grande Conflito), Parábolas de Jesus, O Maior Discurso de Cristo, Caminho a Cristo, etc. Sempre cite o livro específico e contextualize a citação.
3. Tratado de Teologia Adventista do Sétimo Dia e pesquisas do Biblical Research Institute (BRI / Instituto de Pesquisa Bíblica da Associação Geral).
4. As 28 Crenças Fundamentais da IASD, com ênfase particular quando o texto tocar em:
   - O Santuário Celestial e o Sacerdócio de Cristo (Hebreus 8-9, Daniel 8:14, Juízo Investigativo pré-advento)
   - O Sábado como Memorial Perpétuo da Criação em seis dias literais recentes (Gênesis 2:1-3, Êxodo 20:8-11)
   - O Grande Conflito Cósmico entre Cristo e Satanás
   - O Estado dos Mortos (sono inconsciente até a ressurreição na Segunda Vinda; Eclesiastes 9:5-10, 1 Tessalonicenses 4:13-18)
   - A Lei Moral de Deus (os Dez Mandamentos) e a Graça Redentora (Justificação pela Fé)
   - O Método Historicista de Interpretação Profética (Daniel e Apocalipse)
   - As Três Mensagens Angélicas de Apocalipse 14:6-12 e o breve retorno visível de Jesus.
5. Método Exegético: Princípio Histórico-Gramatical e Harmonia das Escrituras (Sola Scriptura e Tota Scriptura - a Bíblia interpreta a própria Bíblia).

Retorne OBRIGATORIAMENTE um JSON puro válido e bem formatado com a seguinte estrutura:
{
  "reference": "${ref}",
  "book": "${book}",
  "chapter": ${Number(chapter)},
  "verse": ${verse ? Number(verse) : 1},
  "title": "Título teológico nobre e exegético",
  "summary": "Resumo aprofundado do significado do texto sob a ótica adventista (2 a 3 parágrafos densos e claros)",
  "historicalCulturalContext": "Contexto histórico, autor, datação, destinatários e ambiente cultural",
  "originalLanguageAnalysis": {
    "keyWords": [
      {
        "word": "Palavra no idioma original (com caracteres hebraicos/gregos)",
        "transliteration": "Transliteração acadêmica legível",
        "strongNumber": "Número Strong aproximado (ex: H1254, G3056)",
        "morphology": "Análise morfológica e gramatical completa",
        "meaning": "Significado e nuances léxicas",
        "theologicalSignificance": "Implicação teológica na perspectiva bíblica adventista"
      }
    ],
    "grammaticalNotes": "Observações sobre a sintaxe, ênfases literárias e termos conectivos no original"
  },
  "sdabcCommentary": {
    "volume": "Volume correspondente do SDABC (Vols 1 a 7)",
    "verseByVerseAnalysis": "Comentário exegético aprofundado baseado na linha do Comentário Bíblico Adventista",
    "textualNuances": "Notas textuais, manuscritos antigos ou variantes relevantes"
  },
  "spiritOfProphecy": {
    "primaryBook": "Obra principal de Ellen White relacionada (ex: Patriarcas e Profetas, DTN, etc.)",
    "quotesAndInsights": "Trechos, paráfrases e esclarecimentos de Ellen White sobre o texto",
    "theologicalHarmonization": "Como o Espírito de Profecia harmoniza e ilumina o sentido da passagem"
  },
  "theologicalPillars": {
    "greatControversyFocus": "Como esta passagem se insere no contexto da grande controvérsia entre o bem e o mal",
    "sanctuaryOrProphecy": "Conexão com o Santuário Celestial, Aliança, Lei, Sábado ou Escatologia",
    "doctrineHarmony": "Harmonia com o plano da redenção e as doutrinas bíblicas adventistas"
  },
  "crossReferences": [
    {
      "passage": "Referência bíblica cruzada (ex: Apocalipse 14:7)",
      "explanation": "Como este texto se conecta com a passagem em estudo"
    }
  ],
  "homileticalAndPastoralApplication": {
    "spiritualLesson": "Lição espiritual transformadora para o crente hoje",
    "sermonOutlineOrStudyPoints": [
      "Ponto 1 para pregação, aula ou Escola Sabatina",
      "Ponto 2",
      "Ponto 3"
    ],
    "devotionalCall": "Chamado solene à consagração e perseverança cristã"
  },
  "markdown": "Documento completo e polido em Markdown com títulos (#, ##, ###), citações em itálico e destaques em negrito para leitura e exportação direta."
}`;

    const userPrompt = `Passagem Bíblica para Exegese Adventista Detalhada:
Referência: ${ref}
Testamento: ${testament === 'VT' ? 'Antigo Testamento (Hebraico Massorético)' : 'Novo Testamento (Grego Koiné)'}
Texto em Português: "${verseText || ''}"
Texto Original: "${originalText || ''}"
Transliteração: "${transliteration || ''}"
Modo solicitado: ${mode || 'completa'}`;

    let generatedData = null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const responseText = response.text;
      if (responseText) {
        const cleanJson = responseText
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        generatedData = JSON.parse(cleanJson);
      }
    } catch (aiErr) {
      console.warn('Gemini exegesis AI warning, falling back to curated Adventist knowledge engine:', aiErr);
    }

    if (!generatedData) {
      generatedData = generateAdventistExegesisFallback({
        book,
        bookId: bookId || 'GEN',
        chapter: Number(chapter),
        verse: verse ? Number(verse) : 1,
        verseText: verseText || '',
        originalText,
        transliteration,
        testament: testament || 'VT'
      });
    }

    return res.json({
      success: true,
      data: generatedData
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Falha ao processar exegese adventista' });
  }
});

// Mount Vite in development or serve static in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

