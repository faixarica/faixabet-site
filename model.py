import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.layers import Input, LSTM, Dense, Dropout
from tensorflow.keras.callbacks import ModelCheckpoint
import numpy as np
import threading

def load_or_train_model(config, X_train, y_train, X_test, y_test, binary_df):
    base_model_path = 'base_causal_lottery_model.keras'
    checkpoint_path = 'checkpoints/causal_lottery_model_{epoch:02d}.keras'

    if os.path.exists(config.model_path) and datetime.now(tz) < config.last_update.replace(day=28) + pd.Timedelta(days=31):
        with file_lock:
            model = keras.models.load_model(config.model_path)
            model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    else:
        if os.path.exists(base_model_path):
            with file_lock:
                model = keras.models.load_model(base_model_path)
                model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        else:
            model = keras.Sequential([
                Input(shape=(5, 25)),
                LSTM(64, return_sequences=False),
                Dropout(0.2),
                Dense(32, activation='relu'),
                Dense(25, activation='sigmoid')
            ])
            model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

        checkpoint_callback = ModelCheckpoint(
            checkpoint_path,
            monitor='val_loss',
            save_best_only=True,
            mode='min',
            verbose=1
        )
        model.fit(X_train, y_train, epochs=10, batch_size=64, validation_split=0.2, verbose=0, callbacks=[checkpoint_callback])
        with file_lock:
            model.save(base_model_path)

        # Substituir análise causal por frequência relativa
        frequencies = binary_df.sum() / len(binary_df)  # Frequência relativa de cada número
        causal_weights = frequencies / np.sum(frequencies)  # Normalizar para somar 1
        if np.all(causal_weights == 0):  # Fallback se não houver variação
            causal_weights = np.ones(25) / 25 + np.random.uniform(0, 0.01, 25)  # Uniforme com pequena variação

        model.fit(X_train, y_train, epochs=5, batch_size=64, validation_split=0.2, verbose=0, callbacks=[checkpoint_callback])
        with file_lock:
            model.save(config.model_path)

    return model, causal_weights

# Lock global para concorrência
file_lock = threading.Lock()
from datetime import datetime
import pytz
tz = pytz.timezone('America/Sao_Paulo')