FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    default-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r PythonBridge/requirements.txt

RUN javac -cp "Libraries/py4j0.10.9.9.jar:Libraries/json-20251224.jar" Engine/src/*.java

CMD sh -c 'echo "Booting container"; echo "Starting Java bridge"; java -cp "Engine/src:Libraries/py4j0.10.9.9.jar:Libraries/json-20251224.jar" Bridge & echo "Starting Python listener"; python -u PythonBridge/listener.py'