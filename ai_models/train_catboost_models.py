import pandas as pd
import numpy as np
from catboost import CatBoostRegressor, CatBoostClassifier
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    f1_score,
    accuracy_score,
    precision_score,
    recall_score
)
from sklearn.model_selection import ParameterGrid, train_test_split
import joblib

# METRICS
def RMSE(y_true, y_pred):
    return np.sqrt(mean_squared_error(y_true, y_pred))

def SMAPE(y_true, y_pred):
    return 100 * np.mean(
        2 * np.abs(y_pred - y_true) /
        (np.abs(y_true) + np.abs(y_pred) + 1e-6)
    )

# LOAD DATA
df = pd.read_csv("ai_ready_daily_features.csv")

df.sort_values(['batch_encoded', 'age_weeks'], inplace=True)

# FEATURE ENGINEERING 
for lag in [1, 3, 7]:
    df[f'lag_{lag}_eggs'] = df.groupby('batch_encoded')['prev_day_eggs'].shift(lag)
    df[f'lag_{lag}_feed'] = df.groupby('batch_encoded')['daily_feed_kg'].shift(lag)
    df[f'lag_{lag}_mort'] = df.groupby('batch_encoded')['prev_day_mortality'].shift(lag)

df['roll_3_eggs'] = df.groupby('batch_encoded')['lag_1_eggs'].transform(
    lambda x: x.rolling(3, min_periods=1).mean()
)

df['roll_7_eggs'] = df.groupby('batch_encoded')['lag_1_eggs'].transform(
    lambda x: x.rolling(7, min_periods=1).mean()
)

df['trend_eggs'] = df['lag_1_eggs'] - df['roll_3_eggs']
df['trend_mort'] = df['lag_1_mort']

# TARGETS
df['target_eggs'] = df.groupby('batch_encoded')['eggs'].shift(-1)

df['target_mortality'] = (
    df.groupby('batch_encoded')['prev_day_mortality'].shift(-1) > 0
).astype(int)

df.dropna(inplace=True)

# FEATURES
egg_features = [
    'age_weeks','total_birds','daily_feed_kg','feed_per_bird',
    'lag_1_eggs','lag_3_eggs','lag_7_eggs',
    'roll_3_eggs','roll_7_eggs','trend_eggs'
]

mort_features = [
    'age_weeks','total_birds','feed_per_bird',
    'prev_day_mortality','mortality_3day_avg',
    'lag_1_mort','lag_3_mort','trend_mort'
]

# SPLIT BY BATCH
unique_batches = df['batch_encoded'].unique()

train_batches, test_batches = train_test_split(unique_batches, test_size=0.2, random_state=42)
train_batches, val_batches = train_test_split(train_batches, test_size=0.125, random_state=42)

train_df = df[df['batch_encoded'].isin(train_batches)]
val_df = df[df['batch_encoded'].isin(val_batches)]
test_df = df[df['batch_encoded'].isin(test_batches)]

# PARAM GRID (
param_grid = {
    'depth': [4, 6],
    'learning_rate': [0.03, 0.05],
    'iterations': [300],
    'l2_leaf_reg': [3, 5]
}

# TUNING REGRESSION
def tune_reg(X_train, y_train, X_val, y_val):
    best_params = None
    best_score = float('inf')

    for p in ParameterGrid(param_grid):
        model = CatBoostRegressor(
            **p,
            loss_function='RMSE',
            verbose=0
        )

        model.fit(X_train, y_train)
        preds = model.predict(X_val)

        mae = mean_absolute_error(y_val, preds)

        if mae < best_score:
            best_score = mae
            best_params = p

    return best_params

# TUNING CLASSIFICATION
def tune_clf(X_train, y_train, X_val, y_val):
    best_params = None
    best_score = 0

    for p in ParameterGrid(param_grid):
        model = CatBoostClassifier(
            **p,
            loss_function='Logloss',
            verbose=0
        )

        model.fit(X_train, y_train)
        preds = model.predict(X_val)

        score = f1_score(y_val, preds)

        if score > best_score:
            best_score = score
            best_params = p

    return best_params

# TRAINING
print("Tuning Egg Model...")
best_eggs = tune_reg(
    train_df[egg_features],
    train_df['target_eggs'],
    val_df[egg_features],
    val_df['target_eggs']
)

print("Tuning Mortality Model...")
best_mort = tune_clf(
    train_df[mort_features],
    train_df['target_mortality'],
    val_df[mort_features],
    val_df['target_mortality']
)

# FINAL MODELS
egg_model = CatBoostRegressor(**best_eggs, loss_function='RMSE', verbose=0)
egg_model.fit(train_df[egg_features], train_df['target_eggs'])

mort_model = CatBoostClassifier(**best_mort, loss_function='Logloss', verbose=0)
mort_model.fit(train_df[mort_features], train_df['target_mortality'])

# EVALUATION
def evaluate_reg(model, X, y):
    preds = model.predict(X)
    return {
        "MAE": mean_absolute_error(y, preds),
        "RMSE": RMSE(y, preds),
        "R2": r2_score(y, preds),
        "SMAPE": SMAPE(y, preds)
    }

def evaluate_clf(model, X, y):
    preds = model.predict(X)
    return {
        "Accuracy": accuracy_score(y, preds),
        "Precision": precision_score(y, preds, zero_division=0),
        "Recall": recall_score(y, preds, zero_division=0),
        "F1": f1_score(y, preds, zero_division=0)
    }

print("\nEgg Model:")
print(evaluate_reg(egg_model, test_df[egg_features], test_df['target_eggs']))

print("\nMortality Model:")
print(evaluate_clf(mort_model, test_df[mort_features], test_df['target_mortality']))

# SAVE MODELS
joblib.dump(egg_model, "egg_cb_model.pkl")
joblib.dump(mort_model, "mortality_cb_model.pkl")

print("\nModels saved successfully!")