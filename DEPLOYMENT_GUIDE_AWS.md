# 🚀 Complete Beginner's Guide: AWS EC2 Deployment

This guide explains step-by-step how to deploy the **Dropshipping Management Platform** (React Frontend + 7 Node.js Microservices + PostgreSQL + Redis + Socket.IO) to **Amazon Web Services (AWS)** using Docker Compose on an AWS EC2 instance.

---

## 📌 Deployment Overview

```text
                               AWS EC2 Instance (Ubuntu 24.04 LTS)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                        │
│                                  Nginx Reverse Proxy (Port 80/443)                     │
│                                           │                                            │
│                 ┌─────────────────────────┴─────────────────────────┐                  │
│                 ▼                                                   ▼                  │
│        Frontend (React SPA)                                API Gateway (Port 5000)     │
│             (Port 80)                                               │                  │
│                                     ┌───────────────────────────────┴───────────────┐  │
│                                     ▼                                               ▼  │
│                             Socket.IO WebSockets                            7 Microservices    │
│                                                                                     │  │
│                                     ┌───────────────────────────────────────────────┘  │
│                                     ▼                                                  │
│                         PostgreSQL (7 DBs)  +  Redis Cache                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Phase 1: Create and Configure AWS EC2 Instance

### Step 1: Log in to AWS Management Console
1. Go to [https://aws.amazon.com/console/](https://aws.amazon.com/console/) and sign in to your AWS account.
2. In the top search bar, type **EC2** and select **EC2 Dashboard**.
3. Ensure your region (top right) is set to your preferred region (e.g. `us-east-1` N. Virginia, `ap-south-1` Mumbai, or `eu-central-1` Frankfurt).

### Step 2: Launch EC2 Instance
1. Click **Launch instance**.
2. **Name**: `dropship-management-server`
3. **Application and OS Image (AMI)**:
   * Select **Ubuntu** -> **Ubuntu Server 24.04 LTS (HVM), SSD Volume Type** (64-bit x86).
4. **Instance Type**:
   * For Development / Demo: Select **`t3.medium`** (2 vCPU, 4 GiB Memory) or **`t3.small`** (2 vCPU, 2 GiB Memory + 4GB Swap).
5. **Key Pair (SSH Login)**:
   * Click **Create new key pair**.
   * Key pair name: `dropship-key`
   * Key pair type: **RSA**, Private key file format: **`.pem`** (for OpenSSH/Mac/Linux/Windows PowerShell).
   * Click **Create key pair** (this automatically downloads `dropship-key.pem` to your computer). Save this file safely!

### Step 3: Configure Network & Security Group (Firewall)
1. Under **Network settings**, click **Edit**.
2. Create Security Group name: `dropship-sg`
3. Add the following **Inbound Security Group Rules**:
   * **Rule 1 (SSH)**: Type: `SSH` | Port: `22` | Source: `Anywhere` (`0.0.0.0/0`) or `My IP`
   * **Rule 2 (HTTP)**: Type: `HTTP` | Port: `80` | Source: `Anywhere` (`0.0.0.0/0`)
   * **Rule 3 (HTTPS)**: Type: `HTTPS` | Port: `443` | Source: `Anywhere` (`0.0.0.0/0`)
   * **Rule 4 (API Gateway - Optional)**: Type: `Custom TCP` | Port: `5000` | Source: `Anywhere` (`0.0.0.0/0`)

### Step 4: Storage & Launch
1. Change **Configure storage** from 8 GiB to **`30 GiB`** (General Purpose SSD `gp3`).
2. Click **Launch instance**.

---

## 📌 Phase 2: Assign Elastic IP (Static IP Address)

By default, an EC2 public IP changes every time you stop/start the server. An Elastic IP keeps your IP permanent.

1. In the EC2 Sidebar, navigate to **Network & Security** -> **Elastic IPs**.
2. Click **Allocate Elastic IP address** -> Click **Allocate**.
3. Select your newly created Elastic IP -> Click **Actions** -> **Associate Elastic IP address**.
4. Choose Instance: Select your `dropship-management-server` -> Click **Associate**.
5. Note down your **Elastic IP** (e.g., `54.210.120.45`).

---

## 💻 Phase 3: Connect to EC2 & Install Server Dependencies

### Step 1: SSH into your EC2 Instance
Open your terminal (PowerShell, Command Prompt, or Terminal on Mac/Linux) and navigate to the directory where your `dropship-key.pem` file was saved:

```bash
# Set secure permissions for your key (Mac/Linux)
chmod 400 dropship-key.pem

