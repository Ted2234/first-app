export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export const fetchMovies = async ({ query }: { query: string }) => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    // @ts-ignore
    throw new Error("failed to fetch movies", response.statusText);
  }

  const data = await response.json();
  return data.results.map((item: any) => ({
    ...item,
    media_type: "movie",
  }));
};

export const fetchMovieDetails = async (
  movieId: string,
): Promise<MovieDetails> => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch movie details");
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const fetchShows = async ({ query }: { query: string }) => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/tv?sort_by=popularity.desc`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) throw new Error("Failed to fetch shows");

  const data = await response.json();

  // Normalize: Map 'name' -> 'title' so MovieCard can read it
  return data.results.map((item: any) => ({
    ...item,
    title: item.name,
    release_date: item.first_air_date,
    media_type: "tv", // Important for navigation
  }));
};

export const fetchTVDetails = async (id: string) => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${id}?api_key=${TMDB_CONFIG.API_KEY}&append_to_response=season/1`,
      { headers: TMDB_CONFIG.headers },
    );
    if (!response.ok) throw new Error("Failed to fetch TV details");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchSeasonDetails = async (
  tvId: string | number,
  seasonNumber: number,
) => {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_CONFIG.API_KEY}`,
      {
        method: "GET",
        headers: TMDB_CONFIG.headers,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch season details");
    }

    const data = await response.json();

    // Returns:
    // - name (e.g. "Season 2")
    // - overview (Specific plot for this season)
    // - poster_path (Specific poster for this season)
    // - episodes (Array of all episodes)
    return data;
  } catch (error) {
    console.error("Error fetching season details:", error);
    throw error;
  }
};
