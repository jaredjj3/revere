FROM python:3.7.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY Pipfile .
COPY Pipfile.lock .

RUN pipenv install

COPY main.py .

ENV FLASK_APP=main.py

ENTRYPOINT [ "pipenv", "run" ]
CMD [ "flask", "run", "--host=0.0.0.0" ]