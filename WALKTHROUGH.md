# Microcenter Mac Mini Stock Checker Walkthrough

This automated tool checks stock for the Mac Mini at configured Microcenter locations and sends email notifications.

## 1. Setup

### Prerequisites
- Node.js installed.
- Playwright browsers installed (`npx playwright install`).

### Installation
```bash
npm install
```

### Configuration (`src/config.js`)
Edit `src/config.js` to change:
- **Product URL**: The `productUrl` field.
- **Stores**: Add or remove stores in the `stores` array. You can find Store IDs in the Microcenter URL (e.g., `?storeid=121`).
- **Schedule**: The cron schedule string.

### Email Setup

This system uses a standard SMTP transport. The easiest way to get started is with a Gmail account.

1.  **Prepare your Gmail Account**:
    *   Go to [Manage your Google Account](https://myaccount.google.com/).
    *   Select **Security**.
    *   Under "Signing in to Google," make sure **2-Step Verification** is turned **ON**.
    *   **Note**: Google sometimes hides this setting. The reliable ways to find it are:
        *   **Method A (Direct Link)**: Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
        *   **Method B (Search)**: On the main Google Account page, click the **Search** icon (magnifying glass) at the top and type "App passwords".
    *   Create a new app password (name it "Stock Checker" or similar).
    *   **Copy the 16-character password** (it looks like `abcd efgh ijkl mnop`).

2.  **Configure the Environment**:
    *   **Create the file**: Duplicate `.env.example` and name the new file `.env`.
        ```bash
        cp .env.example .env
        ```
    *   **Edit the file**: Open the new `.env` file in your text editor.
    *   **Fill in your details**:
        *   `EMAIL_USER`: Your Gmail address (e.g., `bob@gmail.com`).
        *   `EMAIL_PASS`: Paste the 16-character App Password. **You can keep the spaces**, Google handles them fine.
        *   `EMAIL_TO`: Who should receive the email. **Tip:** You can add multiple addresses separated by a comma (e.g., `me@gmail.com,spouse@gmail.com`).

## 2. Usage

### Manual Check
Run the checker immediately:
```bash
npm start
# OR
node src/index.js
```

### Scheduled Check (Automated Daily Run)

To make this run automatically every day, we use a tool built into your Mac called **cron**. It's like an alarm clock for your computer that runs commands instead of playing music.

#### option 1: The Easy Way (One Command)
Run this single command in your terminal. It will set the schedule automatically without opening any editors:

```bash
echo "0 9 * * * cd /Users/business/WORLDS/Projects/stock-checker && npm start >> /Users/business/WORLDS/Projects/stock-checker/cron.log 2>&1" | crontab -
```

#### Option 2: The Manual Way (Advanced)
If you prefer to edit the file manually:
1.  Run `EDITOR=nano crontab -e`.
2.  Paste the line at the bottom.
3.  Press `Ctrl+O` then `Enter` to save.
4.  Press `Ctrl+X` to exit.

That's it! Your computer will now wake up this script every day at 9:00 AM (as long as your computer is on).


## 3. Results
The script prints a table to the console:
```
┌───┬──────────────┬──────────────────┬───────┐
│   │ Store        │ Stock            │ Price │
├───┼──────────────┼──────────────────┼───────┤
│ 0 │ Cambridge    │ SOLD OUT         │ N/A   │
│ 1 │ Phoenix      │ 1 NEW IN STOCK   │ N/A   │
└───┴──────────────┴──────────────────┴───────┘
```
And sends an email if stock is found.

## 4. Phase 2: Public Status Page

We have set up a "Cloud Robot" (GitHub Actions) to update a public website for you.

### Step 1: Verify Locally
Before sending it to the cloud, make sure the generator works on your Mac:
```bash
node src/generate_json.js
```
*   **Success**: It says "Successfully wrote public/data.json".
*   **Check**: Open `public/index.html` in your browser. You should see the dashboard!

### Step 2: Push to GitHub
1.  Create a **new public repository** on [GitHub.com](https://github.com/new) (name it `stock-checker`).
2.  Push your code (run these in your terminal):
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/stock-checker.git
    git add .
    git commit -m "Phase 2: Add status page"
    git push -u origin master
    ```

    > **Create a Password-Style Token (Required):**
    > GitHub does *not* accept your account password here. You must create a special "Access Token".
    > 1. Go to [GitHub Token Settings](https://github.com/settings/tokens).
    > 2. Click **Generate new token (classic)**.
    > 3. Give it a Note (e.g. "Stock App").
    > 4. Check the **repo** box AND the **workflow** box (crucial for Actions).
    > 5. Click **Generate token**.
    > 6. **Copy that long string** (starts with `ghp_...`). Use *that* as your password in the terminal.

### Step 3: Enable "The Robot" & Website
1.  Go to your new Repo page on GitHub.
2.  Click **Settings** (top right tab).
3.  Click **Pages** (left sidebar).
4.  Under **Build and deployment**:
    *   Source: **Deploy from a branch**
    *   Branch: `master` / `/root` -> Click **Save**.

### Step 4: Add Secrets (IMPORTANT)
The robot needs your email password to (optionally) send alerts, checking stock, etc.
1.  Go to **Settings** > **Secrets and variables** > **Actions**.
2.  Click **New repository secret**.
3.  Add the same keys from your local `.env`:
    *   Name: `EMAIL_USER` -> Value: Your email.
    *   Name: `EMAIL_PASS` -> Value: Your App Password.
    *   Name: `EMAIL_TO` -> Value: Your email.

**Done!**
In about 5 minutes, your website will be live at:
`https://YOUR_USERNAME.github.io/stock-checker/`
And it will auto-update every hour.
