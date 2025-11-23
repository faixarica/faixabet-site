import os
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, select, Table, MetaData
from sqlalchemy.orm import sessionmaker
import pickle
import threading

def load_cache(config):
    if os.path.exists(config.cache_path):
        try:
            with file_lock:
                with open(config.cache_path, 'rb') as f:
                    cache = pickle.load(f)
                    if len(cache) == 2:
                        print("Cache antigo detectado. Recriando cache...")
                        return None
                    elif len(cache) == 3:
                        return cache
        except Exception as e:
            print(f"Erro ao carregar cache: {e}. Recriando cache...")
            with file_lock:
                if os.path.exists(config.cache_path):
                    os.remove(config.cache_path)
            return None
    return None

def save_cache(df, binary_df, historical_results, config):
    with file_lock:
        with open(config.cache_path, 'wb') as f:
            pickle.dump((df, binary_df, historical_results), f)

def prepare_data(engine, session):
    metadata = MetaData()
    results_table = Table('results', metadata, autoload_with=engine)
    query = session.execute(select([results_table]))
    data = [dict(row) for row in query]
    df = pd.DataFrame(data)

    historical_results = set(tuple(sorted(row[f'bol_{i}'] for i in range(1, 16))) for _, row in df.iterrows())

    if len(df) < 6:
        raise ValueError("Sorteios insuficientes.")
    df['binary'] = df.apply(lambda row: [1 if i in row[1:] else 0 for i in range(1, 26)], axis=1)
    binary_df = pd.DataFrame(df['binary'].tolist(), columns=[f'num_{i}' for i in range(1, 26)])
    df = pd.concat([df, binary_df], axis=1)

    binary_matrix = np.array(binary_df.values)
    X, y = [], []
    sequence_length = 5
    for i in range(len(binary_matrix) - sequence_length):
        X.append(binary_matrix[i:i + sequence_length])
        y.append(binary_matrix[i + sequence_length])
    X = np.array(X)
    y = np.array(y).reshape(-1, 25)
    print("X shape:", X.shape)
    print("y shape:", y.shape)
    if X.shape[1:] != (sequence_length, 25) or y.shape[1:] != (25,):
        raise ValueError(f"Invalid shapes: X {X.shape}, y {y.shape}. Expected (n, {sequence_length}, 25) and (n, 25)")
    return X, y, df, binary_df, historical_results

# Lock global para concorrência
file_lock = threading.Lock()