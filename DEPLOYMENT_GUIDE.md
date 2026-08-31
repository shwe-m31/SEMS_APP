# SEMS Deployment Guide

This guide provides step-by-step instructions for deploying the SEMS (Smart Enterprise Management System) project to Aiven (database) and Render (hosting).

## Prerequisites

- Aiven account with MySQL database service
- Render account
- Git repository (GitHub, GitLab, or Bitbucket)
- Basic knowledge of command line tools

## Project Structure

```
SEMS_APP/
├── backend/          # Spring Boot Java backend
├── frontend/         # React frontend
├── database/         # SQL scripts (if any)
└── render.yaml       # Render deployment configuration
```

## Step 1: Aiven Database Configuration

Your Aiven MySQL database is already configured with the following credentials:

- **Database Name**: SEMS_APP_DATABASE
- **Host**: mysql-2d367cc8-shwetham3101-project.a.aivencloud.com
- **Port**: 15508
- **User**: avnadmin
- **Password**: [Set as environment variable DATABASE_PASSWORD]
- **SSL Mode**: REQUIRED

### SSL Certificate Setup

1. Download the CA certificate from Aiven dashboard
2. Place the certificate in a secure location
3. The SSL connection is configured in the application.properties

## Step 2: Backend Deployment (Render)

### 2.1 Prepare Backend Code

The backend is already configured with:
- Updated `application.properties` with environment variables
- `Dockerfile` for Docker-based deployment (required for Render)
- `render.yaml` configuration

**Note**: Render doesn't support native Java runtime, so we use Docker for Spring Boot deployment.

### 2.2 Deploy to Render

**Option A: Using Render Blueprint (Recommended)**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository: `shwe-m31/SEMS_APP`
4. Keep the default settings:
   - **Branch**: main
   - **Blueprint Path**: render.yaml
5. Click "Apply Blueprint"

**Important: Manual Setup Required After Blueprint Deployment**

After the Blueprint creates the services, you MUST manually set the database password:

1. Go to your `sems-backend` service in Render Dashboard
2. Navigate to "Environment" section
3. Add the `DATABASE_PASSWORD` environment variable:
   ```
   DATABASE_PASSWORD: [your-aiven-database-password]
   ```
4. Click "Save Changes"
5. Render will automatically redeploy the backend service

**Option B: Using Render Dashboard (Manual Deployment)**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" button
3. Select "Web Service"
4. Connect your Git repository
5. Configure the service:
   - **Name**: sems-backend
   - **Environment**: Docker
   - **Docker Context**: ./backend
   - **Dockerfile Path**: ./backend/Dockerfile
   - **Plan**: Select appropriate plan (Render no longer offers free plans for web services)

6. Add Environment Variables:
   ```
   PORT: 8080
   DATABASE_URL: jdbc:mysql://mysql-2d367cc8-shwetham3101-project.a.aivencloud.com:15508/SEMS_APP_DATABASE?useSSL=true&requireSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
   DATABASE_USERNAME: avnadmin
   DATABASE_PASSWORD: [your-aiven-database-password]
   JWT_SECRET: [generate a secure 64-character secret]
   CORS_ALLOWED_ORIGINS: https://sems-frontend.onrender.com,https://sems-frontend.onrender.com/
   ```

7. Click "Create Web Service"

**Option B: Using Render Blueprint (Automated)**

1. Push your code to Git repository
2. Go to Render Dashboard
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect `render.yaml` and deploy both services

### 2.3 Update Backend CORS Configuration

After backend deployment, update CORS settings to allow frontend access:

1. Go to your `sems-backend` service in Render Dashboard
2. Navigate to "Environment" section
3. Update `CORS_ALLOWED_ORIGINS`:
   ```
   CORS_ALLOWED_ORIGINS: https://sems-frontend.onrender.com
   ```
4. Click "Save Changes"
5. Render will automatically redeploy the backend service

### 2.4 Set Database Password (Required)

You MUST set the database password manually for the backend to connect:

1. Go to Render Dashboard → sems-backend service
2. Click on "Environment" tab
3. Click "Add Environment Variable"
4. Add:
   - **Key**: `DATABASE_PASSWORD`
   - **Value**: [your-aiven-database-password]
5. Click "Save Changes"
6. Render will automatically redeploy the backend service

### 2.5 Verify Backend Deployment

- Check the Render dashboard for deployment status
- Once deployed, you'll get a URL like: `https://sems-backend.onrender.com`
- Test the API: `https://sems-backend.onrender.com/api/auth/login`

## Step 4: Frontend Deployment (Render)

### 4.1 Prepare Frontend Code

The frontend is now configured with:
- Dockerfile for Docker-based deployment (required for Render)
- nginx configuration for serving React app
- Environment variable support for API URL

### 4.2 Deploy to Render

**Option A: Using Render Dashboard (Recommended)**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" button
3. Select "Web Service"
4. Connect your Git repository
5. Configure the service:
   - **Name**: sems-frontend
   - **Environment**: Docker
   - **Docker Context**: ./frontend
   - **Dockerfile Path**: ./frontend/Dockerfile
   - **Region**: Same region as backend (Oregon)
   - **Plan**: Free (with sleep time)

