# WP Site Suite - Complete WordPress Toolkit

The ultimate all-in-one toolkit to secure, optimize, and grow your WordPress website. A self-hosted alternative to Jetpack with no external service requirements.

## 🚀 Version 3.0.0

### What's New

- New Design Module with custom blocks and visual customization
- TailwindCSS integration for modern styling
- Enhanced security features
- Improved performance optimizations
- React-based admin interface
- Better AI integration

## 🎯 Key Features

### 🛡️ Security Shield
- Comprehensive WAF protection
- Brute force login prevention
- Scheduled malware scanning
- Activity logging & monitoring
- Real-time threat detection

### 💾 Backup & Restore
- One-click backups
- Automated scheduling
- Local/cloud storage options
- Point-in-time restoration
- Incremental backups

### ⚡ Performance Boost
- Global CDN integration
- Image optimization
- Asset minification
- Lazy loading
- Cache management

### 🎨 Design Tools
- Custom Gutenberg blocks
- Visual customization
- CSS/JS management
- Font controls
- Template system

### 🤖 AI Content Helper
- AI-powered writing
- Translation assistance
- Image generation
- Smart optimization
- Content suggestions

### 📊 Analytics & CRM
- Privacy-focused stats
- Visitor tracking
- Referrer analysis
- Contact management
- Sales pipeline

### 🚀 Growth Tools
- Newsletter system
- SEO toolkit
- Social automation
- Content scheduling
- Lead generation

## 🔧 Requirements

- WordPress 6.0 or greater
- PHP 8.0 or greater
- MySQL 5.7+ or MariaDB 10.2+
- Node.js 22 and Python 3.12 (development/packaging; PHP test tooling requires 8.4.1+)

## 💻 Development

1. Clone the repository:
   ```bash
   git clone https://github.com/knoksen/knokspack.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📦 Installation

### Automatic (Recommended)
1. Go to WordPress Admin > Plugins > Add New
2. Search for "WP Site Suite"
3. Click "Install Now" then "Activate"

### Manual
1. Download the latest release
2. Upload to /wp-content/plugins/
3. Activate through WordPress admin

## 🔑 API Keys (Optional)

Some features require API keys:
- OpenAI API key for AI features
- Social media API keys for auto-posting
- Akismet API key for spam protection

Core features work without any external keys.

## 📚 Documentation

Visit our [Documentation](https://knokspack.com/docs) for detailed guides and tutorials.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

Licensed under the [GPLv2](https://www.gnu.org/licenses/gpl-2.0.html) or later.

## 🌟 Credits

Created by [Knoksen](https://knoksen.com). Special thanks to all contributors!

## Reviewed source and release limits

The repository root is the only plugin source. Run `npm run package` to build and validate `build/knokspack.zip`; do not distribute a historical nested `knokspack/` tree or old desktop artifacts. Packaging excludes development dependencies and does not deploy.

Optional analytics defaults off and requires per-visitor opt-in even on existing enabled installations. Visitors can withdraw consent using the analytics preferences control. Restore is temporarily disabled and returns an explicit error before reading archives or executing SQL. Backup creation requires an operator-configured private directory outside the WordPress root; existing archives are not moved or removed by this change.

Feature descriptions above are product goals, not module readiness guarantees. See [remediation evidence](docs/audit/REMEDIATION.md) and the [module matrix](docs/audit/MODULE_MATRIX.md) before release.
