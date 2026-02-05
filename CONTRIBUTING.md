# 🤝 Contribution Guidelines

We welcome contributions! Whether you're fixing a bug, adding a feature, or improving documentation, your help is appreciated.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [How to Contribute](#-how-to-contribute)
- [Code Style](#-code-style)
- [Design Principles](#-design-principles)

---

## 📜 Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all. Please be respectful and considerate in your communication.

---

## 🚀 How to Contribute

1.  **Fork & Clone:** Fork the repo to your own account.
2.  **Branch:** Create a branch for your feature (`feat/my-feature`).
3.  **Code:** Implement your changes.
4.  **Test:** Ensure `npm run test` passes. Add new tests if needed.
5.  **Commit:** Use [Conventional Commits](https://www.conventionalcommits.org/).
    - `feat: add new login provider`
    - `fix: resolve user deletion bug`
6.  **Pull Request:** Push your branch and open a PR against `main`.

---

## 🎨 Code Style

We use **Prettier** and **ESLint**.

- **DON'T** argue about semicolon placement. Let Prettier handle it.
- **DO** run `npm run format` before committing.

---

## 🧠 Design Principles

1.  **Explicit > Implicit:** If you do magic, document it.
2.  **Dependency Injection:** Always use DI, never manual instantiation (`new Service()`).
3.  **Typos:** Fix them if you see them.
4.  **Environment:** Never hardcode secrets. Use `ConfigService`.

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
