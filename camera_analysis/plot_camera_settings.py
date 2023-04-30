import json
import matplotlib.pyplot as plt

# Read data from the data.json file
with open("data.json", "r") as file:
    data = json.load(file)

# Create camera configuration dictionaries
camera_configs = {1: [], "Other Cameras": []}

for entry in data:
    value = entry["value"]
    # Remove the leading 'f' and replace ',' with '.'
    interpretation = float(entry["interpretation"][1:].replace(",", "."))

    if "cameraIdInactive" in entry:
        inactive_cameras = entry["cameraIdInactive"]
    else:
        inactive_cameras = []

    if 1 not in inactive_cameras:
        camera_configs[1].append(
            {"value": value, "interpretation": interpretation})

    if not all(camera_id in inactive_cameras for camera_id in [2, 3, 4]):
        camera_configs["Other Cameras"].append(
            {"value": value, "interpretation": interpretation})

# Plot the camera lens configuration
fig, axs = plt.subplots(2, 1, figsize=(
    12, 12), gridspec_kw={'height_ratios': [3, 1]})
ax = axs[0]

for camera_id, config in camera_configs.items():
    x = [entry["value"] for entry in config]
    y = [entry["interpretation"] for entry in config]
    ax.plot(x, y, marker="o", linestyle="-", label=f"{camera_id}")

ax.set_xlabel("Value")
ax.set_ylabel("Aperture (f)")
ax.set_title("Camera Lens Configuration")
ax.legend()

# Create comparison table for Camera 1 vs Other Cameras
camera1_data = set((entry["value"], entry["interpretation"])
                   for entry in camera_configs[1])
other_cameras_data = set((entry["value"], entry["interpretation"])
                         for entry in camera_configs["Other Cameras"])

all_data = sorted(camera1_data | other_cameras_data, key=lambda x: x[0])
table_data = [["Value", "Aperture (f)", "Camera 1", "Other Cameras"]]
for value, interpretation in all_data:
    row = [value, "f" + str(interpretation).replace(".", ",")]
    if (value, interpretation) in camera1_data:
        row.append("X")
    else:
        row.append("")
    if (value, interpretation) in other_cameras_data:
        row.append("X")
    else:
        row.append("")
    table_data.append(row)

ax_table = axs[1]
ax_table.axis("off")
table = ax_table.table(cellText=table_data, colWidths=[
                       0.1, 0.25, 0.15, 0.15], cellLoc="center", loc="upper center")
table.auto_set_font_size(True)
# table.set_fontsize(10)
table.scale(1, 1.5)

fig.subplots_adjust(top=0.92)
fig.suptitle("Comparison of Camera 1 and Other Cameras", fontsize=14)

plt.tight_layout()
plt.show()
