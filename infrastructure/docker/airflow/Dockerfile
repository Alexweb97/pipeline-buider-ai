FROM apache/airflow:2.10.4-python3.11

# Install additional Python packages needed for ETL modules
USER airflow
RUN pip install --no-cache-dir \
    pandas==2.2.0 \
    requests==2.31.0 \
    httpx \
    'sqlalchemy<2.0,>=1.4.36'

# Set PYTHONPATH to include backend code
ENV PYTHONPATH="/app:/opt/airflow"
