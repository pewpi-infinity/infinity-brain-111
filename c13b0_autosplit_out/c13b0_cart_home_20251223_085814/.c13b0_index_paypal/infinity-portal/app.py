cat > app.py <<'PY'
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os, uuid
from ibm_watson import DiscoveryV2, NaturalLanguageUnderstandingV1

app = Flask(__name__)

def parse_multipart_form_data(req):
    if "file" not in req.files:
        raise ValueError("Missing file field")
    file = req.files["file"]
    metadata = req.form
    fname = secure_filename(file.filename or "upload.zip")
    tmp_path = os.path.join("/tmp", fname)
    file.save(tmp_path)
    return tmp_path, metadata

def trigger_analysis(path, meta):
    deploy_type = meta.get("deploymentType", "gpt")
    orchestration_id = str(uuid.uuid4())
    if deploy_type == "discovery":
        discovery = DiscoveryV2(
            version="2022-01-01",
            iam_apikey=os.getenv("DISCOVERY_API_KEY","demo"),
            url=os.getenv("DISCOVERY_URL","https://api.us-south.discovery.watson.cloud.ibm.com"),
        )
        result = {"service": "Discovery", "status": "mock success"}
    elif deploy_type == "nlu":
        nlu = NaturalLanguageUnderstandingV1(
            version="2022-01-01",
            iam_apikey=os.getenv("NLU_API_KEY","demo"),
            url=os.getenv("NLU_URL","https://api.us-south.natural-language-understanding.watson.cloud.ibm.com"),
        )
        result = {"service": "NLU", "status": "mock success"}
    else:
        result = {"service": "GPT", "status": "mock success"}
    return {"orchestrationId": orchestration_id, "result": result}

@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        tmp_path, meta = parse_multipart_form_data(request)
        result = trigger_analysis(tmp_path, meta)
        return jsonify({"status": "success", **result}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
PY

# ---------- dependencies ----------
cat > requirements.txt <<'REQ'
flask
werkzeug
ibm-watson
REQ

# ---------- optional Dockerfile ----------
cat > Dockerfile <<'DOCKER'
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8080
CMD ["python","app.py"]
DOCKER

# ---------- local run ----------
pip install -r requirements.txt
python app.py
