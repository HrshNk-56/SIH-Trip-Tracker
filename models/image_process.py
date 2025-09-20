!pip install flask easyocr pandas opencv-python pillow --quiet

from flask import Flask, request, jsonify
import easyocr, pandas as pd, re, os
from datetime import datetime
from PIL import Image

app = Flask(_name_)

# -------- SETTINGS --------
BUDGET = 16000   # Your monthly budget
CSV_FILE = "expenses.csv"

# Load OCR reader once
reader = easyocr.Reader(['en'])

# -------- HELPERS --------
def ensure_jpg(image_path):
    """Convert .jpeg to .jpg if needed and return new path."""
    if image_path.lower().endswith(".jpeg"):
        new_path = image_path.rsplit(".", 1)[0] + ".jpg"
        img = Image.open(image_path)
        rgb = img.convert("RGB")   # ensure proper format
        rgb.save(new_path, "JPEG")
        os.remove(image_path)  # remove old file
        return new_path
    return image_path

def extract_total_from_image(image_path):
    """Extract largest number from bill image (assumed total)."""
    results = reader.readtext(image_path, detail=0)
    numbers = []
    for text in results:
        nums = re.findall(r"\d+\.\d+|\d+", text)
        numbers.extend([float(n) for n in nums])
    return max(numbers) if numbers else 0.0

def update_expenses(image_path):
    """Update CSV with new bill and return record dict."""
    total = extract_total_from_image(image_path)
    date = datetime.now().strftime("%Y-%m-%d")

    if os.path.exists(CSV_FILE):
        df = pd.read_csv(CSV_FILE)
        cumulative = df["Total"].sum() + total
    else:
        df = pd.DataFrame(columns=["Date", "BillName", "Total", "CumulativeSpent", "RemainingBudget", "Status"])
        cumulative = total

    remaining = BUDGET - cumulative
    if remaining < 0:
        status = "❌ Crossed"
    elif remaining < 0.2 * BUDGET:
        status = "⚠ Close to budget"
    else:
        status = "✅ Safe"

    new_row = {
        "Date": date,
        "BillName": os.path.basename(image_path),
        "Total": total,
        "CumulativeSpent": cumulative,
        "RemainingBudget": remaining,
        "Status": status
    }

    df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
    df.to_csv(CSV_FILE, index=False)

    return new_row

# -------- API ENDPOINTS --------
@app.route("/process_bill", methods=["POST"])
def process_bill():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files["file"]
    image_path = file.filename
    file.save(image_path)

    # ✅ Ensure jpeg → jpg
    image_path = ensure_jpg(image_path)

    result = update_expenses(image_path)
    return jsonify(result)

@app.route("/spent", methods=["GET"])
def spent():
    if not os.path.exists(CSV_FILE):
        return jsonify({"TotalSpent": 0, "RemainingBudget": BUDGET, "Status": "✅ Safe"})
    df = pd.read_csv(CSV_FILE)
    total = df["Total"].sum()
    remaining = BUDGET - total
    if remaining < 0:
        status = "❌ Crossed"
    elif remaining < 0.2 * BUDGET:
        status = "⚠ Close to budget"
    else:
        status = "✅ Safe"
    return jsonify({"TotalSpent": total, "RemainingBudget": remaining, "Status": status})

# -------- START SERVER --------
if _name_ == "_main_":
    app.run(debug=True)