# Push this project to GitHub

The repo is initialized and committed locally. Create the remote repo and push:

## 1. Create the repo on GitHub

1. Go to [github.com/new](https://github.com/new).
2. **Repository name:** `wedding-photo-app` (or any name you like).
3. **Public**, leave "Add a README" **unchecked** (you already have one).
4. Click **Create repository**.

## 2. Add remote and push

GitHub will show you commands. Use these (replace `YOUR_USERNAME` with your GitHub username):

```bash
cd "/Users/anthonyferraro/Desktop/Personal Projects Websites/Cursor Projects/Wedding Photo App"
git remote add origin https://github.com/YOUR_USERNAME/wedding-photo-app.git
git branch -M main
git push -u origin main
```

If you chose a different repo name, use it in the URL instead of `wedding-photo-app`.

Done. You can delete this file after pushing if you like.