6. Add Environment Variables:
   ```
   REACT_APP_API_URL: https://sems-app-0y62.onrender.com/api
   ```

7. Click "Create Web Service"

### 3.1 Prepare Frontend Code

The frontend is already configured with:
- Production environment variables in `.env.production`
- Updated API service to use environment variables
- `render.yaml` configuration

### 3.3 Deploy to Render

**Option A: Using Render Dashboard**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" button
3. Select "Web Service"
4. Connect your Git repository
5. Configure the service:
   - **Name**: sems-frontend
   - **Environment**: Static Site
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Free

6. Add Environment Variables:
   ```
   REACT_APP_API_URL: https://sems-backend.onrender.com
   ```

7. Click "Create Web Service"

**Option B: Using Render Blueprint**

If using the blueprint approach, the frontend will be deployed automatically along with the backend.

### 3.4 Verify Frontend Deployment

- Check the Render dashboard for deployment status
- Once deployed, you'll get a URL like: `https://sems-frontend.onrender.com`
- Visit the URL to verify the landing page loads correctly

## Step 5: Post-Deployment Configuration

### 4.1 Update CORS Settings

After both services are deployed, update the backend CORS settings to include the actual frontend URL:

1. Go to Render Dashboard → sems-backend
2. Environment Variables
3. Update `CORS_ALLOWED_ORIGINS` to include your actual frontend URL
4. Redeploy the backend service

### 4.2 Test the Application

1. Visit the frontend URL
2. Try to register a new user
3. Login with the registered user
4. Navigate through the dashboard
5. Test various functionalities

## Step 6: Database Migration (Optional)

If you have existing SQL scripts to run:

1. Connect to your Aiven database using MySQL client:
   ```bash
   mysql -h mysql-2d367cc8-shwetham3101-project.a.aivencloud.com -P 15508 -u avnadmin -p SEMS_APP_DATABASE
   ```

2. Run your SQL scripts:
   ```bash
   source your_script.sql
   ```

The Spring Boot application is configured with `spring.jpa.hibernate.ddl-auto=update`, so it will automatically create/update the database schema based on your JPA entities.

## Step 7: Troubleshooting

### Common Issues

**1. Database Connection Issues**
- Verify Aiven database is running
- Check SSL certificate is valid
- Ensure database credentials are correct
- Check Render logs for connection errors

**2. CORS Errors**
- Verify CORS_ALLOWED_ORIGINS includes your frontend URL
- Check that the frontend URL is correct (no trailing slashes)
- Ensure backend is deployed and accessible

**3. Build Failures**
- Check Maven/Node.js versions in Render
- Review build logs in Render dashboard
- Ensure all dependencies are properly declared

**4. JWT Authentication Issues**
- Verify JWT_SECRET is set correctly
- Check token expiration time
- Ensure tokens are being sent in Authorization header

### Monitoring

- **Render Dashboard**: Monitor service health, logs, and metrics
- **Aiven Dashboard**: Monitor database performance, connections, and queries
- **Application Logs**: Check both backend and frontend logs for errors

## Step 8: Security Considerations

1. **Never commit sensitive data** to Git (passwords, API keys)
2. **Use environment variables** for all configuration
3. **Enable HTTPS** (Render provides this automatically)
4. **Keep dependencies updated** regularly
5. **Monitor database access** and set up alerts
6. **Implement rate limiting** on API endpoints
7. **Regular backups** of the database (Aiven provides this)

## Step 9: Scaling

### Backend Scaling

- Upgrade Render plan for better performance
- Add more instances for horizontal scaling
- Implement caching for frequently accessed data
- Optimize database queries

### Frontend Scaling

- Use CDN for static assets
- Implement lazy loading
- Optimize bundle size
- Enable compression

## Step 10: Maintenance

- **Regular updates**: Keep dependencies updated
- **Monitor logs**: Check for errors and performance issues
- **Database maintenance**: Regular backups and index optimization
- **Security patches**: Apply security updates promptly

## Support

For issues related to:
- **Render**: [Render Support](https://render.com/support)
- **Aiven**: [Aiven Support](https://aiven.com/support)
- **Application**: Check application logs and documentation

## Cost Estimate

**Important Note**: Render no longer offers free plans for web services. You will need to select a paid plan for deployment.

**Render Pricing** (current as of 2026):
- **Backend (Docker)**: Starting at ~$7/month for basic configuration
- **Frontend (Static)**: Starting at ~$7/month for basic configuration
- **Total**: ~$14/month minimum

**Plan Recommendations**:
- **Starter Plan**: Good for development and small projects
- **Standard Plan**: Better performance for production use
- **Pro Plan**: For high-traffic applications

**Aiven**: Depends on your chosen plan (consult Aiven pricing for database costs)

**Aiven**: Depends on your plan (consult Aiven pricing)

## Step 11: Next Steps

1. Deploy using the instructions above
2. Set the DATABASE_PASSWORD environment variable in Render
3. Test all functionalities thoroughly
4. Set up monitoring and alerts
5. Configure custom domain (optional)
6. Set up CI/CD pipeline (optional)
7. Document any custom configurations

---

**Note**: This deployment guide assumes you have the necessary accounts and permissions. Adjust the configurations based on your specific requirements and environment.