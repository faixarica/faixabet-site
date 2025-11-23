import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, select, Table, MetaData
from sqlalchemy.orm import sessionmaker
import threading
from data import load_cache, prepare_data, save_cache, file_lock
from model import load_or_train_model
from prediction import generate_predictions
from config import config

# Carregar variáveis de ambiente
load_dotenv()
DATABASE_URL = os.getenv('database_url')
if not DATABASE_URL:
    raise ValueError("A variável 'database_url' não foi encontrada no arquivo .env.")

# Configurar SQLAlchemy
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

# Fuso horário
tz = pytz.timezone('America/Sao_Paulo')

def display_menu():
    print("\n=== Menu de Configuração do Modelo Causal ===")
    print("1. Usar modelo padrão (depth=1, subconjunto reduzido) - Rápido e eficiente")
    print("2. Usar modelo Gold (depth=2, subconjunto completo) - Mais preciso (apenas plano Gold)")
    print("3. Atualizar modelo manualmente (escolha mensal)")
    print("4. Sair")
    return input("Escolha uma opção (1-4): ")

def main():
    # Passo 1: Verificar limite de palpites
    metadata = MetaData()
    client_table = Table('client', metadata, autoload_with=engine)
    client_plans_table = Table('client_plans', metadata, autoload_with=engine)
    plans_table = Table('plans', metadata, autoload_with=engine)

    plan_query = session.execute(
        select(plans_table.c.max_bets_per_day, plans_table.c.name)
        .select_from(client_table.join(client_plans_table).join(plans_table))
        .where(client_table.c.id == config.client_id)
    )
    plan_data = plan_query.fetchone()
    if plan_data is None:
        raise ValueError(f"Plano não encontrado para o cliente ID {config.client_id}.")
    max_bets_per_day, plan_name = plan_data
    if config.num_palpites > max_bets_per_day:
        raise ValueError(f"Excede limite diário ({max_bets_per_day}).")

    # Determinar modelo
    use_complex_model = False
    choice = display_menu()
    if choice == '2' and plan_name == 'Gold':
        use_complex_model = True
    elif choice == '3':
        if input("Confirmar atualização? (s/n): ").lower() == 's':
            config.last_update = datetime.now(tz)
        else:
            choice = '1'
    elif choice not in ['1', '4']:
        choice = '1'
    if choice == '4':
        exit()

    # Passo 2: Carregar dados
    cache = load_cache(config)
    if cache and datetime.now(tz) < config.last_update.replace(day=28) + pd.Timedelta(days=31):
        df, binary_df, historical_results = cache
    else:
        X, y, df, binary_df, historical_results = prepare_data(engine, session)
        save_cache(df, binary_df, historical_results, config)

    # Passo 4: Preparar dados para treinamento
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Passo 5: Carregar ou treinar modelo
    model, causal_weights = load_or_train_model(config, X_train, y_train, X_test, y_test, binary_df)

    # Passo 6: Gerar palpites
    palpites = generate_predictions(model, X_test, config.num_palpites, config.max_attempts, causal_weights, historical_results, config)

    # Passo 7: Gravar palpites
    bets_table = Table('bets', metadata, autoload_with=engine)
    with file_lock:
        for palpite in palpites:
            session.execute(bets_table.insert().values(
                client_id=config.client_id,
                method='Causal' if use_complex_model else 'Standard',
                created_at=datetime.now(tz),
                validated_at='N',
                validated_date=None,
                **{f'num_{j}': palpite[j-1] for j in range(1, 16)}
            ))

    # Passo 8: Atualizar bets_used
    with file_lock:
        session.execute(client_plans_table.update().where(client_plans_table.c.client_id == config.client_id).values(
            bets_used=client_plans_table.c.bets_used + config.num_palpites
        ))

    # Passo 9: Registrar log
    log_table = Table('log_user', metadata, autoload_with=engine)
    with file_lock:
        session.execute(log_table.insert().values(client_id=config.client_id, start_date=datetime.now(tz)))
    session.commit()

    # Passo 10: Gerar relatório
    report = f"""
Relatório de Análise de Loteria
=============================
ID do Cliente: {config.client_id}
Nome do Cliente: {config.user_name}
Data: {datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S %Z')}
Plano: {plan_name}
Modelo Usado: {'Causal (Gold)' if use_complex_model else 'Standard'}
Última Atualização: {config.last_update.strftime('%Y-%m-%d %H:%M:%S %Z')}
=============================
Palpites Gerados: {config.num_palpites}
"""
    for i, palpite in enumerate(palpites, 1):
        report += f"Palpite {i}: {palpite}\n"
    print(report)

    with file_lock:
        with open(f'relatorio_loteria_{config.client_id}.txt', 'w', encoding='utf-8') as f:
            f.write(report)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Erro inesperado: {e}")
        raise