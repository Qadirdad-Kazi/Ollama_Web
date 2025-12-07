# Local Python API Example

This directory contains an example of how to set up a local API using Python (FastAPI) that is compatible with the Ollama Web interface.

This is useful if you want to:
1. Serve models that are not supported by Ollama directly.
2. Add custom logic, filtering, or logging to your model inference.
3. Use a different backend (e.g., HuggingFace Transformers, vLLM, llama-cpp-python) but keep the same UI.

## Prerequisites

- Python 3.8+
- `pip`

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   python main.py
   ```
   
   This will start the server on `http://localhost:11434`, mimicking the default Ollama port.
   **Note**: Make sure the actual Ollama service is stopped, or change the port in `main.py` and update the `OLLAMA_BASE_URL` in your `.env` file.

## Integration

To use this API with the Ollama Web app:

1. If running on port 11434 (default):
   - Just run the web app as usual. It will connect to this Python script instead of the real Ollama.

2. If running on a different port (e.g., 8000):
   - Update your `.env` file in the root of the web app:
     ```
     OLLAMA_BASE_URL=http://localhost:8000
     ```
   - Restart the web app.

## Customization

Edit `main.py` to integrate your own model. Look for the `TODO` comments in the `chat` function.

You can replace the mock response generator with calls to your own model inference code.
