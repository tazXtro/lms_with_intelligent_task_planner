# Environment Variables Setup for AI Integration

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# OpenRouter API Configuration
# Get your API key from: https://openrouter.ai/keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Site URL (for OpenRouter API tracking)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## How to Get Your OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Click "Create Key"
5. Copy your new API key (starts with `sk-or-v1-`)
6. Add it to your `.env.local` file

## Example `.env.local` File

```env
# OpenRouter API
OPENROUTER_API_KEY=sk-or-v1-1234567890abcdef1234567890abcdef1234567890abcdef

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Keep your existing environment variables here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
# ... other variables ...
```

## After Setup

1. Save the `.env.local` file
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Navigate to http://localhost:3000/learner/tasks
4. Click the AI button on any task to test the integration

## Troubleshooting

If you see "OpenRouter API key not configured":
- Ensure `.env.local` exists in the project root
- Verify the variable name is exactly `OPENROUTER_API_KEY`
- Make sure there are no extra spaces or quotes
- Restart the development server after making changes

