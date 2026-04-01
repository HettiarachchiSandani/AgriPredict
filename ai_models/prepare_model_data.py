import pandas as pd
import os
import joblib
import numpy as np

# Load dataset
df = pd.read_csv("cleaned_data.csv")

df['date'] = pd.to_datetime(df['date'])

df.sort_values(by=['batch_id', 'date'], inplace=True)
df.reset_index(drop=True, inplace=True)

# Encoding 
batch_freq = df['batch_id'].value_counts(normalize=True)
df['batch_encoded'] = df['batch_id'].map(batch_freq)

joblib.dump(batch_freq, "models/batch_encoder_v1.pkl")

# LAG FEATURES
df['prev_day_eggs'] = df.groupby('batch_id')['eggs'].shift(1)
df['prev_day_feed'] = df.groupby('batch_id')['daily_feed_kg'].shift(1)
df['prev_day_mortality'] = df.groupby('batch_id')['total_mortality'].shift(1)

# SAFE ROLLING 
def rolling_mean(x):
    return x.shift(1).rolling(3, min_periods=1).mean()

df['eggs_3day_avg'] = df.groupby('batch_id')['eggs'].transform(rolling_mean)
df['feed_3day_avg'] = df.groupby('batch_id')['daily_feed_kg'].transform(rolling_mean)
df['mortality_3day_avg'] = df.groupby('batch_id')['total_mortality'].transform(rolling_mean)

df['mortality_rate'] = df['total_mortality'] / df['total_birds']

df['feed_per_bird'] = df['daily_feed_kg'] / df['total_birds']
df['feed_per_bird'] = df['feed_per_bird'].replace([np.inf, -np.inf], 0)

df['egg_trend'] = df['prev_day_eggs'] - df['eggs_3day_avg']
df['feed_trend'] = df['prev_day_feed'] - df['feed_3day_avg']

# DROP EARLY ROWS
df.dropna(inplace=True)

# FINAL FEATURES
model_features = [
    'batch_encoded',
    'age_weeks',
    'total_birds',

    'prev_day_eggs',
    'prev_day_feed',
    'prev_day_mortality',

    'eggs_3day_avg',
    'feed_3day_avg',
    'mortality_3day_avg',

    'egg_trend',
    'feed_trend',

    'daily_feed_kg',
    'feed_per_bird'
]

df_model = df[model_features + ['eggs']]

# SAVE DATASET
output_file = os.path.join(os.getcwd(), "ai_ready_daily_features.csv")
df_model.to_csv(output_file, index=False)

print("\nDataset ready!")
print("Saved as:", output_file)
print(df_model.head())