export  const isStrongPassword = (password: string): boolean => {
    // En az bir büyük harf, bir küçük harf, bir rakam ve en az 8 karakter uzunluk
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};
