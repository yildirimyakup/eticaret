import {NextFunction,Response,Request} from "express";

// Middleware'leri kullanıyoruz
export const csp =(req: Request, res: Response,next:NextFunction)    => {
    // Content Security Policy (CSP) ayarları yapıyoruz(script çalıştırılamaz ve nesne yüklenemez)
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'none'; object-src 'none';");
    next();
}

export const cto =(req: Request, res: Response,next:NextFunction)    => {
    // X-Content-Type-Options ayarları yapıyoruz.(tipi belirlenmiş dosyaların yüklenmesini sağlıyoruz)
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
}

// X-Frame-Options ayarları yapıyoruz.(sayfanın iframe içinde yüklenmesini engelliyoruz)
export const xFrameOptions = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Frame-Options", "DENY"); // sayfanın iframe içinde yüklenmesini engelliyoruz
    next();
}

// X-XSS-Protection ayarları yapıyoruz.(Cross-Site Scripting saldırıları engelliyoruz)
export const xXssProtection = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");// X-XSS-Protection ayarları yapıyoruz(XSS saldırılarını engelliyoruz)
    next();
}

// HSTS ayarları yapıyoruz.(HTTP Strict Transport Security ayarları yapıyoruz)
export const hsts = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");// HSTS ayarları yapıyoruz
    next();
}