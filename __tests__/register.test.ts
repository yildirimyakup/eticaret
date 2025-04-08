//mongo db sql enjection kontrolü eklenecek


// @ts-ignore
import request from 'supertest';
import mongoose, {Types} from 'mongoose';
import app from '../src/app';
import User from '../src/models/User';
import connectDB from '../src/config/database';

import {generateToken} from "../src/utils/generate.token";


describe('Authentication API Tests', () => {
  const token = generateToken(); // Test için token oluşturuluyor
  let userId: string;

  // Veritabanı bağlantısı ve temizlik işlemleri
  beforeAll(async () => {
    await connectDB(); // Veritabanına bağlan
    await User.deleteMany({}); // Testlerden önce veritabanını temizle
  });

  afterAll(async () => {
    await User.deleteMany({}); // Testlerden sonra veritabanını temizle
    await mongoose.connection.close(); // Bağlantıyı kapat
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890'
      };

      const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

      // API yanıtını kontrol et
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).toHaveProperty('firstName', userData.firstName);
      expect(response.body.data).toHaveProperty('lastName', userData.lastName);

      // Veritabanında kullanıcının oluşturulduğunu doğrula
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user?.email).toBe(userData.email);
      expect(user?.firstName).toBe(userData.firstName);
      expect(user?.lastName).toBe(userData.lastName);
      expect(user?.passwordHash).toBeDefined();
      expect(user?.passwordHash).not.toBe(userData.password); // Şifrenin hash'lendiğinden emin ol
    });
    it('should return an error for existing email', async () => {
      // Önce kullanıcıyı oluştur
      const existingUser = new User({
        email: 'existing@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Existing',
        lastName: 'User',
        role: 'user',
        phone: '0987654321',
        isActive: true
      });
      await existingUser.save();

      // Aynı e-posta ile kayıt girişimi
      const userData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Bu e-posta adresi zaten kullanımda.');
    });

    it('should validate required fields', async () => {
      const incompleteUserData = {
        email: 'incomplete@example.com',
        // Eksik alanlar: password, firstName, lastName
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteUserData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });

    it('should validate email format', async () => {
      const userData = {
        email: 'invalidemail',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Lütfen geçerli bir e-posta adresi girin.');
    });

    it('should validate password strength', async () => {
      const userData = {
        email: 'test-password@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Şifre en az 8 karakter uzunluğunda, bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
    });
    //Telefon numarasının doğruluğunu kontrol et
    it('should validate phone number format', async () => {
      const userData = {
        email: 'phoneformat@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '123' // çok kısa, geçersiz
      };

      const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Lütfen geçerli bir telefon numarası girin. Başında \'0\' olmadan 10 haneli yazınız (örnek: 5301234567).');
    });

    //Boş alanları kontrol et
    it('should return an error if required fields are empty strings', async () => {
      const userData = {
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: ''
      };

      const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Tüm alanlar (email, şifre, ad, soyad, telefon) doldurulmalıdır.'); // Mesajını backend'e göre düzenle
    });

    // Varsayılan değerleri kontrol et
    it('should assign default values to role and isActive', async () => {
      const userData = {
        email: 'defaults@example.com',
        password: 'Password123!',
        firstName: 'Default',
        lastName: 'Values',
        phone: '1234567890'
      };

      const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

      const user = await User.findOne({ email: userData.email });

      expect(user).toBeTruthy();
      expect(user?.role).toBe('user'); // varsayılan rolün 'user' olduğunu varsaydım
      expect(user?.isActive).toBe(false); // varsayılan aktiflik durumu neyse ona göre
    });
    it('should sanitize input to prevent XSS attacks', async () => {
      const userData = {
        email: 'xss@example.com',
        password: 'Password123!',
        firstName: '<script>alert("x")</script>',
        lastName: 'User',
        phone: '1234567890'
      };

      const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

      const user = await User.findOne({ email: userData.email });

      expect(user?.firstName).not.toContain('<script>');
    });

  });

  describe('POST /api/auth/verify-email', () => {
    beforeAll(async () => {
      const user = new User({
        email: 'verifyme@example.com',
        passwordHash: 'hashedpassword',
        firstName: 'Verify',
        lastName: 'User',
        role: 'user',
        phone: '5301234567',
        isActive: false,
        verificationToken: token
      });

      const savedUser = await user.save();
      userId = (savedUser._id as Types.ObjectId).toString(); // 💡 Tip sorunu çözümü
    });

    it('should verify email with valid token', async () => {
      const response = await request(app)
          .post('/api/auth/verify-email')
          .send({ token })
          .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('E-posta başarıyla doğrulandı. Artık giriş yapabilirsiniz.');

      const updatedUser = await User.findById(userId);
      expect(updatedUser?.isActive).toBe(true); // Kullanıcının aktif olduğunu kontrol et
    });

    it('should return 400 for invalid token', async () => {
      const invalidToken = 'thisisinvalid';

      const response = await request(app)
          .post('/api/auth/verify-email')
          .send({ token: invalidToken })
          .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Geçersiz veya süresi dolmuş doğrulama token\'ı.');
    });

    it('should return 400 for missing token', async () => {
      const response = await request(app)
          .post('/api/auth/verify-email')
          .send({})
          .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Doğrulama token\'ı eksik.');
    });
  });
});
