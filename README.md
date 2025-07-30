# golf-score-tracking-

---

- Generate JWT_SECRET

  ```js
    node
    require('crypto').randomBytes(64).toString('hex')
  ```