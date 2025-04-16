import pandas as pd

# Load dataset
file_path = "Top_Anime_data.csv"
df = pd.read_csv(file_path)

# Function to clean and extract unique genres
def clean_genres(genre_str):
    if pd.isna(genre_str):
        return None  # Keep NaN for now, will drop later
    genres = set(dict.fromkeys([g.strip() for g in genre_str.split(",")]))  # Remove duplicates while preserving order
    return genres   # Take the first unique genre

# Extract relevant columns
df_refined = pd.DataFrame()
df_refined["Title"] = df["English"]  # Use English title if available, otherwise Japanese
df_refined["Director"] = "Unknown"  # Placeholder since data is not available
df_refined["Genre"] = df["Genres"].apply(clean_genres)  # Clean and extract first unique genre
df_refined["Year Release"] = df["Premiered"].str.extract(r'(\d{4})').astype(float).astype('Int64')  # Extract year
df_refined["Rating"] = df["Score"]  # Use Score as Rating
df_refined["Country"] = "Japan"  # Default to Japan
df_refined["Studio"] = df["Studios"].fillna("Unknown")

# Drop rows with any null values
df_refined.dropna(inplace=True)

# Save refined dataset
df_refined.to_csv("Refined_Anime_Data.csv", index=False)
print("Refined dataset saved as 'Refined_Anime_Data.csv' (null values removed, genre issue fixed)")
