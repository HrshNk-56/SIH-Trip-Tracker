import os

def check_drive_file(file_path):
    return os.path.exists(file_path)


def get_plt_files(base_path):
    files = []
    for root, dirs, fs in os.walk(base_path):
        for f in fs:
            if f.endswith(".plt"):
                files.append(os.path.join(root, f))
    return files


import numpy as np
from math import radians, cos, sin, asin, sqrt
import pandas as pd

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = map(radians, [lat1, lat2])
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi/2)**2 + cos(phi1)*cos(phi2)*sin(dlambda/2)**2
    return 2*R*asin(sqrt(a))

def preprocess_trajectory(file_path):
    df = read_plt(file_path)
    df['lat_prev'] = df['lat'].shift(1)
    df['lon_prev'] = df['lon'].shift(1)
    df['time_prev'] = df['time'].shift(1)
    df = df.dropna()
    df['dist_m'] = df.apply(lambda r: haversine(r.lat_prev, r.lon_prev, r.lat, r.lon), axis=1)
    df['time_diff_s'] = (pd.to_datetime(df['time']) - pd.to_datetime(df['time_prev'])).dt.total_seconds().clip(lower=0.1)
    df['speed_mps'] = df['dist_m'] / df['time_diff_s']
    return df[['lat','lon','dist_m','time_diff_s','speed_mps']]


def read_plt(file_path):
    df = pd.read_csv(file_path, skiprows=6, header=None)
    df.columns = ['lat','lon','unused1','unused2','alt','date','time']
    df = df[['lat','lon','alt','date','time']]
    df['time'] = df['date'] + ' ' + df['time']
    return df[['lat','lon','time']]


def convert_all_trajectories(all_files):
    all_sequences = []
    for file_path in all_files:
        try:
            df_traj = preprocess_trajectory(file_path)
            seq = ["{:.5f},{:.5f},{:.2f}".format(lat, lon, speed)
                   for lat, lon, speed in zip(df_traj['lat'], df_traj['lon'], df_traj['speed_mps'])]
            all_sequences.append(seq)
        except:
            continue
    return all_sequences


import pickle

def save_sequences(all_sequences, path):
    with open(path, "wb") as f:
        pickle.dump(all_sequences, f)


import json
import pandas as pd

def save_sequences_as_csv_json(all_sequences, csv_path, json_path):
    # Convert list of sequences (list of list of strings) into DataFrame
    # Flatten with trajectory index
    records = []
    for traj_id, traj in enumerate(all_sequences):
        for step_id, point in enumerate(traj):
            lat, lon, spd = point.split(",")
            records.append({
                "trajectory_id": traj_id,
                "step_id": step_id,
                "lat": float(lat),
                "lon": float(lon),
                "speed_mps": float(spd)
            })

    df = pd.DataFrame(records)

    # Save CSV
    df.to_csv(csv_path, index=False)

    # Save JSON
    with open(json_path, "w") as f:
        json.dump(records, f, indent=2)

    print(f"✅ Saved CSV at {csv_path}")
    print(f"✅ Saved JSON at {json_path}")


import json
import pandas as pd

def save_sequences_as_csv_json(all_sequences, csv_path, json_path):
    # Convert list of sequences (list of list of strings) into DataFrame
    # Flatten with trajectory index
    records = []
    for traj_id, traj in enumerate(all_sequences):
        for step_id, point in enumerate(traj):
            lat, lon, spd = point.split(",")
            records.append({
                "trajectory_id": traj_id,
                "step_id": step_id,
                "lat": float(lat),
                "lon": float(lon),
                "speed_mps": float(spd)
            })

    df = pd.DataFrame(records)

    # Save CSV
    df.to_csv(csv_path, index=False)

    # Save JSON
    with open(json_path, "w") as f:
        json.dump(records, f, indent=2)

    print(f"✅ Saved CSV at {csv_path}")
    print(f"✅ Saved JSON at {json_path}")


# 1. Collect all .plt files
base_path = "/content/drive/MyDrive/Geolife"   # 👈 change if your .plt files are elsewhere
all_files = get_plt_files(base_path)

# 2. Convert trajectories into sequences
all_sequences = convert_all_trajectories(all_files)

# 3. Save as CSV + JSON
csv_out = "/content/drive/MyDrive/Geolife_all_sequences.csv"
json_out = "/content/drive/MyDrive/Geolife_all_sequences.json"

save_sequences_as_csv_json(all_sequences, csv_out, json_out)

print("✅ All sequences converted and saved to:")
print("   -", csv_out)
print("   -", json_out)


import numpy as np
import pickle

def load_sequences(npz_path=None, pkl_path=None):
    if npz_path and os.path.exists(npz_path):
        loaded = np.load(npz_path, allow_pickle=True)
        return loaded["sequences"]
    elif pkl_path and os.path.exists(pkl_path):
        with open(pkl_path, "rb") as f:
            return pickle.load(f)
    else:
        raise FileNotFoundError("No sequences file found")


def extract_features(traj):
    speeds = []
    for point in traj:
        try:
            _, _, spd = point.split(",")
            speeds.append(float(spd))
        except:
            continue
    if not speeds: return None
    return [np.mean(speeds), np.max(speeds), len(speeds)]


from sklearn.linear_model import LogisticRegression

def train_trip_classifier(all_sequences):
    features = []
    for traj in all_sequences:
        feat = extract_features(traj)
        if feat:
            features.append(feat)
    df = pd.DataFrame(features, columns=["avg_speed","max_speed","trip_length"])
    df["label"] = ["Business" if f[0]>3.0 or f[2]>500 else "Leisure" for f in features]
    clf = LogisticRegression(max_iter=500)
    clf.fit(df[["avg_speed","max_speed","trip_length"]], df["label"])
    return clf, df


!pip install easyocr
import easyocr


def init_ocr():
    reader = easyocr.Reader(['en'])
    return reader

def extract_amount_from_receipt(image_path, reader):
    import re
    results = reader.readtext(image_path, detail=0)
    text = " ".join(results)
    numbers = [float(n) for n in re.findall(r'\d+\.?\d*', text)]
    return max(numbers) if numbers else 0


def add_expense(image_path, reader, expenses, trip_budget):
    amount = extract_amount_from_receipt(image_path, reader)
    expenses.append(amount)
    total = sum(expenses)
    status = "✅ Within Budget" if total <= trip_budget else "⚠️ Budget Exceeded!"
    return total, status


def generate_trip_report(trip_category, expenses, trip_budget):
    total_expenses = sum(expenses)
    status = "✅ Within Budget" if total_expenses <= trip_budget else "⚠️ Budget Exceeded!"
    return {
        "trip_category": trip_category,
        "total_expenses": total_expenses,
        "budget": trip_budget,
        "status": status
    }
