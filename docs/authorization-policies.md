# 👮 Authorization Policies (CASL)

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![CASL](https://img.shields.io/badge/CASL-Authorization-orange)](https://casl.js.org/)

Beyond simple RBAC (Role-Based Access Control), NexusAPI implements **ABAC (Attribute-Based Access Control)** using CASL for granular permissions.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Concepts](#-concepts)
- [Verified Implementation](#-verified-implementation)
- [Usage](#-usage)

---

## 🏗 Overview

While `RoleGuard` ("Admins can access this route") is useful, it's often insufficient for complex business logic. CASL allows defining rules based on attributes (e.g., "User can edit OWN profile").

---

## 🧩 Concepts

- **User:** The actor performing the action.
- **Action:** `manage`, `create`, `read`, `update`, `delete`.
- **Subject:** The entity being acted upon (e.g., `User`, `Article`).

---

## 🛠 Verified Implementation

**File:** `src/modules/auth/ability.factory.ts`

The factory defines permissions based on the user's role.

### Defined Abilities

1.  **ADMIN Role:**
    *   **Action:** `manage` (Create, Read, Update, Delete)
    *   **Subject:** `all` (Everything)
    *   **Logic:** Complete system access.

2.  **USER Role:**
    *   **Action:** `read` (Can view public resources)
    *   **Action:** `update` (Can update own profile - *Note: Ownership checks are currently handled by `OwnershipGuard` separately*)

```typescript
defineAbilities(user: User) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (user.role === Role.ADMIN) {
    can(Action.Manage, 'all'); // Superuser
  } else {
    can(Action.Read, 'all');
    can(Action.Update, User, { id: user.id }); // Logic intended for self-update
  }

  return build();
}
```

---

## 💻 Usage

Decorate your route with `@CheckPolicies`.

```typescript
// Example: Only allow reading Articles if the user has permission
@Get()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@CheckPolicies((ability) => ability.can(Action.Read, 'Article'))
findAll() {
  return this.service.findAll();
}
```

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
