import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load token from .env file
let SPOTIFY_TOKEN = process.env.SPOTIFY_TOKEN;

// Try to load from .env file in the skill directory
try {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  const tokenMatch = envContent.match(/SPOTIFY_TOKEN=(.+)/);
  if (tokenMatch) {
    SPOTIFY_TOKEN = tokenMatch[1].trim();
  }
} catch (error) {
  // .env file doesn't exist, will use environment variable
}

/**
 * Make a request to the Spotify Web API
 */
async function fetchWebApi(endpoint, method = 'GET', body = null) {
  if (!SPOTIFY_TOKEN) {
    throw new Error('SPOTIFY_TOKEN not set. Please set it in .env file or environment variable.');
  }

  const options = {
    headers: {
      Authorization: `Bearer ${SPOTIFY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    method,
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`https://api.spotify.com/${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify API error (${response.status}): ${errorText}`);
  }

  // Some endpoints return 204 No Content
  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

/**
 * Get user's top tracks
 */
async function get_top_tracks({ time_range = 'medium_term', limit = 20 }) {
  const data = await fetchWebApi(
    `v1/me/top/tracks?time_range=${time_range}&limit=${limit}`,
    'GET'
  );

  return {
    tracks: data.items.map(track => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artists: track.artists.map(artist => ({
        id: artist.id,
        name: artist.name,
      })),
      album: {
        id: track.album.id,
        name: track.album.name,
        images: track.album.images,
      },
      duration_ms: track.duration_ms,
      popularity: track.popularity,
      preview_url: track.preview_url,
      external_urls: track.external_urls,
    })),
    total: data.total,
  };
}

/**
 * Get user's top artists
 */
async function get_top_artists({ time_range = 'medium_term', limit = 20 }) {
  const data = await fetchWebApi(
    `v1/me/top/artists?time_range=${time_range}&limit=${limit}`,
    'GET'
  );

  return {
    artists: data.items.map(artist => ({
      id: artist.id,
      uri: artist.uri,
      name: artist.name,
      genres: artist.genres,
      popularity: artist.popularity,
      followers: artist.followers.total,
      images: artist.images,
      external_urls: artist.external_urls,
    })),
    total: data.total,
  };
}

/**
 * Create a new playlist
 */
async function create_playlist({ name, description = '', public: isPublic = false }) {
  // First get the user ID
  const user = await fetchWebApi('v1/me', 'GET');

  const playlist = await fetchWebApi(
    `v1/users/${user.id}/playlists`,
    'POST',
    {
      name,
      description,
      public: isPublic,
    }
  );

  return {
    id: playlist.id,
    uri: playlist.uri,
    name: playlist.name,
    description: playlist.description,
    public: playlist.public,
    external_urls: playlist.external_urls,
    tracks: {
      total: playlist.tracks.total,
    },
  };
}

/**
 * Add tracks to a playlist
 */
async function add_tracks_to_playlist({ playlist_id, track_uris }) {
  const result = await fetchWebApi(
    `v1/playlists/${playlist_id}/tracks`,
    'POST',
    {
      uris: track_uris,
    }
  );

  return {
    snapshot_id: result.snapshot_id,
    message: `Successfully added ${track_uris.length} tracks to playlist`,
  };
}

/**
 * Search for tracks
 */
async function search_tracks({ query, limit = 10 }) {
  const data = await fetchWebApi(
    `v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
    'GET'
  );

  return {
    tracks: data.tracks.items.map(track => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artists: track.artists.map(artist => ({
        id: artist.id,
        name: artist.name,
      })),
      album: {
        id: track.album.id,
        name: track.album.name,
        images: track.album.images,
      },
      duration_ms: track.duration_ms,
      popularity: track.popularity,
      preview_url: track.preview_url,
      external_urls: track.external_urls,
    })),
    total: data.tracks.total,
  };
}

/**
 * Search for artists
 */
async function search_artists({ query, limit = 10 }) {
  const data = await fetchWebApi(
    `v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
    'GET'
  );

  return {
    artists: data.artists.items.map(artist => ({
      id: artist.id,
      uri: artist.uri,
      name: artist.name,
      genres: artist.genres,
      popularity: artist.popularity,
      followers: artist.followers.total,
      images: artist.images,
      external_urls: artist.external_urls,
    })),
    total: data.artists.total,
  };
}

/**
 * Get track recommendations
 */
async function get_recommendations({
  seed_tracks = [],
  seed_artists = [],
  seed_genres = [],
  limit = 20,
}) {
  const params = new URLSearchParams();

  if (seed_tracks.length > 0) {
    params.append('seed_tracks', seed_tracks.join(','));
  }
  if (seed_artists.length > 0) {
    params.append('seed_artists', seed_artists.join(','));
  }
  if (seed_genres.length > 0) {
    params.append('seed_genres', seed_genres.join(','));
  }
  params.append('limit', limit.toString());

  const data = await fetchWebApi(
    `v1/recommendations?${params.toString()}`,
    'GET'
  );

  return {
    tracks: data.tracks.map(track => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artists: track.artists.map(artist => ({
        id: artist.id,
        name: artist.name,
      })),
      album: {
        id: track.album.id,
        name: track.album.name,
        images: track.album.images,
      },
      duration_ms: track.duration_ms,
      popularity: track.popularity,
      preview_url: track.preview_url,
      external_urls: track.external_urls,
    })),
    seeds: data.seeds,
  };
}

/**
 * Get current user profile
 */
async function get_current_user() {
  const user = await fetchWebApi('v1/me', 'GET');

  return {
    id: user.id,
    display_name: user.display_name,
    email: user.email,
    country: user.country,
    product: user.product,
    followers: user.followers.total,
    images: user.images,
    external_urls: user.external_urls,
  };
}

/**
 * Get user's playlists
 */
async function get_user_playlists({ limit = 20 }) {
  const data = await fetchWebApi(
    `v1/me/playlists?limit=${limit}`,
    'GET'
  );

  return {
    playlists: data.items.map(playlist => ({
      id: playlist.id,
      uri: playlist.uri,
      name: playlist.name,
      description: playlist.description,
      public: playlist.public,
      collaborative: playlist.collaborative,
      tracks: {
        total: playlist.tracks.total,
      },
      images: playlist.images,
      external_urls: playlist.external_urls,
      owner: {
        id: playlist.owner.id,
        display_name: playlist.owner.display_name,
      },
    })),
    total: data.total,
  };
}

/**
 * Get tracks from a playlist
 */
async function get_playlist_tracks({ playlist_id, limit = 50 }) {
  const data = await fetchWebApi(
    `v1/playlists/${playlist_id}/tracks?limit=${limit}`,
    'GET'
  );

  return {
    tracks: data.items.map(item => ({
      added_at: item.added_at,
      track: item.track ? {
        id: item.track.id,
        uri: item.track.uri,
        name: item.track.name,
        artists: item.track.artists.map(artist => ({
          id: artist.id,
          name: artist.name,
        })),
        album: {
          id: item.track.album.id,
          name: item.track.album.name,
          images: item.track.album.images,
        },
        duration_ms: item.track.duration_ms,
        popularity: item.track.popularity,
        preview_url: item.track.preview_url,
        external_urls: item.track.external_urls,
      } : null,
    })),
    total: data.total,
  };
}

// Export all tool functions
export {
  get_top_tracks,
  get_top_artists,
  create_playlist,
  add_tracks_to_playlist,
  search_tracks,
  search_artists,
  get_recommendations,
  get_current_user,
  get_user_playlists,
  get_playlist_tracks,
};
