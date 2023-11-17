import { createDecipheriv } from "crypto";

export const Decription = (encryptedText,password,iv)=>{
    const decipher = createDecipheriv('aes-256-cbc', password, iv);
    let decryptedText = decipher.update(encryptedText,'hex' , 'utf-8');
    decryptedText += decipher.final('utf-8')
    
    return decryptedText;
}