# gerar_palpites_inteligentes.PY v2.0 base para LS16 MODELO HIBRIDO

import pandas as pd
import random
import itertools
import numpy as np

ARQ = "loteria.csv"

def carregar_dados():
    df = pd.read_csv(ARQ, encoding="utf-8")
    bolas = [f"Bola{i}" for i in range(1, 16)]
    for b in bolas:
        df[b] = df[b].astype(str).str.zfill(2)
    return df, bolas

# ---------------------- MÉTRICAS ESTATÍSTICAS ----------------------

def frequencia_global(df, bolas):
    """Frequência total histórica de cada dezena."""
    todas = df[bolas].values.flatten()
    freq = pd.Series(todas).value_counts().sort_index()
    return {int(k): int(v) for k, v in freq.items()}

def frequencia_recente(df, bolas, ultimos=100):
    """Frequência das últimas N rodadas (reforça tendências recentes)."""
    subset = df.head(ultimos)  # assume arquivo ordenado desc (últimos no topo)
    todas = subset[bolas].values.flatten()
    freq = pd.Series(todas).value_counts().sort_index()
    return {int(k): int(v) for k, v in freq.items()}

def matriz_correlacao(df, bolas):
    """Cria matriz 25x25 indicando quantas vezes duas dezenas saíram juntas."""
    todas = df[bolas].apply(pd.to_numeric)
    matriz = pd.DataFrame(0, index=range(1, 26), columns=range(1, 26))
    for _, row in todas.iterrows():
        nums = row.values
        for a, b in itertools.combinations(nums, 2):
            matriz.loc[a, b] += 1
            matriz.loc[b, a] += 1
    return matriz

# ---------------------- GERAÇÃO DE PALPITES ----------------------

def gerar_palpite(freq_global, freq_recente, correl, usados):
    """Gera um palpite ponderado por frequência + recência + correlação."""
    dezenas = list(range(1, 26))

    # cria peso híbrido: 70% histórico + 30% recente
    pesos = []
    for d in dezenas:
        base = freq_global.get(d, 1)
        rec = freq_recente.get(d, 1)
        pesos.append(base * 0.7 + rec * 0.3)
    pesos = np.array(pesos)
    pesos = pesos / pesos.sum()

    # gera dezenas iniciais ponderadas
    palp = set(random.choices(dezenas, weights=pesos, k=5))

    # completa com dezenas correlacionadas
    while len(palp) < 15:
        # calcula influência de correlação
        scores = []
        for d in dezenas:
            if d in palp:
                scores.append(0)
            else:
                cor = sum(correl.loc[d, list(palp)]) if len(palp) > 0 else 1
                scores.append(cor)
        scores = np.array(scores) + 1e-6
        scores = scores / scores.sum()

        prox = random.choices(dezenas, weights=scores, k=1)[0]
        palp.add(prox)

    palp = sorted(palp)

    # valida: não repetido e padrão pares/ímpares razoável
    tup = tuple(palp)
    if tup in usados:
        return None
    pares = sum(1 for d in palp if d % 2 == 0)
    if not (6 <= pares <= 9):
        return None
    return palp

# ---------------------- PRINCIPAL ----------------------

def gerar_palpites_inteligentes(df, qtd=3):
    bolas = [f"Bola{i}" for i in range(1, 16)]
    freq_global = frequencia_global(df, bolas)
    freq_recente = frequencia_recente(df, bolas, ultimos=100)
    correl = matriz_correlacao(df, bolas)

    # conjunto de combinações já sorteadas
    usados = set(tuple(sorted(map(int, r[bolas].values))) for _, r in df.iterrows())

    palpites = []
    tentativas = 0
    while len(palpites) < qtd and tentativas < 5000:
        p = gerar_palpite(freq_global, freq_recente, correl, usados)
        if p:
            palpites.append(p)
            usados.add(tuple(p))
        tentativas += 1

    return palpites, freq_global, freq_recente

# ---------------------- EXECUÇÃO ----------------------

if __name__ == "__main__":
    df, bolas = carregar_dados()
    palpites, freq_global, freq_recente = gerar_palpites_inteligentes(df)

    print("📊 Dezenas mais frequentes (histórico + recentes):")
    freq_mix = {d: freq_global.get(d, 0)*0.7 + freq_recente.get(d, 0)*0.3 for d in range(1,26)}
    for d, f in sorted(freq_mix.items(), key=lambda x: x[1], reverse=True):
        print(f"{d:02d}: {f:.1f}")

    print("\n🎯 Palpites inteligentes e inéditos (equilibrados):\n")
    for i, p in enumerate(palpites, 1):
        print(f"Palpite {i}: {' '.join(str(x).zfill(2) for x in p)}")
