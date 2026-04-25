# GitHub Repository Setup Guide

## 📝 Complete Setup Instructions

This guide will help you set up the Klipit Pro project on GitHub with automatic CI/CD deployment.

---

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface

1. Go to https://github.com/new
2. Fill in the repository details:
   - **Repository name**: `klipit-pro`
   - **Description**: "Klipit Pro - Online Clipboard Service with File Sharing"
   - **Public/Private**: Public (or Private if you prefer)
   - **Initialize**: DO NOT initialize with README (we already have one)
3. Click "Create Repository"

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate
gh auth login

# Create repository
gh repo create klipit-pro \
  --public \
  --description "Klipit Pro - Online Clipboard Service with File Sharing" \
  --source=/home/ubuntu/klipit-pro \
  --push \
  --remote=origin
```

---

## Step 2: Configure Local Git Remote

If you created the repository via web interface:

```bash
cd /home/ubuntu/klipit-pro

# Rename default branch to 'main'
git branch -M main

# Add remote (replace 'yourusername' with your GitHub username)
git remote add origin https://github.com/yourusername/klipit-pro.git

# Push code to GitHub
git push -u origin main
```

Verify the remote:
```bash
git remote -v
# Should show:
# origin  https://github.com/yourusername/klipit-pro.git (fetch)
# origin  https://github.com/yourusername/klipit-pro.git (push)
```

---

## Step 3: Generate SSH Key (Optional but Recommended)

For secure communication with GitHub without password:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# When prompted, press Enter to save to default location
# Create a passphrase (optional but recommended)

# Display the public key
cat ~/.ssh/id_ed25519.pub
```

Add to GitHub:
1. Go to https://github.com/settings/keys
2. Click "New SSH key"
3. Paste the output from the command above
4. Click "Add SSH key"

Update your remote to use SSH:
```bash
cd /home/ubuntu/klipit-pro
git remote set-url origin git@github.com:yourusername/klipit-pro.git
```

---

## Step 4: Set Up Branch Protection Rules

1. Go to your repository: `https://github.com/yourusername/klipit-pro`
2. Go to **Settings** → **Branches**
3. Click "Add Rule" for branch protection
4. Branch name pattern: `main`
5. Enable:
   - ✓ Require pull request reviews before merging
   - ✓ Require status checks to pass before merging
   - ✓ Require code reviews reviews
   - ✓ Require branches to be up to date before merging

---

## Step 5: Create GitHub Secrets for CI/CD

For automatic deployment, GitHub Actions needs credentials:

### Local Setup

```bash
# Generate strong JWT secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate SSH key for server access (if not already done)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions -N ""
```

### Add GitHub Secrets

1. Go to your repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"

Add these secrets:

| Secret Name | Value | How to Get |
|------------|-------|-----------|
| `SERVER_IP` | Your Oracle Cloud server IP | `ping your-server` or check Cloud console |
| `SERVER_USER` | `ubuntu` | Default for Ubuntu instances |
| `SERVER_SSH_KEY` | Private SSH key content | `cat ~/.ssh/github-actions` |
| `DOCKER_USERNAME` | Your Docker Hub username | https://hub.docker.com/account |
| `DOCKER_PASSWORD` | Docker Hub access token | https://hub.docker.com/settings/security |
| `PROD_DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/klipit` |

**Example of adding a secret:**

```bash
# Copy SSH private key
cat ~/.ssh/github-actions | pbcopy  # macOS
cat ~/.ssh/github-actions | xclip   # Linux

# Then paste into GitHub UI
```

---

## Step 6: Set Up SSH Access for Server Deployment

```bash
# On your local machine
cd ~/.ssh

# Copy the SSH public key for GitHub Actions
cat github-actions.pub

# SSH into your Oracle Cloud server
ssh ubuntu@your-server-ip

# Add the public key to authorized_keys
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Exit server
exit
```

---

## Step 7: Configure Deployment Target

### On Your Oracle Cloud Server

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Create application directory
sudo mkdir -p /opt/klipit-pro
sudo chown ubuntu:ubuntu /opt/klipit-pro

# Create SSH directory for GitHub Actions deploy key
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add GitHub Actions public key
# (This should already be in authorized_keys from Step 6)

# Test SSH connection from your local machine
ssh -i ~/.ssh/github-actions ubuntu@your-server-ip "echo Connected"
```

---

## Step 8: Enable GitHub Actions

1. Go to your repository
2. Click the **"Actions"** tab
3. You should see the workflow files we created
4. Click "I understand my workflows, go ahead and enable them"

---

## Step 9: Test the CI/CD Pipeline

### Create a feature branch and test:

```bash
cd /home/ubuntu/klipit-pro

