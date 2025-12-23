# ACIKY - Yoga para Todos

This is a static website for ACIKY (Asociación Cubana de Instructores de Kundalini Yoga), a Cuban Kundalini Yoga instructors association.

## Website Structure

- `index.html` - Homepage with introduction to Kundalini Yoga in Cuba
- `blog.html` - Blog page
- `contact.html` - Contact information
- `gallery.html` - Photo gallery
- `pose.html` - Yoga poses and positions
- `schedule.html` - Class schedules
- `testimonials.html` - User testimonials
- `style.css` - Main stylesheet
- `common.js` - Shared JavaScript functionality
- `images/` - Image assets directory

## GitHub Pages Deployment

The website is automatically deployed to GitHub Pages using GitHub Actions. The deployment workflow is configured in `.github/workflows/pages.yml`.

### Manual Deployment

To trigger a manual deployment:
1. Go to the Actions tab in the GitHub repository
2. Click on "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Local Development

To run the website locally:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Website URL

Once deployed, the website will be available at: https://camachoeng.github.io/ACIKY/