# SSH into your server
ssh -i dropship-key.pem ubuntu@<YOUR_ELASTIC_IP>
```

### Step 2: Install Docker and Docker Compose
Run the following commands on your EC2 instance terminal:

```bash
# Update Ubuntu package lists
sudo apt update && sudo apt upgrade -y

# Install Docker, Git, and utilities
sudo apt install -y docker.io docker-compose-plugin git curl

# Allow your user to run Docker commands without 'sudo'
sudo usermod -aG docker ubuntu
newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

### Step 3: Configure 4GB Swap Memory (Crucial for Smooth Performance)
Because running 7 Node.js microservices + PostgreSQL + Redis uses memory, configuring swap space prevents low-memory crashes:

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify swap creation
free -h
```

---

## 🚀 Phase 4: Clone Code & Launch Application

### Step 1: Clone Repository onto EC2
```bash
git clone <YOUR_GIT_REPOSITORY_URL> dropship
cd dropship
```

*(If using a private GitHub repository, you can set up a GitHub Personal Access Token or SSH Deploy Key).*

### Step 2: Build and Start Containerized Application
Run Docker Compose in production mode:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This will automatically:
1. Build the production React frontend SPA.
2. Build the Node.js microservices container.
3. Launch PostgreSQL 15 and Redis containers.
4. Start Nginx Gateway Reverse Proxy on Port 80.

### Step 3: Check Container Health & Logs
```bash
# View running containers
docker compose -f docker-compose.prod.yml ps

# Check logs for all services
docker compose -f docker-compose.prod.yml logs -f --tail=50
```

---

## 🌱 Phase 5: Initialize Database & Run Seed Data

Once containers are running, populate the PostgreSQL databases with the realistic synthetic seed dataset (10 businesses, 120 users, 3,500 orders, 800 products, 200 campaigns, chat history):

```bash
# Execute seed script inside the running node container
docker exec -it dropship-prod-gateway node scripts/seed.js
```

You should see:
```text
✅ Database seeding completed successfully!
```

---

## 🌐 Phase 6: Domain Name & Free SSL Certificate (HTTPS)

### Step 1: Point Domain to EC2 Elastic IP
1. Go to your Domain Registrar (GoDaddy, Namecheap, AWS Route 53, Cloudflare).
2. Create an **`A Record`**:
   * **Host / Name**: `@` (or `app`)
   * **Value / Target**: `<YOUR_EC2_ELASTIC_IP>` (e.g., `54.210.120.45`)
   * **TTL**: Auto or 300s

### Step 2: Install Free Let's Encrypt SSL (HTTPS) with Certbot
On your EC2 instance terminal:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Stop Nginx temporary to acquire certificate or run standalone certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Automatically renew SSL certificate via cron
sudo certbot renew --dry-run
```

---

## 🔑 Default Production Test Credentials

Once deployed, you can log in at `http://<YOUR_EC2_ELASTIC_IP>` or `https://yourdomain.com`:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin Alexander** | `admin@dropship.com` | `Password123!` |
| **Dealer / Supplier** | `dealer@supplier.com` | `Password123!` |
| **Digital Marketer** | `marketing@growth.com` | `Password123!` |
| **Sales Representative** | `sales@dropship.com` | `Password123!` |

---

## 🧹 Useful Operations & Commands

```bash
# Restart application
docker compose -f docker-compose.prod.yml restart

# Stop application
docker compose -f docker-compose.prod.yml down

# Rebuild and restart after pulling code updates
git pull
docker compose -f docker-compose.prod.yml up -d --build
```
