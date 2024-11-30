# Personal Portfolio Website

A modern, responsive portfolio website showcasing my professional experience, projects, research papers, and published articles.

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local development server (options provided below)

### Local Development

#### Option 1: Using Python (Recommended)
If you have Python installed:

```bash
# For Python 3.x
python -m http.server 8000

# For Python 2.x
python -m SimpleHTTPServer 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

#### Option 2: Using Node.js
If you prefer Node.js, you can use packages like `http-server`:

```bash
# Install http-server globally
npm install -g http-server

# Run the server
http-server
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

#### Option 3: Using VS Code
If you're using Visual Studio Code:
1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

The site will automatically open in your default browser.

## 📁 Project Structure

```
portfolio_site/
├── index.html          # Main HTML file
├── css/
│   └── style.css      # Styles and layouts
├── js/
│   └── main.js        # JavaScript functionality
└── images/            # Store your images here
```

## 🎨 Customization

### Content
1. Open `index.html` to modify:
   - Personal information
   - Experience details
   - Projects
   - Research papers
   - Published articles
   - Contact information

### Styling
1. Edit `css/style.css` to customize:
   - Color scheme (modify CSS variables in `:root`)
   - Layout
   - Responsive breakpoints
   - Animations

### Functionality
1. Modify `js/main.js` to:
   - Add new interactive features
   - Customize animations
   - Update project data
   - Modify skill sets

## 🔧 Development Tips

1. **Browser DevTools**: Use browser developer tools (F12) to:
   - Debug JavaScript
   - Inspect and modify CSS
   - Test responsive design
   - Monitor network requests

2. **Code Editor**: Recommended VS Code extensions:
   - Live Server
   - HTML CSS Support
   - JavaScript (ES6) code snippets
   - Prettier - Code formatter

3. **Version Control**: Initialize git repository:
```bash
git init
git add .
git commit -m "Initial commit"
```

## 📱 Responsive Design
The site is fully responsive and tested on:
- Desktop (1920px and above)
- Laptop (1024px to 1919px)
- Tablet (768px to 1023px)
- Mobile (below 768px)

## 🔍 SEO
The site includes:
- Semantic HTML5 elements
- Meta descriptions
- Proper heading hierarchy
- Alt text for images

## 🚀 Deployment
Recommended platforms for deployment:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 Static Website Hosting

## 📄 License
This project is open source and available under the MIT License.

## 🤝 Contributing
Feel free to fork this project and customize it for your own use. If you find any bugs or have suggestions for improvements, please open an issue or submit a pull request.
