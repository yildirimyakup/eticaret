

export function generateToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
}