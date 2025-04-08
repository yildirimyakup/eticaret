// @ts-ignore
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import connectDB from '../src/config/database';

describe('Root Endpoint Test', () => {
    // Test başlamadan önce veritabanına bağlan
    beforeAll(async () => {
        await connectDB();
    });

    // Test bittikten sonra veritabanı bağlantısını kapat
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // Ana endpoint testi
    describe('GET /', () => {
        it('should return 200 status and "Hello, TypeScript!" message', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);
            
            expect(response.text).toBe('Hello, TypeScript!');
        });
    });
});
