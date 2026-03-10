export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string[];
  duration: string;
  poster: string;
  backdrop: string;
  description: string;
}

export const featuredMovie: Movie = {
  id: 1,
  title: "Dune: Part Two",
  year: 2024,
  rating: 8.8,
  genre: ["Sci-Fi", "Adventure", "Drama"],
  duration: "2h 46m",
  poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop",
  backdrop: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
  description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe."
};

export const trendingMovies: Movie[] = [
  {
    id: 2,
    title: "Oppenheimer",
    year: 2023,
    rating: 8.5,
    genre: ["Biography", "Drama", "History"],
    duration: "3h 0m",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    backdrop: "",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb."
  },
  {
    id: 3,
    title: "The Batman",
    year: 2022,
    rating: 7.8,
    genre: ["Action", "Crime", "Drama"],
    duration: "2h 56m",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    backdrop: "",
    description: "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate."
  },
  {
    id: 4,
    title: "Avatar: The Way of Water",
    year: 2022,
    rating: 7.6,
    genre: ["Sci-Fi", "Adventure", "Fantasy"],
    duration: "3h 12m",
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop",
    backdrop: "",
    description: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora."
  },
  {
    id: 5,
    title: "Top Gun: Maverick",
    year: 2022,
    rating: 8.3,
    genre: ["Action", "Drama"],
    duration: "2h 10m",
    poster: "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=400&h=600&fit=crop",
    backdrop: "",
    description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator."
  },
  {
    id: 6,
    title: "Spider-Man: No Way Home",
    year: 2021,
    rating: 8.2,
    genre: ["Action", "Adventure", "Fantasy"],
    duration: "2h 28m",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop",
    backdrop: "",
    description: "Peter Parker's identity is revealed, causing chaos in his life."
  },
  {
    id: 7,
    title: "Interstellar",
    year: 2014,
    rating: 8.7,
    genre: ["Sci-Fi", "Adventure", "Drama"],
    duration: "2h 49m",
    poster: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop",
    backdrop: "",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  }
];

export const popularMovies: Movie[] = [
  {
    id: 8,
    title: "The Godfather",
    year: 1972,
    rating: 9.2,
    genre: ["Crime", "Drama"],
    duration: "2h 55m",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop",
    backdrop: "",
    description: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son."
  },
  {
    id: 9,
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    genre: ["Action", "Crime", "Drama"],
    duration: "2h 32m",
    poster: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&h=600&fit=crop",
    backdrop: "",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham."
  },
  {
    id: 10,
    title: "Inception",
    year: 2010,
    rating: 8.8,
    genre: ["Sci-Fi", "Action", "Thriller"],
    duration: "2h 28m",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    backdrop: "",
    description: "A thief who steals corporate secrets through dream-sharing technology."
  },
  {
    id: 11,
    title: "Fight Club",
    year: 1999,
    rating: 8.8,
    genre: ["Drama"],
    duration: "2h 19m",
    poster: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop",
    backdrop: "",
    description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club."
  },
  {
    id: 12,
    title: "Pulp Fiction",
    year: 1994,
    rating: 8.9,
    genre: ["Crime", "Drama"],
    duration: "2h 34m",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    backdrop: "",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine."
  },
  {
    id: 13,
    title: "The Matrix",
    year: 1999,
    rating: 8.7,
    genre: ["Sci-Fi", "Action"],
    duration: "2h 16m",
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=600&fit=crop",
    backdrop: "",
    description: "A computer programmer discovers that reality as he knows it is a simulation."
  }
];

export const newReleases: Movie[] = [
  {
    id: 14,
    title: "Furiosa",
    year: 2024,
    rating: 7.9,
    genre: ["Action", "Adventure", "Sci-Fi"],
    duration: "2h 28m",
    poster: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=400&h=600&fit=crop",
    backdrop: "",
    description: "The origin story of renegade warrior Furiosa before her encounter with Mad Max."
  },
  {
    id: 15,
    title: "Kingdom of the Planet of the Apes",
    year: 2024,
    rating: 7.2,
    genre: ["Sci-Fi", "Adventure", "Action"],
    duration: "2h 25m",
    poster: "https://images.unsplash.com/photo-1611457194403-d3f6f0a0b3b1?w=400&h=600&fit=crop",
    backdrop: "",
    description: "Many years after the reign of Caesar, a young ape goes on a journey."
  },
  {
    id: 16,
    title: "Godzilla x Kong",
    year: 2024,
    rating: 6.5,
    genre: ["Action", "Sci-Fi", "Adventure"],
    duration: "1h 55m",
    poster: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop",
    backdrop: "",
    description: "Two ancient titans, Godzilla and Kong, clash in an epic battle."
  },
  {
    id: 17,
    title: "Civil War",
    year: 2024,
    rating: 7.4,
    genre: ["Action", "Drama", "Thriller"],
    duration: "1h 49m",
    poster: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=600&fit=crop",
    backdrop: "",
    description: "A journey across a dystopian future America following a team of journalists."
  },
  {
    id: 18,
    title: "Ghostbusters: Frozen Empire",
    year: 2024,
    rating: 6.2,
    genre: ["Adventure", "Comedy", "Fantasy"],
    duration: "1h 55m",
    poster: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=600&fit=crop",
    backdrop: "",
    description: "The Spengler family returns to where it all started – the iconic New York City firehouse."
  },
  {
    id: 19,
    title: "Kung Fu Panda 4",
    year: 2024,
    rating: 7.0,
    genre: ["Animation", "Action", "Adventure"],
    duration: "1h 34m",
    poster: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&h=600&fit=crop",
    backdrop: "",
    description: "Po must train a new Dragon Warrior before taking on his new role as the spiritual leader."
  }
];

export const genres = [
  "All",
  "Action",
  "Adventure", 
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Sci-Fi",
  "Thriller"
];
