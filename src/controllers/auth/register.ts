import User from "../../models/User";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/generate.token";
import { isStrongPassword } from "../../utils/is.strong.password";
import xss from "xss";
import validator from "validator";
import {Resend} from "resend";
export const registerUser = async (req: Request, res: Response): Promise<any> => {
    try {
        // İstekten gelen verileri alıp XSS saldırılarına karşı temizliyoruz (xss modülü ile)
        const rawEmail = req.body.email?.trim();
        const password = req.body.password;
        const firstName = xss(req.body.firstName?.trim());
        const lastName = xss(req.body.lastName?.trim());
        const rawPhone = xss(req.body.phone?.trim());

        // Tüm gerekli alanların dolu olup olmadığını kontrol ediyoruz
        if (!rawEmail || !password || !firstName || !lastName || !rawPhone) {
            return res.status(400).json({
                message: "Tüm alanlar (email, şifre, ad, soyad, telefon) doldurulmalıdır.",
                success: false,
            });
        }

        // E-posta adresini normalize ediyoruz ve geçerli olup olmadığını kontrol ediyoruz
        const email = validator.normalizeEmail(rawEmail);
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({
                message: "Lütfen geçerli bir e-posta adresi girin.",
                success: false,
            });
        }

        // Türkiye telefon numarası kontrolü: 10 haneli olmalı ve 0 ile başlamamalı
        const phoneRegex = /^[1-9][0-9]{9}$/;
        if (!phoneRegex.test(rawPhone)) {
            return res.status(400).json({
                message: "Lütfen geçerli bir telefon numarası girin. Başında '0' olmadan 10 haneli yazınız (örnek: 5301234567).",
                success: false,
            });
        }

        // Telefonu uluslararası formata çeviriyoruz
        const formattedPhone = `+90${rawPhone}`;

        // Şifrenin güçlü olup olmadığını kontrol ediyoruz (örneğin: büyük harf, küçük harf, rakam, uzunluk)
        if (!isStrongPassword(password)) {
            return res.status(400).json({
                message: "Şifre en az 8 karakter uzunluğunda, bir büyük harf, bir küçük harf ve bir rakam içermelidir.",
                success: false,
            });
        }

        // Bu e-posta adresiyle daha önce kayıt yapılmış mı diye kontrol ediyoruz
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Bu e-posta adresi zaten kullanımda.",
                success: false,
            });
        }

        // Şifreyi hash'liyoruz (bcrypt ile güvenli hale getiriyoruz)
        const passwordHash = await bcrypt.hash(password, 10);

        // Yeni kullanıcı nesnesini oluşturuyoruz
        const newUser = new User({
            email,
            passwordHash,
            firstName,
            lastName,
            phone: formattedPhone,
            verificationToken: generateToken(), // E-posta doğrulaması için token oluştur
            isActive: false, // Henüz aktif değil, çünkü mail doğrulanmadı
        });

        // Kullanıcıyı veritabanına kaydediyoruz
        await newUser.save();

        // Resend ile mail gönderme
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
            from: 'noreply@yildirimyakup.com', // Alan adı doğrulamanız tamamlandığı için, burada kendi alan adınızı kullanabilirsiniz.
            to: newUser.email,
            subject: 'Email Verification',
            html: `
    <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f9;">
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333333; text-align: center;">Email Verification</h2>
          <p style="font-size: 16px; color: #555555; text-align: center;">
            Hello ${newUser.firstName},<br><br>
            Thank you for registering with us. Please verify your email address by clicking the link below:<br><br>
            <a href="${process.env.FRONTEND_URL}/verify-email?token=${newUser.verificationToken}" 
               style="display: inline-block; padding: 12px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 5px; text-align: center;">
               Verify Email Address
            </a>
          </p>
          <br>
          <p style="font-size: 14px; color: #888888; text-align: center;">
            If you did not register with us, please ignore this email.<br><br>
            <small>© ${new Date().getFullYear()} Yıldırım Yakup</small>
          </p>
        </div>
      </body>
    </html>
  `,
        });
        // Başarılı yanıt dönüyoruz
        return res.status(201).json({
            message: "Kullanıcı kaydınız tamamlandı, lütfen e-postanızı onaylayınız.",
            success: true,
            data: {
                id: newUser._id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phone: newUser.phone,
            },
        });

    } catch (error) {
        // Hata detayını konsola/loga yazıyoruz
        console.error("Kayıt sırasında hata:", error);

        // Kullanıcıya sadece genel ve güvenli bir mesaj gösteriyoruz
        return res.status(500).json({
            message: "Bir hata oluştu, lütfen daha sonra tekrar deneyiniz.",
            success: false,
        });
    }
};
