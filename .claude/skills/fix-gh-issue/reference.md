# Instances API - Postman Collection Reference

**API:** Zesty.io Instances REST API
**Version:** v1
**Base URL:** `https://{instance_zuid}.api.zesty.io/v1/`
**Total Endpoints:** 40+ across 6 categories

---

## Overview

Complete REST API for managing Content.one (Zesty.io) instance resources. All resources use **ZUID** (Zesty Unique Identifier) with type prefixes:

- `5-`: User
- `6-`: Content Model
- `7-`: Content Item
- `8-`: Instance
- `17-`: Link
- `18-`: Publishing

See: [ZUID Specification](https://github.com/zesty-io/zuid-specification)

---

## Endpoints by Category

### 1. Content Management (`/content`) — 12 Endpoints

**Core content CRUD, publishing, and linking**

| Method   | Endpoint                                            | Purpose                                |
| -------- | --------------------------------------------------- | -------------------------------------- |
| POST/GET | `/content/links`                                    | Create/list internal or external links |
| POST/GET | `/content/models`                                   | Manage content model definitions       |
| POST/GET | `/content/models/{id}/fields`                       | Model field schema management          |
| POST/GET | `/content/models/{id}/items`                        | Create/list items within a model       |
| POST     | `/content/models/{id}/items/batch`                  | Bulk create/update items               |
| GET      | `/content/models/{id}/items/{id}/versions`          | View item version history              |
| POST/GET | `/content/models/{id}/items/{id}/publishings`       | Manage item publishings                |
| POST     | `/content/models/{id}/items/{id}/publishings/batch` | Bulk publish items                     |
| GET/POST | `/content/items/publishings`                        | Cross-model publishing list            |
| GET      | `/content/models/{id}/parsley-items`                | Rendered item data (Parsley templates) |
| GET      | `/content/publish-all`                              | Publish all instance content           |
| GET      | `/content/models/{id}/publish-all`                  | Publish all items in a model           |

**Key Features:**

- Atomic item versioning with publish tracking
- Batch operations for performance
- Internal/external link management
- Parsley template rendering integration

---

### 2. Web Assets (`/web`) — 11 Endpoints

**Manage templates, styles, scripts, headers, and redirects**

| Method   | Endpoint                                | Purpose                       |
| -------- | --------------------------------------- | ----------------------------- |
| POST/GET | `/web/views`                            | HTML template views           |
| POST/GET | `/web/redirects`                        | URL redirect rules            |
| GET      | `/web/views/{id}/versions`              | View version history          |
| POST/GET | `/web/stylesheets`                      | CSS stylesheet management     |
| POST/GET | `/web/stylesheets/variables`            | CSS custom properties (vars)  |
| GET      | `/web/stylesheets/variables/categories` | Organize stylesheet variables |
| GET      | `/web/stylesheets/{id}/versions`        | Stylesheet versions           |
| POST/GET | `/web/scripts`                          | JavaScript asset management   |
| GET      | `/web/scripts/{id}/versions`            | Script version history        |
| POST/GET | `/web/headers`                          | HTTP header injection         |
| POST/GET | `/web/headtags`                         | HTML head tag injection       |

**Key Features:**

- Full versioning on templates and assets
- CSS variable organization by category
- Script and stylesheet versioning
- Header and meta tag injection

---

### 3. Environment Settings (`/env`) — 5 Endpoints

**Instance configuration and metadata**

| Method    | Endpoint        | Purpose                      |
| --------- | --------------- | ---------------------------- |
| GET/PATCH | `/env/settings` | Instance-level configuration |
| GET/POST  | `/env/nav`      | Navigation menu structure    |
| GET       | `/env/audits`   | Activity audit trail         |
| GET/POST  | `/env/leads`    | Lead/form submission capture |
| GET/POST  | `/env/langs`    | Language/localization setup  |

**Key Features:**

- Instance settings and metadata
- Navigation menu CRUD
- Audit logging and history
- Multi-language support configuration

---

### 4. Release Management (`/releases`) — 6 Endpoints + 5 Member Sub-endpoints

**Staged content release workflows**

| Method | Endpoint                  | Purpose                           |
| ------ | ------------------------- | --------------------------------- |
| POST   | `/releases/{id}/activate` | Activate a release                |
| POST   | `/releases`               | Create new release                |
| GET    | `/releases`               | List all releases                 |
| GET    | `/releases/{id}`          | Get release details               |
| PUT    | `/releases/{id}`          | Update release (name/description) |
| DELETE | `/releases/{id}`          | Delete release                    |

**Release Members** — Add/manage items in a release:

| Method | Endpoint                      | Purpose               |
| ------ | ----------------------------- | --------------------- |
| POST   | `/releases/{id}/members`      | Add item to release   |
| GET    | `/releases/{id}/members`      | List release members  |
| GET    | `/releases/{id}/members/{id}` | Get member details    |
| PUT    | `/releases/{id}/members/{id}` | Update member version |
| DELETE | `/releases/{id}/members/{id}` | Remove from release   |

**Key Features:**

- Staged release preparation
- Bulk item staging per release
- Version pinning per release member
- Activation for go-live

---

### 5. Search (`/search`) — 1 Endpoint

**Full-text content discovery**

| Method | Endpoint  | Purpose                         |
| ------ | --------- | ------------------------------- |
| GET    | `/search` | Full-text search across content |

**Query Parameters:**

- `q`: Search query (ZUID, metadata, path)
- `limit`, `offset`: Pagination
- `type`: Filter by resource type

---

## Authentication

**Header-based Bearer Token:**

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Token Types:**

- **Session Token**: Browser-based cookie authentication
- **Access Token**: OAuth/API token for programmatic access

See: [Auth API](https://zesty.org/apis/auth-api#user-authentication)

---

## Standard Response Format

```json
{
  "_meta": {
    "timestamp": "2023-02-20T18:05:21.395209839Z",
    "totalResults": 1,
    "start": 0,
    "offset": 0,
    "limit": 1
  },
  "data": {
    "ZUID": "7-xxx",
    "field1": "value",
    "field2": "value"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | OK (GET/PATCH success)                  |
| 201  | Created (POST success)                  |
| 204  | No Content (DELETE success)             |
| 400  | Bad Request (invalid params)            |
| 401  | Unauthorized (missing/invalid token)    |
| 404  | Not Found (resource doesn't exist)      |
| 409  | Conflict (version collision, duplicate) |
| 429  | Rate Limited (too many requests)        |

---

## Common Patterns

### Link Creation

```json
{
  "type": "internal|external",
  "parentZUID": "7-xxx",
  "label": "Link Name",
  "metaTitle": "Meta Title",
  "target": "7-xxx (internal) or https://url (external)",
  "source": "rel:true;target:_blank (optional)"
}
```

### Item Publishing

- **Single:** `POST /content/models/{modelZUID}/items/{itemZUID}/publishings`
- **Batch:** `POST /content/models/{modelZUID}/items/publishings/batch`
- Auto-generates publishing records with timestamps

### Release Workflow

1. `POST /releases` → Create release
2. `POST /releases/{releaseZUID}/members` → Add items (specify version)
3. `POST /releases/{releaseZUID}/activate` → Go live

### Batch Operations

- `/items/batch` — Bulk item CRUD
- `/publishings/batch` — Bulk publishing

---

## Performance Tips

- Use batch endpoints for bulk operations (10x faster)
- Monitor `Instances-Api-Cache` response header
- Leverage pagination (`limit`, `offset`)
- Release workflows vs. individual publishes for large updates
- Check rate limit status via HTTP 429

---

## Quick Reference URLs

**Postman Variables (from collection):**

- `{{protocol}}` → `https`
- `{{instance_zuid}}` → Your instance ZUID
- `{{instances_api_url}}` → `api.zesty.io`
- `{{instances_api_version}}` → `v1`

**Stages:**

- Production: `api.zesty.io`
- Staging: `api.stage.zesty.io`

---

## Related Resources

- **ZUID Specification**: https://github.com/zesty-io/zuid-specification
- **Auth API**: https://zesty.org/apis/auth-api
- **Content.one Docs**: https://zesty.org/
