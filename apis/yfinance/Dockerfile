FROM python:3.8.7-buster

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade --no-cache-dir -r requirements.txt

COPY main.py .

ENV FLASK_APP=main.py

ENTRYPOINT [ "python", "-m" ]
CMD [ "flask", "run", "--host=0.0.0.0" ]