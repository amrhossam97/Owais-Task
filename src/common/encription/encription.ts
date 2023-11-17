import { createCipheriv } from "crypto";

export const Encript = (text , password , iv)=>{
    const cipher = createCipheriv('aes-256-cbc', password, iv);
    let encryptedText = cipher.update(text,'utf-8', 'hex');
    encryptedText += cipher.final('hex')
    return encryptedText
}