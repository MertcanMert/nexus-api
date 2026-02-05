# ☁️ Storage System (AWS S3)

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![AWS SDK v3](https://img.shields.io/badge/AWS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/s3)

The Storage System abstracts file uploads to AWS S3 (or S3-compatible services like MinIO, DigitalOcean Spaces).

---

## 📋 Table of Contents

- [Configuration](#-configuration)
- [Implementation](#-implementation)
- [Usage (Service)](#-usage-service)
- [Public Access](#-public-access)

---

## ⚙️ Configuration

**Environment Variables:**
`ConfigService` validates the following keys:

```env
S3_REGION=eu-central-1
S3_BUCKET=my-bucket
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_ENDPOINT=https://minio.example.com # Optional (for custom providers)
S3_PUBLIC_URL=https://cdn.example.com # Optional (for CDN)
```

---

## 🛠 Implementation

**File:** `src/infrastructure/storage/storage.service.ts`

The service uses **AWS SDK v3** (`@aws-sdk/client-s3`). It generates unique filenames using UUIDs to prevent collisions.

### Key Logic
1.  **UUID:** `uuidv4()` used for filename generation.
2.  **Public Access:** Sets `ACL: 'public-read'` on upload.
3.  **URL Strategy:** Prefers `S3_PUBLIC_URL` (CDN) if set, otherwise constructs standard S3 URL.

---

## 💻 Usage (Service)

Inject `StorageService` to upload files programmatically.

### Upload File (`uploadFile`)
```typescript
/**
 * Uploads a file to the configured S3 storage.
 * @param file Express.Multer.File object (from interceptor)
 * @param folder Destination folder (default: 'general')
 * @returns Full public URL (string)
 */
async uploadFile(file: Express.Multer.File, folder: string = 'avatars'): Promise<string>
```

**Example:**
```typescript
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async upload(@UploadedFile() file: Express.Multer.File) {
  const url = await this.storageService.uploadFile(file, 'users');
  return { url };
}
```

### Delete File (`deleteFile`)
```typescript
/**
 * Deletes a file from S3 using its URL.
 * It parses the key from the URL automatically.
 */
async deleteFile(url: string): Promise<void>
```

---

## 🕸 Public Access

By default, uploaded files are publicly readable (`public-read`).
To secure them (Private ACL), modify the `PutObjectCommand` in `storage.service.ts`.

---

<div align="center">
  <sub>Built with ❤️ using NestJS & Senior Engineering Standards</sub>
</div>
