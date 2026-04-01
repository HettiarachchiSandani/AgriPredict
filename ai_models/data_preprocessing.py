import pandas as pd
import os

# Step 1: Load dataset
df = pd.read_excel("Dataset.xlsx")

# Step 2: Clean column names
df.columns = (
    df.columns.str.strip()
    .str.replace('\n', '', regex=True)
    .str.replace('\r', '', regex=True)
)

print("\nColumns after cleaning:")
print(df.columns.tolist())

# Step 3: Drop fully empty rows
df.dropna(how="all", inplace=True)

# Step 4: Convert Date column
df["date"] = pd.to_datetime(df["date"], errors="coerce")
df.dropna(subset=["date"], inplace=True)

# Step 5: Sort 
df.sort_values(by=["batch_id", "date"], inplace=True)
df.reset_index(drop=True, inplace=True)

# Step 6: Convert numeric columns
numeric_cols = [
    "age_weeks", "day", "female_birds", "male_birds",
    "female_mortality", "male_mortality",
    "eggs", "cumalative_eggs", "daily_feed_kg",
    "feed_per_kg", "total_feed"
]

for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

# Step 7: Handle missing values

df["age_weeks"] = (
    (df["date"] - df.groupby("batch_id")["date"].transform('min'))
    .dt.days // 7
)

df["daily_feed_kg"] = df.groupby("batch_id")["daily_feed_kg"].transform(
    lambda x: x.fillna(x.mean())
)

df["total_feed"] = df.groupby("batch_id")["total_feed"].ffill()

df["female_mortality"].fillna(0, inplace=True)
df["male_mortality"].fillna(0, inplace=True)

df["eggs"] = df.groupby("batch_id")["eggs"].ffill()

# Step 8: Recalculate totals
df["total_birds"] = df["female_birds"] + df["male_birds"]
df["total_mortality"] = df["female_mortality"] + df["male_mortality"]

# Step 9: Handle missing birds safely
df["total_birds"].fillna(df["total_birds"].mean(), inplace=True)

df["total_birds"] = df["total_birds"].replace(0, 1)

# Step 10: Keep essential columns
columns_to_keep = [
    "batch_id", "date", "age_weeks", "day",
    "eggs", "daily_feed_kg", "total_feed",
    "total_birds", "total_mortality"
]

df_clean = df[columns_to_keep]

print("\nCleaned Data Preview:")
print(df_clean.head())

# Step 11: Save cleaned CSV
output_file = os.path.join(os.getcwd(), "cleaned_data.csv")
df_clean.to_csv(output_file, index=False)

print("\n Data preprocessing completed successfully!")
print(" Cleaned file saved as:", output_file)