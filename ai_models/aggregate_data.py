import pandas as pd
import os

# Step 1: Load cleaned dataset
file_path = "cleaned_data.csv"
df = pd.read_csv(file_path)

df['date'] = pd.to_datetime(df['date'])

df.sort_values(by=['batch_id', 'date'], inplace=True)
df.reset_index(drop=True, inplace=True)

# Step 2: DAILY DATASET
daily_df = df.copy()

daily_df['feed_per_bird'] = daily_df['daily_feed_kg'] / daily_df['total_birds']
daily_df['mortality_rate'] = daily_df['total_mortality'] / daily_df['total_birds']

daily_output = os.path.join(os.getcwd(), "daily_data.csv")
daily_df.to_csv(daily_output, index=False)

print(f" Daily data saved: {daily_output}")

# Step 3: WEEKLY AGGREGATION
weekly_df = df.groupby(['batch_id', 'age_weeks']).agg({
    'eggs': 'sum',                
    'daily_feed_kg': 'sum',     
    'total_feed': 'max',          
    'total_birds': 'mean',        
    'total_mortality': 'max'      
}).reset_index()

weekly_df['feed_per_bird'] = weekly_df['daily_feed_kg'] / weekly_df['total_birds']
weekly_df['mortality_rate'] = weekly_df['total_mortality'] / weekly_df['total_birds']

weekly_output = os.path.join(os.getcwd(), "weekly_data.csv")
weekly_df.to_csv(weekly_output, index=False)

print(f" Weekly data saved: {weekly_output}")

# Step 4: MONTHLY AGGREGATION
df['month'] = df['date'].dt.to_period('M')

monthly_df = df.groupby(['batch_id', 'month']).agg({
    'eggs': 'sum',                
    'daily_feed_kg': 'sum',       
    'total_feed': 'max',          
    'total_birds': 'mean',        
    'total_mortality': 'max'      
}).reset_index()

monthly_df['month'] = monthly_df['month'].astype(str)

monthly_df['feed_per_bird'] = monthly_df['daily_feed_kg'] / monthly_df['total_birds']
monthly_df['mortality_rate'] = monthly_df['total_mortality'] / monthly_df['total_birds']

monthly_output = os.path.join(os.getcwd(), "monthly_data.csv")
monthly_df.to_csv(monthly_output, index=False)

print(f" Monthly data saved: {monthly_output}")

print("\n All aggregations completed successfully!")