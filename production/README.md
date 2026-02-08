# FlyVixx Production Deployment Guide

## Overview
This folder contains production-ready configuration files for deploying FlyVixx to production environments.

## Files
- `.env` - Backend production environment variables (with real values)
- `.env.production` - Backend production environment variables template
- `.env.frontend` - Frontend production environment variables template
- `README.md` - This deployment guide

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy the production environment template
cp .env.production .env.production.local

# Edit with your production values
nano .env.production.local
```

### 2. Required Services Setup

#### Database (PostgreSQL)
- Create a production PostgreSQL database
- Update `DATABASE_URL` with production credentials
- Ensure the database has the required permissions

#### Descope Authentication
- Create a production project in Descope
- Update `DESCOPE_PROJECT_ID` and `DESCOPE_MANAGEMENT_KEY`

#### SafeHaven Payment Integration
- Register for SafeHaven production account
- Generate production API keys and certificates
- Update all `SAFEHAVEN_*` variables
- Configure webhook URL in SafeHaven dashboard

#### Email Service (Resend)
- Create Resend production account
- Update `RESEND_API_KEY`

### 3. Environment Variables Reference

#### Critical Production Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Strong random string for JWT signing | `openssl rand -hex 32` |
| `DESCOPE_PROJECT_ID` | Descope production project ID | `P2a3B4cD5eF6gH7iJ8kL` |
| `DESCOPE_MANAGEMENT_KEY` | Descope management key | `K2a3B4cD5eF6gH7iJ8kL...` |
| `SAFEHAVEN_CLIENT_ID` | SafeHaven production client ID | `401c00a87530b9b4dec5f02f20e7f1bf` |
| `SAFEHAVEN_PRIVATE_KEY` | SafeHaven private key (full content) | `-----BEGIN PRIVATE KEY-----\n...` |
| `SAFEHAVEN_CERTIFICATE` | SafeHaven certificate (full content) | `-----BEGIN CERTIFICATE-----\n...` |
| `RESEND_API_KEY` | Resend production API key | `re_1a2b3c4d5e6f7g8h9i0j` |

### 4. Deployment Options

#### Option A: Direct Server Deployment
```bash
# Load environment variables
export $(cat .env.production | xargs)

# Start the application
cd server
npm run build
npm start
```

#### Option B: Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["sh", "-c", "export $(cat production/.env.production | xargs) && npm start"]
```

#### Option C: Cloud Platforms
- **Heroku**: Set environment variables in dashboard
- **AWS**: Use Systems Manager Parameter Store or Secrets Manager
- **Vercel**: Use environment variables in project settings
- **Railway**: Set environment variables in service settings

### Frontend Deployment

#### For Vercel (Recommended for Next.js)
```bash
# 1. Copy frontend environment variables
cp production/.env.frontend .env.local

# 2. Deploy to Vercel
vercel --prod

# Or set variables in Vercel dashboard:
# - NEXT_PUBLIC_DESCOPE_PROJECT_ID
# - NEXT_PUBLIC_API_URL
# - NEXT_PUBLIC_SAFEHAVEN_CLIENT_ID
```

#### For Other Platforms
- Copy `production/.env.frontend` to your frontend deployment
- Rename to `.env.production` or set variables in platform dashboard
- Ensure `NEXT_PUBLIC_API_URL` points to your production backend

### 5. Security Checklist

- [ ] All placeholder values replaced with real production values
- [ ] File permissions set to 600: `chmod 600 .env.production`
- [ ] Environment file not committed to version control
- [ ] JWT secret is strong and unique
- [ ] Database credentials are for production database only
- [ ] SafeHaven keys are production keys (not sandbox)
- [ ] Webhook URLs point to production domain
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting configured appropriately

### 6. Monitoring & Maintenance

#### Health Checks
- Application health endpoint: `GET /api/health`
- Database connectivity monitoring
- SafeHaven API connectivity checks

#### Logs
- Set `LOG_LEVEL=info` for production
- Configure log aggregation (CloudWatch, DataDog, etc.)
- Monitor for authentication failures
- Track SafeHaven API errors

#### Backups
- Database backups scheduled daily
- Environment file backups (encrypted)
- Application logs retention policy

### 7. Troubleshooting

#### Common Issues
1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify database credentials
   - Ensure database is accessible from server

2. **SafeHaven API Errors**
   - Verify production keys are correct
   - Check `SAFEHAVEN_BASE_URL` is production endpoint
   - Confirm webhook URL is accessible

3. **Authentication Issues**
   - Verify Descope production project settings
   - Check JWT secret consistency
   - Confirm CORS settings for production domain

### 8. Rollback Plan

- Keep previous environment file backup
- Have database backup ready
- Test rollback procedure before deployment
- Monitor application for 24 hours post-deployment

## 📞 Support

If you encounter issues during production deployment:

1. Check application logs for error messages
2. Verify all environment variables are set correctly
3. Test individual service connections
4. Review this guide for missing configuration

## 🔒 Security Notes

- Never commit `.env.production` with real values
- Rotate secrets regularly (every 90 days)
- Use principle of least privilege for all services
- Enable 2FA on all production accounts
- Monitor for unusual activity patterns

---

**Last Updated:** February 2026
**Version:** 1.0.0