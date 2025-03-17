export function isZestyEmail(email: string): boolean {
  return (
    email.endsWith("@zesty.io") ||
    email.endsWith("@kin.com") ||
    email.endsWith("@geo-blue.com")
  );
}
