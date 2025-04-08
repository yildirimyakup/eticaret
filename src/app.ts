import express from 'express';
import fs from 'fs';
import https from 'https';
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';
import {csp, hsts, xFrameOptions, xXssProtection} from "./middlewares/helmet.middlewares";
import {cto} from "./middlewares/helmet.middlewares";
import connectDB from "./config/database";
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authRouter from "./routes/auth";



const app = express();

// MongoDB bağlantısını başlat
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}


// Middleware'leri kullanıyoruz

app.use(helmet());
app.use(csp); // Content security policy ayarları
app.use(cto); // X-Content-Type-Options ayarları
app.use(xFrameOptions); // X-Frame-Options ayarları
app.use(hsts); // HSTS ayarları
app.use(xXssProtection); // X-XSS-Protection ayarları
app.use(cors()); // CORS ayarları
app.use(morgan('dev')); // HTTP isteklerini loglamak için Morgan
app.use(express.json()); // JSON verileri almak için express.json() kullanıyoruz (body-parser'a gerek yok)
app.use(express.urlencoded({ extended: true })); // URL-encoded veri için
app.use(cookieParser()); // Cookie'leri parse etmek için Cookie Parser
// Ana dizin için bir GET isteği tanımlıyoruz
app.get('/', (req, res) => {
    res.send('Hello, TypeScript!');
});

app.use('/api/auth',authRouter);

// Sadece test ortamında değilse HTTPS sunucusunu başlat
if (process.env.NODE_ENV !== 'test') {
    //sunucuyu https ile başlatmak için gerekli olan ssl sertifikası
    const options = {
        key: fs.readFileSync(__dirname +'/ssl/localhost+2-key.pem'),
        cert: fs.readFileSync(__dirname +'/ssl/localhost+2.pem')
    };

    // HTTPS portunu alıyoruz, eğer tanımlı değilse 3001 kullanıyoruz
    const port = process.env.HTTPS_PORT || 3001;

    // Sunucuyu başlatıyoruz
    https.createServer(options, app).listen(port, () => {
        console.log(`HTTPS sunucusu ${port} portunda çalışıyor`);
    });
}

export default app;
