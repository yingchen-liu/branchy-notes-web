interface User {
  "user_id": string,
  "email": string,
  "name"?: string,
  "given_name"?: string,
  "family_name"?: string,
  "nickname"?: string,
  "picture"?: string
}

interface CurrentUser {
  "sub": string,
  "email": string,
  "name"?: string,
  "given_name"?: string,
  "family_name"?: string,
  "nickname"?: string,
  "picture"?: string
  "email_verified": string
}