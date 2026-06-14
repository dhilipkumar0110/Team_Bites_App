using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace TeamBites.Infrastructure.Helper
{
    public class EncryptDecryptor
    {
        private byte[] BaseSalt = new byte[] { 158, 56, 196, 68, 115, 105, 88, 127, 64, 119, 77, 64, 92, 82, 65, 84, 95, 68, 92, 110, 59, 88, 111 };


        public string EncryptPlainTextToCipherText(string value, string key, string salt)
        {
            if (string.IsNullOrEmpty(value))
                //throw new ArgumentNullException("value");
                return value;
            if (string.IsNullOrEmpty(key))
                throw new ArgumentNullException("key");

            byte[] KeyBytes = Encoding.ASCII.GetBytes(key);
            byte[] ValueBytes = Encoding.ASCII.GetBytes(value);
            byte[] SaltBytes;
            if (string.IsNullOrEmpty(salt))
                SaltBytes = BaseSalt;
            else
                SaltBytes = Encoding.ASCII.GetBytes(salt);

            byte[] encrypted;

            PasswordDeriveBytes SecretKey = new PasswordDeriveBytes(KeyBytes, SaltBytes);

            // Create an RijndaelManaged object with the specified key and IV.
            using (RijndaelManaged rijAlg = new RijndaelManaged())
            {
                rijAlg.Key = SecretKey.GetBytes(32);
                rijAlg.IV = SecretKey.GetBytes(16);

                // Create a decrytor to perform the stream transform.
                ICryptoTransform encryptor = rijAlg.CreateEncryptor(rijAlg.Key, rijAlg.IV);

                // Create the streams used for encryption.
                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {
                            //Write all data to the stream.
                            swEncrypt.Write(value);
                        }
                        encrypted = msEncrypt.ToArray();
                    }
                }
            }

            // Return the encrypted bytes from the memory stream.
            return Convert.ToBase64String(encrypted);
        }


        public string DecryptCipherTextToPlainText(string value, string key, string salt)
        {
            // Check arguments.
            if (string.IsNullOrEmpty(value))
                //throw new ArgumentNullException("value");
                return value;
            if (string.IsNullOrEmpty(key))
                throw new ArgumentNullException("key");

            byte[] KeyBytes = Encoding.ASCII.GetBytes(key);
            byte[] ValueBytes = Convert.FromBase64String(value);
            byte[] SaltBytes;
            if (string.IsNullOrEmpty(salt))
                SaltBytes = BaseSalt;
            else
                SaltBytes = Encoding.ASCII.GetBytes(salt);

            string plaintext = null;

            PasswordDeriveBytes SecretKey = new PasswordDeriveBytes(KeyBytes, SaltBytes);

            // Create an RijndaelManaged objectwith the specified key and IV.
            using (RijndaelManaged rijAlg = new RijndaelManaged())
            {
                rijAlg.Key = SecretKey.GetBytes(32);
                rijAlg.IV = SecretKey.GetBytes(16);

                // Create a decrytor to perform the stream transform.
                ICryptoTransform decryptor = rijAlg.CreateDecryptor(rijAlg.Key, rijAlg.IV);

                // Create the streams used for decryption.
                using (MemoryStream msDecrypt = new MemoryStream(ValueBytes))
                {
                    using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                        {
                            // Read the decrypted bytes from the decrypting stream
                            // and place them in a string.
                            plaintext = srDecrypt.ReadToEnd();
                        }
                    }
                }
            }
            return plaintext;
        }

        public string DecryptPassword(string password) //Decrypts password when clicking on connection dataGridView in UI
        {
            return DecryptCipherTextToPlainText(password, "ComplexKeyHere_12121", null);
        }
    }
}
