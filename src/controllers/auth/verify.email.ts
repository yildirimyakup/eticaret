import User from "../../models/User";
import { Request, Response } from "express";

export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
    try {
        const token = req.body.token as string;

        if (!token) {
            return res.status(400).json({
                message: "Doğrulama token'ı eksik.",
                success: false,
            });
        }

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({
                message: "Geçersiz veya süresi dolmuş doğrulama token'ı.",
                success: false,
            });
        }

        if (user.isActive) {
            return res.status(400).json({
                message: "Bu hesap zaten aktif.",
                success: false,
            });
        }

        user.isActive = true;
        user.verificationToken = "undefined"; // Token artık kullanılmasın diye temizliyoruz
        await user.save();

        return res.status(200).json({
            message: "E-posta başarıyla doğrulandı. Artık giriş yapabilirsiniz.",
            success: true,
        });

    } catch (error) {
        console.error("Email doğrulama hatası:", error);
        return res.status(500).json({
            message: "Bir hata oluştu, lütfen daha sonra tekrar deneyiniz.",
            success: false,
        });
    }
};
