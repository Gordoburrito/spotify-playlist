# Spotify Claude Skill

A Claude skill for controlling Spotify and managing playlists using the Spotify Web API.

## Features

This skill provides the following capabilities:

- **Get Top Tracks**: Retrieve your most listened to tracks over different time periods
- **Get Top Artists**: Retrieve your most listened to artists over different time periods
- **Create Playlists**: Create new playlists with custom names and descriptions
- **Add Tracks**: Add tracks to existing playlists
- **Search**: Search for tracks and artists on Spotify
- **Recommendations**: Get personalized track recommendations based on seeds
- **User Info**: Get current user profile information
- **Playlist Management**: View and manage your playlists

## Setup

### 1. Get a Spotify Access Token

You need a Spotify access token to use this skill. Here are the options:

#### Option A: Quick Token (for testing, expires in 1 hour)

1. Go to the [Spotify Web API Console](https://developer.spotify.com/console/)
2. Choose any endpoint (e.g., "Get Current User's Profile")
3. Click "Get Token"
4. Select the required scopes:
   - `user-top-read` (for top tracks/artists)
   - `playlist-modify-public` (for creating public playlists)
   - `playlist-modify-private` (for creating private playlists)
   - `playlist-read-private` (for reading playlists)
   - `user-read-private` (for user profile)
   - `user-read-email` (for user email)
5. Copy the generated token

#### Option B: Long-lived Token (OAuth flow)

For a production setup, implement the OAuth 2.0 authorization flow:

1. Create a Spotify App at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Note your Client ID and Client Secret
3. Set up redirect URI
4. Implement OAuth flow to get access/refresh tokens
5. See [Spotify Authorization Guide](https://developer.spotify.com/documentation/web-api/concepts/authorization)

### 2. Configure the Skill

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your token:
   ```
   SPOTIFY_TOKEN=your_actual_token_here
   ```

### 3. Use the Skill

Once configured, you can use the skill in Claude Code. Example commands:

```
Can you show me my top 10 tracks from the last 6 months?

Search for "Bohemian Rhapsody" on Spotify

Create a playlist called "My Favorites" and add my top 5 tracks to it

Get me some recommendations based on my top artists

Show me all my playlists
```

## Available Tools

### `get_top_tracks`
Get user's top tracks from Spotify.

**Parameters:**
- `time_range` (optional): 'short_term', 'medium_term', or 'long_term'
- `limit` (optional): Number of tracks (1-50, default: 20)

### `get_top_artists`
Get user's top artists from Spotify.

**Parameters:**
- `time_range` (optional): 'short_term', 'medium_term', or 'long_term'
- `limit` (optional): Number of artists (1-50, default: 20)

### `create_playlist`
Create a new playlist.

**Parameters:**
- `name` (required): Name of the playlist
- `description` (optional): Description of the playlist
- `public` (optional): Whether playlist is public (default: false)

### `add_tracks_to_playlist`
Add tracks to a playlist.

**Parameters:**
- `playlist_id` (required): ID of the playlist
- `track_uris` (required): Array of Spotify track URIs

### `search_tracks`
Search for tracks on Spotify.

**Parameters:**
- `query` (required): Search query
- `limit` (optional): Number of results (1-50, default: 10)

### `search_artists`
Search for artists on Spotify.

**Parameters:**
- `query` (required): Search query
- `limit` (optional): Number of results (1-50, default: 10)

### `get_recommendations`
Get track recommendations.

**Parameters:**
- `seed_tracks` (optional): Array of track IDs
- `seed_artists` (optional): Array of artist IDs
- `seed_genres` (optional): Array of genre names
- `limit` (optional): Number of recommendations (1-100, default: 20)

### `get_current_user`
Get current user's profile information.

### `get_user_playlists`
Get user's playlists.

**Parameters:**
- `limit` (optional): Number of playlists (1-50, default: 20)

### `get_playlist_tracks`
Get tracks from a specific playlist.

**Parameters:**
- `playlist_id` (required): ID of the playlist
- `limit` (optional): Number of tracks (1-100, default: 50)

## Token Refresh

Note that Spotify access tokens expire after 1 hour. For production use, you should:

1. Implement OAuth 2.0 flow to get refresh tokens
2. Automatically refresh the access token when it expires
3. Store tokens securely

## Security

- **Never commit your `.env` file** - it contains your personal access token
- The `.gitignore` file is already configured to exclude `.env`
- Tokens in `.env` should be kept private and secure
- Consider using environment variables or a secrets manager for production

## Troubleshooting

### "SPOTIFY_TOKEN not set" error
- Make sure you've created the `.env` file in the skill directory
- Verify the token is correctly set in the `.env` file
- Check that there are no extra spaces around the token

### "Spotify API error (401)"
- Your token has expired (tokens expire after 1 hour)
- Generate a new token and update your `.env` file

### "Spotify API error (403)"
- You don't have the required scopes for the operation
- Generate a new token with the appropriate scopes

## Links

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- [Claude Skills Documentation](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

## License

MIT
