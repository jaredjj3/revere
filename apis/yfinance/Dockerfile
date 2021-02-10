FROM python:3.8.7-buster

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade --no-cache-dir -r requirements.txt

COPY main.py .

ENV FLASK_APP=main.py

CMD [ "gunicorn", "main:app", "-w", "2", "--threads", "2", "-b", "0.0.0.0:5000" ]