# Create a test branch
git checkout -b feature/test-ci

# Make a small change (e.g., update README)
echo "## CI/CD Test" >> README.md

# Commit and push
git add .
git commit -m "test: verify CI/CD pipeline"
git push origin feature/test-ci
```

### Monitor the workflow:

1. Go to your repository
2. Click **"Actions"** tab
3. You should see your workflow running
4. Click on the workflow to see details
5. Wait for tests to complete

### Create a Pull Request:

1. Go back to your repository
2. GitHub should show a "Compare & pull request" button
3. Click it
4. Fill in PR details
5. Submit the PR

The workflow will run automated tests. If all pass, you can merge!

---

## Step 10: Verify Deployment Workflow

The deployment workflow (deploy.yml) will:

1. **Trigger**: When code is pushed to `main` branch
2. **Steps**:
   - SSH into your server
   - Pull latest code
   - Stop current containers
   - Build new containers
   - Run database migrations
   - Start new containers

### Monitor deployment:

1. Go to **Actions** tab
2. Click on the "Deploy" workflow
3. See real-time logs

---

## 📋 Daily Development Workflow

### Making changes:

```bash
cd /home/ubuntu/klipit-pro

# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Run tests locally
npm test

# Commit with clear messages
git add .
git commit -m "feat: describe your feature"

# Push to GitHub
git push origin feature/your-feature

# Create Pull Request on GitHub

# Wait for CI tests to pass

# Merge after approval
```

---

## 🚨 Troubleshooting

### SSH Connection Fails

```bash
# Test SSH connection
ssh -i ~/.ssh/github-actions ubuntu@your-server-ip

# If fails, check:
# 1. Public key is in ~/.ssh/authorized_keys on server
# 2. File permissions: chmod 600 ~/.ssh/authorized_keys
# 3. Server Security Group allows port 22 (SSH)
```

### Workflow Fails

1. Check **Actions** → Failed Workflow
2. Click "Run" to see logs
3. Common issues:
   - Database connection: Check `PROD_DATABASE_URL` secret
   - SSH key: Verify `SERVER_SSH_KEY` secret
   - Docker credentials: Check `DOCKER_USERNAME` and `DOCKER_PASSWORD`

### Git Push Fails

```bash
# Pull latest changes first
git pull origin main

# Fix any conflicts
# Then push
git push origin your-branch
```

---

## 🔄 GitHub Best Practices

1. **Use Descriptive Branch Names**
   ```bash
   ✓ feature/add-2fa
   ✓ fix/clipboard-expiry-bug
   ✗ feature1
   ✗ update
   ```

2. **Write Good Commit Messages**
   ```
   ✓ feat(auth): add two-factor authentication
   ✗ "update code"
   ✗ "fix stuff"
   ```

3. **Review Code Before Merging**
   - Don't merge your own PRs
   - Request reviews from team members
   - Address feedback before merging

4. **Keep Branches Up to Date**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

5. **Delete Old Branches**
   ```bash
   git branch -d feature/old-feature
   git push origin --delete feature/old-feature
   ```

---

## 📊 Repository Statistics

After setup, you can view:
- **Insights**: https://github.com/yourusername/klipit-pro/insights/
- **Network**: https://github.com/yourusername/klipit-pro/network
- **Pulse**: https://github.com/yourusername/klipit-pro/pulse

---

## 🎯 Milestones & Labels

Consider adding these to organize your work:

### Milestones
- v1.0.0 - Initial Release
- v1.1.0 - File Upload Feature
- v2.0.0 - Mobile App

### Labels
- `bug` - Something isn't working
- `enhancement` - New feature idea
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

---

## 🔗 Useful GitHub URLs

Replace `yourusername` with your actual username:

- Repository: https://github.com/yourusername/klipit-pro
- Issues: https://github.com/yourusername/klipit-pro/issues
- Pull Requests: https://github.com/yourusername/klipit-pro/pulls
- Actions: https://github.com/yourusername/klipit-pro/actions
- Settings: https://github.com/yourusername/klipit-pro/settings

---

## 🚀 Next Steps

1. ✅ Create GitHub repository
2. ✅ Push code to GitHub
3. ✅ Add GitHub Secrets
4. ✅ Configure SSH deployment
5. ✅ Enable Branch protection
6. ✅ Test CI/CD pipeline
7. 📝 Invite team members (if applicable)
8. 📝 Set up project board (GitHub Projects)
9. 📝 Create GitHub Wiki (documentation)
10. 🎉 Start development!

---

**Repository Setup Complete! 🎉**

Your Klipit Pro project is now ready for collaborative development with automated testing and deployment!

For any issues, check the [GitHub Docs](https://docs.github.com/en) or create an issue in the repository.
