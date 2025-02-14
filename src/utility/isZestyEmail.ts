import { MD5 } from "./md5";

export function isZestyEmail(email: string): boolean {
  const hashedWhitelistedEmails = [
    "f6b705ad0f149b40abe7ab939d6f2cc4",
    "91de2eca00c7588dbd5b477751a68e39",
  ];

  return (
    email.endsWith("@zesty.io") || hashedWhitelistedEmails.includes(MD5(email))
  );
}
